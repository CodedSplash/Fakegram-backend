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

for spec in $(echo "$topics" | tr ',' ' '); do
  name="${spec%%:*}"
  partitions="${spec#*:}"
  [ "$partitions" = "$spec" ] && partitions=3

  "$kafka_topics" --bootstrap-server "$bootstrap" \
    --create --if-not-exists \
    --topic "$name" \
    --partitions "$partitions" \
    --replication-factor "$replication_factor" \
    --config "min.insync.replicas=${KAFKA_TOPIC_MIN_ISR:-1}"

  echo "[kafka-init] topic '$name' is ready (partitions=$partitions, rf=$replication_factor)"
done
