#!/usr/bin/env bash
# Credential Validation Script for Ice Cream Man
# Run before any build/deployment: ./scripts/validate-credentials.sh

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔐 Ice Cream Man - Credential Validation"
echo "========================================"

FAILED=0

# 1. EXPO_TOKEN validation
log_info "Checking EXPO_TOKEN..."
if command -v eas >/dev/null 2>&1; then
  if eas whoami >/dev/null 2>&1; then
    EXPO_USER=$(eas whoami 2>/dev/null | head -1)
    log_info "EXPO_TOKEN valid (user: $EXPO_USER)"
  else
    log_error "EXPO_TOKEN invalid or expired"
    log_info "Run: eas token create --scope write"
    FAILED=1
  fi
else
  log_error "eas CLI not installed"
  log_info "Run: pnpm add -g eas-cli"
  FAILED=1
fi

# 2. Google Play Service Account
log_info "Checking GOOGLE_PLAY_SERVICE_ACCOUNT_JSON..."
if [ -n "${GOOGLE_PLAY_SERVICE_ACCOUNT_JSON:-}" ]; then
  if echo "$GOOGLE_PLAY_SERVICE_ACCOUNT_JSON" | python3 -m json.tool >/dev/null 2>&1; then
    CLIENT_EMAIL=$(echo "$GOOGLE_PLAY_SERVICE_ACCOUNT_JSON" | python3 -c "import sys, json; print(json.load(sys.stdin).get('client_email', 'unknown'))")
    log_info "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON valid (client: $CLIENT_EMAIL)"
  else
    log_error "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON invalid JSON"
    FAILED=1
  fi
else
  log_warn "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON not set in environment"
  log_info "Set in GitHub Secrets or export GOOGLE_PLAY_SERVICE_ACCOUNT_JSON='...'"
fi

# 3. Android Keystore
log_info "Checking Android Keystore..."
KEYSTORE_PATH="$PROJECT_ROOT/keystore.jks"
if [ -f "$KEYSTORE_PATH" ]; then
  if [ -n "${ANDROID_KEYSTORE_PASSWORD:-}" ]; then
    if keytool -list -keystore "$KEYSTORE_PATH" -storepass "$ANDROID_KEYSTORE_PASSWORD" >/dev/null 2>&1; then
      EXPIRY=$(keytool -list -v -keystore "$KEYSTORE_PATH" -storepass "$ANDROID_KEYSTORE_PASSWORD" 2>/dev/null | grep "Valid from" | head -1)
      log_info "Keystore accessible${EXPIRY:+ ($EXPIRY)}"
    else
      log_error "Keystore password incorrect"
      FAILED=1
    fi
  else
    log_warn "ANDROID_KEYSTORE_PASSWORD not set in environment"
  fi
else
  log_warn "keystore.jks not found locally (OK for CI, required for local builds)"
fi

# 4. JWT Secret
log_info "Checking JWT_SECRET..."
if [ -n "${JWT_SECRET:-}" ]; then
  if [ ${#JWT_SECRET} -ge 64 ]; then
    log_info "JWT_SECRET length OK (${#JWT_SECRET} chars)"
  else
    log_error "JWT_SECRET too short (${#JWT_SECRET} chars, minimum 64)"
    FAILED=1
  fi
else
  log_warn "JWT_SECRET not set in environment"
fi

# 5. Database URL
log_info "Checking DATABASE_URL..."
if [ -n "${DATABASE_URL:-}" ]; then
  if [[ "$DATABASE_URL" =~ ^postgresql:// ]]; then
    log_info "DATABASE_URL format OK"
  else
    log_warn "DATABASE_URL doesn't look like PostgreSQL connection string"
  fi
else
  log_warn "DATABASE_URL not set in environment"
fi

# 6. OAuth Credentials
log_info "Checking OAuth credentials..."
if [ -n "${OAUTH_CLIENT_ID:-}" ] && [ -n "${OAUTH_CLIENT_SECRET:-}" ]; then
  log_info "OAuth credentials present"
else
  log_warn "OAuth credentials not fully set"
fi

# Summary
echo ""
echo "========================================"
if [ $FAILED -eq 0 ]; then
  log_info "🎉 All critical credentials validated!"
  exit 0
else
  log_error "❌ $FAILED critical credential check(s) failed"
  log_info "Fix the errors above before building/deploying"
  exit 1
fi