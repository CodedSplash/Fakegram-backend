#!/bin/sh
set -eu

attempts="${MIGRATE_MAX_ATTEMPTS:-30}"
delay="${MIGRATE_RETRY_DELAY:-5}"
attempt=1

until npx prisma migrate deploy; do
  if [ "$attempt" -ge "$attempts" ]; then
    echo "[migrate] prisma migrate deploy failed after $attempt attempts" >&2
    exit 1
  fi
  echo "[migrate] database is not ready (attempt $attempt/$attempts), retry in ${delay}s"
  attempt=$((attempt + 1))
  sleep "$delay"
done

echo "[migrate] migrations applied"
