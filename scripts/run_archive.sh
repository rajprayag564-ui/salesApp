#!/usr/bin/env bash
set -euo pipefail

# Usage: SUPABASE_URL=https://xyz.supabase.co SUPABASE_SERVICE_ROLE_KEY=... ./scripts/run_archive.sh [days] [limit]
# Example: SUPABASE_URL=https://proj.supabase.co SUPABASE_SERVICE_ROLE_KEY=KEY ./scripts/run_archive.sh 90 2000

SUPABASE_URL="${SUPABASE_URL:-}"
SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SERVICE_KEY" ]; then
  echo "ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment"
  exit 1
fi

DAYS=${1:-90}
LIMIT=${2:-2000}

echo "Calling archive_activity_feed with days=$DAYS limit=$LIMIT"

resp=$(curl -s -w "\nstatus:%{http_code}" -X POST "$SUPABASE_URL/rest/v1/rpc/archive_activity_feed" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"p_days\": $DAYS, \"p_limit\": $LIMIT}")

echo "$resp"

exit 0
