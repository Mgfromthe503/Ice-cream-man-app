# Ice Cream Man - Credential Management & Automation Guide

## Overview
This document defines the automated credential management system for all deployments, launches, and builds.

## Credential Inventory

| Credential | Purpose | Storage | Rotation |
|------------|---------|---------|----------|
| **EXPO_TOKEN** | EAS CLI authentication | GitHub Secrets / Local keychain | 90 days |
| **GOOGLE_PLAY_SERVICE_ACCOUNT_JSON** | Play Console submission + backend verification | GitHub Secrets / GCP Secret Manager | 90 days |
| **ANDROID_KEYSTORE** (keystore.jks) | App signing for Play Store | Encrypted file + GCP Secret Manager | Yearly |
| **ANDROID_KEYSTORE_PASSWORD** | Keystore unlock | GCP Secret Manager | Yearly |
| **ANDROID_KEY_PASSWORD** | Key unlock | GCP Secret Manager | Yearly |
| **JWT_SECRET** | Session signing | GCP Secret Manager / .env.local | 90 days |
| **DATABASE_URL** | Database connection | GCP Secret Manager | 90 days |
| **OAUTH_CLIENT_ID / SECRET** | Google OAuth | GCP Secret Manager | 90 days |
| **GOOGLE_CLOUD_PROJECT** | Project identifier | Environment variable | N/A |

## Automated Setup

### 1. GitHub Repository Secrets (Required)
Go to: `https://github.com/Mgfromthe503/Ice-cream-man-app/settings/secrets/actions`

| Secret Name | Value Source |
|-------------|--------------|
| `EXPO_TOKEN` | `eas token create --scope write` |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Full JSON from GCP service account |

### 2. Google Cloud Secret Manager (Production Secrets)
```bash
# Create secrets in GCP project: ice-cream-man-502123
gcloud secrets create expo-token --data-file=-
gcloud secrets create google-play-service-account --data-file=-
gcloud secrets create android-keystore-password --data-file=-
gcloud secrets create android-key-password --data-file=-
gcloud secrets create jwt-secret --data-file=-
gcloud secrets create database-url --data-file=-
gcloud secrets create oauth-client-id --data-file=-
gcloud secrets create oauth-client-secret --data-file=-
```

### 3. Android Keystore Setup (One-time)
```bash
# Generate keystore (run once, store securely)
keytool -genkeypair -v \
  -keystore keystore.jks \
  -alias icecreamman \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass <STORE_PASSWORD> \
  -keypass <KEY_PASSWORD> \
  -dname "CN=Mindy Gaines, OU=503Innovations, O=503Innovations, L=Beaverton, ST=OR, C=US"

# Upload to GCP Secret Manager
gcloud secrets create android-keystore --data-file=keystore.jks
gcloud secret versions add android-keystore-password --data-file=-
gcloud secret versions add android-key-password --data-file=-
```

### 4. Local Development Credentials (Keychain)
```bash
# macOS/Linux: Use system keychain
security add-generic-password -a "ice-cream-man" -s "expo-token" -w "$EXPO_TOKEN"
security add-generic-password -a "ice-cream-man" -s "android-keystore-password" -w "$KEYSTORE_PASSWORD"

# Windows: Use Credential Manager
cmdkey /add:ice-cream-man /user:expo-token /pass:"$EXPO_TOKEN"
```

## Automated Validation

### Pre-deployment Checklist (Runs in CI)
```yaml
# .github/workflows/credential-validation.yml
- Verify EXPO_TOKEN is valid (eas whoami)
- Verify GOOGLE_PLAY_SERVICE_ACCOUNT_JSON parses as valid JSON
- Verify service account has androidpublisher scope
- Verify keystore can be loaded with provided passwords
- Verify JWT_SECRET meets entropy requirements
- Verify DATABASE_URL is valid PostgreSQL connection string
```

### Local Pre-flight Script
```bash
#!/bin/bash
# scripts/validate-credentials.sh

set -e

echo "🔐 Validating credentials..."

# 1. Expo token
if ! eas whoami > /dev/null 2>&1; then
  echo "❌ EXPO_TOKEN invalid or not set"
  exit 1
fi
echo "✅ EXPO_TOKEN valid"

# 2. Google Play service account
if [ -z "$GOOGLE_PLAY_SERVICE_ACCOUNT_JSON" ]; then
  echo "❌ GOOGLE_PLAY_SERVICE_ACCOUNT_JSON not set"
  exit 1
fi
if ! echo "$GOOGLE_PLAY_SERVICE_ACCOUNT_JSON" | jq -e '.client_email' > /dev/null; then
  echo "❌ GOOGLE_PLAY_SERVICE_ACCOUNT_JSON invalid JSON"
  exit 1
fi
echo "✅ GOOGLE_PLAY_SERVICE_ACCOUNT_JSON valid"

# 3. Android keystore
if [ ! -f "keystore.jks" ]; then
  echo "⚠️ keystore.jks not found locally (OK for CI)"
else
  if ! keytool -list -keystore keystore.jks -storepass "$ANDROID_KEYSTORE_PASSWORD" > /dev/null 2>&1; then
    echo "❌ Keystore password incorrect"
    exit 1
  fi
  echo "✅ Keystore accessible"
fi

# 4. JWT secret entropy
if [ ${#JWT_SECRET} -lt 64 ]; then
  echo "❌ JWT_SECRET too short (minimum 64 chars)"
  exit 1
fi
echo "✅ JWT_SECRET valid"

echo "🎉 All credentials validated"
```

## Credential Rotation Automation

### Scheduled Rotation (GitHub Actions)
```yaml
# .github/workflows/credential-rotation.yml
name: Credential Rotation Check
on:
  schedule:
    - cron: '0 0 1 */3 *'  # Quarterly
  workflow_dispatch:

jobs:
  check-rotation:
    runs-on: ubuntu-latest
    steps:
      - name: Check EXPO_TOKEN age
        run: |
          # Check token creation date via Expo API
          # Alert if > 90 days
      
      - name: Check GCP service account key age
        run: |
          # Use gcloud iam service-accounts keys list
          # Alert if > 90 days
      
      - name: Check keystore expiry
        run: |
          # keytool -list -v -keystore keystore.jks
          # Alert if < 1 year remaining
      
      - name: Create rotation issue
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: 'Mgfromthe503',
              repo: 'Ice-cream-man-app',
              title: '🔐 Credential Rotation Required',
              body: 'One or more credentials need rotation...'
            })
```

## Secure Access Patterns

### Local Development (.env.local)
```bash
# .env.local (gitignored)
EXPO_TOKEN=your-token
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON={"client_email": "...", "private_key": "..."}
JWT_SECRET=your-64-char-secret
DATABASE_URL=postgresql://...
```

### Production (Cloud Run)
```yaml
# cloudbuild.yaml substitutes from Secret Manager
substitutions:
  _JWT_SECRET: ${{ secrets.JWT_SECRET }}
  _DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### EAS Build Profiles (eas.json)
```json
{
  "build": {
    "production": {
      "credentialsSource": "remote",
      "android": {
        "credentialsSource": "remote"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json"
      }
    }
  }
}
```

## Quick Commands

```bash
# Validate all credentials locally
./scripts/validate-credentials.sh

# Rotate EXPO_TOKEN
eas token revoke --all
eas token create --scope write

# Rotate GCP service account key
gcloud iam service-accounts keys create new-key.json \
  --iam-account=play-console-service-account@project.iam.gserviceaccount.com

# Update GitHub secret (manual via UI or gh CLI)
gh secret set GOOGLE_PLAY_SERVICE_ACCOUNT_JSON --body "$(cat new-key.json)"

# Verify Android keystore
keytool -list -v -keystore keystore.jks -storepass $ANDROID_KEYSTORE_PASSWORD
```

## Security Notes
- Never commit `.env.local`, `keystore.jks`, or service account JSON to git
- Use `pnpm verify:deps` to ensure no compromised dependencies
- Run `pnpm audit --prod` before each release
- Enable 2FA on all accounts (Expo, GitHub, Google Cloud, Play Console)
- Use separate service accounts for CI vs production backend