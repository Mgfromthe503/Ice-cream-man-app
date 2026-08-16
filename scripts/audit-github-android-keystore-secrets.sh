#!/usr/bin/env bash
set -euo pipefail

# This read-only audit reports only whether conventional keystore-secret names
# are present and whether a temporary decoded candidate yields a public SHA-1
# certificate fingerprint. It never prints a secret, password, alias value,
# keystore byte, or certificate body. Temporary files are removed on exit.

key_variables=(
  KEYSTORE_BASE64
  KEYSTORE_JKS_BASE64
  ANDROID_KEYSTORE_BASE64
  ANDROID_KEYSTORE_JKS_BASE64
  RELEASE_KEYSTORE_BASE64
  UPLOAD_KEYSTORE_BASE64
  ANDROID_UPLOAD_KEYSTORE_BASE64
  GOOGLE_PLAY_UPLOAD_KEYSTORE_BASE64
  EAS_ANDROID_KEYSTORE_BASE64
  KEYSTORE_JKS
  ANDROID_KEYSTORE
  RELEASE_KEYSTORE
  UPLOAD_KEYSTORE
  ANDROID_UPLOAD_KEYSTORE
  GOOGLE_PLAY_UPLOAD_KEYSTORE
)

password_variables=(
  KEYSTORE_PASSWORD
  ANDROID_KEYSTORE_PASSWORD
  RELEASE_KEYSTORE_PASSWORD
  UPLOAD_KEYSTORE_PASSWORD
  KEY_PASSWORD
  ANDROID_KEY_PASSWORD
  RELEASE_KEY_PASSWORD
  UPLOAD_KEY_PASSWORD
)

workspace=$(mktemp -d)
trap 'rm -rf "$workspace"' EXIT

present_keys=()
present_passwords=()

for variable in "${key_variables[@]}"; do
  if [[ -n "${!variable:-}" ]]; then
    present_keys+=("$variable")
  fi
done

for variable in "${password_variables[@]}"; do
  if [[ -n "${!variable:-}" ]]; then
    present_passwords+=("$variable")
  fi
done

printf 'Key-material secret names present: %s\n' "${present_keys[*]:-none}"
printf 'Password secret names present: %s\n' "${present_passwords[*]:-none}"

for variable in "${present_keys[@]}"; do
  candidate="$workspace/$variable.bin"
  value="${!variable}"

  # A binary JKS cannot safely be represented as a raw environment variable.
  # Accept only base64-encoded candidate names so secret bytes are never echoed.
  if [[ "$variable" != *BASE64 ]]; then
    continue
  fi
  if ! printf '%s' "$value" | base64 --decode > "$candidate" 2>/dev/null; then
    continue
  fi

  if ! file --brief "$candidate" | grep -qi 'Java KeyStore'; then
    continue
  fi

  printf 'Java KeyStore candidate found in secret name: %s\n' "$variable"

  for password_variable in "${present_passwords[@]}"; do
    listing="$workspace/$variable-$password_variable.txt"
    if keytool -list -v -keystore "$candidate" -storepass "${!password_variable}" > "$listing" 2>/dev/null; then
      sha1=$(grep -E '^\s*SHA1:' "$listing" | head -n 1 | sed 's/^[[:space:]]*SHA1:[[:space:]]*//')
      if [[ -n "$sha1" ]]; then
        printf 'Readable certificate fingerprint: %s (keystore secret %s; password secret %s)\n' "$sha1" "$variable" "$password_variable"
      fi
    fi
  done
done
