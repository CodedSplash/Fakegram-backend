-- Публикация для Debezium: только outbox и только INSERT.
-- Строка outbox удаляется в той же транзакции, DELETE коннектору не нужен.
-- Публикация FOR ALL TABLES (старый init-db.sh) через ALTER не меняется:
-- её нужно один раз удалить суперпользователем, см. docs/DOCKER.md.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'dbz_publication') THEN
    CREATE PUBLICATION dbz_publication FOR TABLE "public"."outbox_events" WITH (publish = 'insert');
  ELSE
    ALTER PUBLICATION dbz_publication SET TABLE "public"."outbox_events";
    ALTER PUBLICATION dbz_publication SET (publish = 'insert');
  END IF;
END $$;
