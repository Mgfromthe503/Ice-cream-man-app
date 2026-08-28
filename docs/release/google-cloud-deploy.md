# Google Cloud deployment guide

This guide deploys the Express + tRPC backend to **Cloud Run** and moves the
database to **Cloud SQL for PostgreSQL**, replacing the expiring Render free
tier. It assumes the account owner has already completed the interactive
logins below.

Prereq commands (run once, in a terminal in this repo):

```bash
gcloud auth login
gcloud config set project ice-cream-man-502123
gcloud auth application-default login   # optional, for local dev
```

## 1. Create the Cloud SQL instance + database

```bash
gcloud sql instances create ice-cream-man-db \
  --database-version=POSTGRES_15 \
  --region=us-central1 \
  --tier=db-f1-micro \
  --no-assign-ip \
  --require-ssl

gcloud sql databases create icecreamman --instance=ice-cream-man-db
gcloud sql users set-password postgres \
  --instance=ice-cream-man-db --password=<STRONG_PASSWORD>
```

Create the `DATABASE_URL` secret used by Cloud Run:

```bash
DATABASE_URL="postgresql://postgres:<STRONG_PASSWORD>@<CLOUD_SQL_PRIVATE_IP>:5432/icecreamman?sslmode=require"
printf '%s' "$DATABASE_URL" | gcloud secrets create databases/icecreamman --data-file=-
gcloud secrets create icm-jwt-secret \
  --data-file=<(node -e "process.stdout.write(require('crypto').randomBytes(64).toString('hex'))")
```

## 2. Grant the service account access

The Cloud Run runtime identity is the Play console service account. It needs
Cloud SQL Client, Secret Accessor, and Cloud Run roles. Enable the Cloud SQL
private service connect for the instance, or switch this deployment to a public
IP with an authorized network and `DATABASE_URL` pointing at the public IP.

## 3. Deploy with Cloud Build

```bash
gcloud builds submit --config cloudbuild.yaml
```

This builds the `Dockerfile` image and deploys to Cloud Run at:

```
https://ice-cream-man-api-<hash>-us-central1.a.run.app
```

## 4. Run migrations once

```bash
# From Cloud Shell (has gcloud + psql) or via a temporary Cloud Run/Cloud Build step:
pnpm db:push
```

Migration SQL files are committed at `drizzle/0000_*.sql`, `0001_*.sql`,
`0002_*.sql`.

## 5. Configure OAuth + backend purchase verification

The backend needs the same `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` used for Play
submission (stored as a Cloud Run secret, never in the repo). Grant that
service account the **Android Publisher API** access in Play Console so the
driver-registration purchase can be verified server-side.

## 6. Point the app at the new backend

Set the EAS environment variable `EXPO_PUBLIC_API_BASE_URL` to the Cloud Run
URL, then build the production AAB:

```bash
npx eas env:create --name EXPO_PUBLIC_API_BASE_URL --value "https://ice-cream-man-api-<hash>-us-central1.a.run.app" --environment production
npx eas build --platform android --profile production --non-interactive
```

> Cost note: the `$300` GCP trial credits cover a `db-f1-micro` Cloud SQL
> instance and a `max-instances=2` Cloud Run service well within the trial
> window. Keep `min-instances=0` so the API scales to zero between uses.
