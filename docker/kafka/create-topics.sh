#!/bin/sh
set -eu

bootstrap="${KAFKA_BOOTSTRAP_SERVERS:-kafka:9092}"
replication_factor="${KAFKA_TOPIC_REPLICATION_FACTOR:-1}"
topics="${KAFKA_TOPICS:-follow:3}"
kafka_topics="/opt/kafka/bin/kafka-topics.sh"

until "$kafka_topics" --bootstrap-server "$bootstrap" --list >/dev/null 2>&1; do
  echo "[kafka-init] waiting for $bootstrap"
  sleep 3
done

# Формат: name[:partitions[:retention.ms]], например follow:3,follow.dlq:3:2592000000
for spec in $(echo "$topics" | tr ',' ' '); do
  name="$(echo "$spec" | cut -d: -f1)"
  partitions="$(echo "$spec" | cut -s -d: -f2)"
  retention_ms="$(echo "$spec" | cut -s -d: -f3)"
  partitions="${partitions:-3}"

  set -- --config "min.insync.replicas=${KAFKA_TOPIC_MIN_ISR:-1}"
  if [ -n "$retention_ms" ]; then
    set -- "$@" --config "retention.ms=$retention_ms"
  fi

  "$kafka_topics" --bootstrap-server "$bootstrap" \
    --create --if-not-exists \
    --topic "$name" \
    --partitions "$partitions" \
    --replication-factor "$replication_factor" \
    "$@"

  echo "[kafka-init] topic '$name' is ready (partitions=$partitions, rf=$replication_factor${retention_ms:+, retention.ms=$retention_ms})"
done
