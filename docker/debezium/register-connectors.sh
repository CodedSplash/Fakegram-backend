#!/bin/sh
set -eu

connect_url="${CONNECT_URL:-http://kafka-connect:8083}"
connectors_dir="${CONNECTORS_DIR:-/debezium/connectors}"
attempts="${REGISTER_MAX_ATTEMPTS:-40}"
delay="${REGISTER_RETRY_DELAY:-5}"
response="/tmp/connect-response.json"

until curl -fsS "$connect_url/connectors" >/dev/null 2>&1; do
  echo "[debezium-init] waiting for Kafka Connect at $connect_url"
  sleep 3
done

for file in "$connectors_dir"/*.json; do
  [ -e "$file" ] || continue
  name="$(basename "$file" .json)"
  attempt=1

  while :; do
    status="$(curl -sS -o "$response" -w '%{http_code}' \
      -X PUT -H 'Content-Type: application/json' \
      --data @"$file" \
      "$connect_url/connectors/$name/config" || echo 000)"

    case "$status" in
      200|201)
        echo "[debezium-init] connector '$name' registered (HTTP $status)"
        break
        ;;
    esac

    if [ "$attempt" -ge "$attempts" ]; then
      echo "[debezium-init] connector '$name' failed (HTTP $status):" >&2
      cat "$response" >&2 || true
      exit 1
    fi

    echo "[debezium-init] connector '$name' not registered yet (HTTP $status, attempt $attempt/$attempts)"
    cat "$response" 2>/dev/null || true
    echo
    attempt=$((attempt + 1))
    sleep "$delay"
  done
done

curl -fsS "$connect_url/connectors?expand=status" || true
echo
