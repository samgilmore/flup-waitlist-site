#!/usr/bin/env bash
set -euo pipefail

SIGNUP_RESPONSE=$(curl -sS -X POST "http://127.0.0.1:54321/functions/v1/signup-waitlist" \
  -H "Content-Type: application/json" \
  -d @tests/fixtures/signup-payload.json)

node -e '
const payload = JSON.parse(process.argv[1]);
if (!payload.referralCode || !payload.referralLink || payload.referralCount !== 0) {
  process.exit(1);
}
' "$SIGNUP_RESPONSE"
