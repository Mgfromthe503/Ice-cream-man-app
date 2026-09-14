# Google Cloud deployment guide

This guide deploys the Express + tRPC backend to **Cloud Run** and moves the
database to **Cloud SQL for PostgreSQL**, replacing the expiring Render free
tier. The Cloud SQL instance **already exists**: `ice-cream-db` in `us-west1`,
region must match for Cloud Run.

Prereq commands (run once, in a terminal in this repo):

```bash
gcloud auth login
gcloud config set project ice-cream-man-502123
```

## 1. Cloud SQL instance (already created)

The instance `ice-cream-db` exists in **us-west1** (PostgreSQL 15, public IP
`136.66.220.26`) with an empty `icecreamman` database.

Set/confirm the `postgres` user password (only you know it; reset to a strong
value if unsure):

```bash
gcloud sql users set-password postgres \
  --instance=ice-cream-db --password=<STRONG_PASSWORD>
```

Create the secrets Cloud Run reads. The app connects through the **Cloud SQL
Auth Proxy on localhost (`127.0.0.1:5432`)**, so `DATABASE_URL` must point
there — NOT the public/private IP, and NO `?sslmode=require` (the proxy
handles the encrypted leg):

```bash
DATABASE_URL="postgresql://postgres:<STRONG_PASSWORD>@127.0.0.1:5432/icecreamman"
printf '%s' "$DATABASE_URL" | gcloud secrets create databases/icecreamman --data-file=-
gcloud secrets create icm-jwt-secret \
  --data-file=<(node -e "process.stdout.write(require('crypto').randomBytes(64).toString('hex'))")
# The Play service-account JSON (from the downloaded key) — JSON has newlines:
gcloud secrets create google-play-svc --data-file=./google-service-account.json
```

## 2. Grant the service account access

The Cloud Run runtime identity is `play-console-service-account-f@...`. It
needs roles so it can talk to Cloud SQL (via the proxy) and read secrets:

```bash
SA="play-console-service-account-f@ice-cream-man-502123.iam.gserviceaccount.com"
gcloud projects add-iam-policy-binding ice-cream-man-502123 \
  --member="serviceAccount:$SA" \
  --role="roles/cloudsql.client"
gcloud projects add-iam-policy-binding ice-cream-man-502123 \
  --member="serviceAccount:$SA" \
  --role="roles/secretmanager.secretAccessor"
```

## 3. Deploy with Cloud Build

Pass the OAuth + owner env values as substitutions (they are required by the
backend's `sdk.ts`/`db.ts`):

```bash
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions=_APP_ID=<your-app-id>,_OAUTH_SERVER_URL=<oauth-base-url>,_OWNER_OPEN_ID=<owner-openid>
```

This builds the `Dockerfile` image and deploys to Cloud Run at:

```
https://ice-cream-man-api-<hash>-us-west1.a.run.app
```

## 4. Run migrations once (in Cloud Shell, has gcloud + psql)

Apply the committed SQL files in dependency order, then add the `arrived`
enum value. Use your POSTGRES password in `PGPASSWORD`:

```bash
export PGPASSWORD='<STRONG_PASSWORD>'
CONN="postgresql://postgres@localhost:5432/icecreamman"
psql "$CONN" -f drizzle/0000_initial_schema.sql
psql "$CONN" -f drizzle/0001_vendor_entitlements.sql
psql "$CONN" -f drizzle/0002_add_driver_tables.sql
psql "$CONN" -f drizzle/0003_add_arrived_status.sql
```

(From Cloud Shell this reaches the DB via its public IP. If Cloud Shell's egress
is blocked, add the Cloud Shell IP to the instance's authorized networks
temporarily, or run the migration from a one-off Cloud Build step.)

## 5. Configure backend purchase verification

The backend needs `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` (stored as the
`google-play-svc` Cloud Run secret) to verify driver-registration purchases
server-side. Grant that service account the **Android Publisher API** access in
Play Console.

## 6. Point the app at the new backend

Set the EAS environment variable `EXPO_PUBLIC_API_BASE_URL` to the Cloud Run
URL, then build the production AAB:

```bash
npx eas env:create --name EXPO_PUBLIC_API_BASE_URL --value "https://ice-cream-man-api-<hash>-us-west1.a.run.app" --environment production
npx eas build --platform android --profile production --non-interactive
```

> Cost note: the `$300` GCP trial credits cover a `db-f1-micro` Cloud SQL
> instance and a `max-instances=2` Cloud Run service well within the trial
> window. Keep `min-instances=0` so the API scales to zero between uses.
