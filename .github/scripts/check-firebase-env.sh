#!/usr/bin/env bash
# Checks the Firebase web config secrets before the build, without printing them.
# A missing or malformed value ships a site that fails on load with auth/invalid-api-key.
set -u
problems=0
fail() { echo "::error::$1"; problems=1; }

for v in VITE_API_KEY VITE_AUTH_DOMAIN VITE_PROJECT_ID VITE_STORAGE_BUCKET VITE_MESSAGING_SENDER_ID VITE_APP_ID; do
  val="${!v-}"
  if [ -z "$val" ]; then fail "GitHub secret $v is missing or empty"; continue; fi
  trimmed="$(printf '%s' "$val" | tr -d '[:space:]')"
  [ "$trimmed" = "$val" ] || fail "GitHub secret $v contains spaces or line breaks"
  case "$val" in *\"*|*\'*) fail "GitHub secret $v contains quotes; paste the value without them" ;; esac
  case "$val" in *VITE_*|*=*) fail "GitHub secret $v contains a name or '='; paste only the value after '='" ;; esac
done

key="${VITE_API_KEY-}"
if [ -n "$key" ] && ! [[ "$key" =~ ^AIza[0-9A-Za-z_-]{35}$ ]]; then
  fail "GitHub secret VITE_API_KEY does not look like a Firebase web API key (should be 39 characters starting with AIza; got ${#key} characters)"
fi

[ "$problems" = 0 ] || { echo "Fix these in Settings > Secrets and variables > Actions, then re-run this job."; exit 1; }
echo "Firebase config secrets look fine."
