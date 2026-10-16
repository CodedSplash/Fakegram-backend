-- Индекс под keyset-пагинацию подписок: WHERE "followerId" = $1 ORDER BY "createdAt" DESC, "id" DESC.
-- CONCURRENTLY не блокирует запись в follows и не работает в транзакции, поэтому
-- в миграции ровно один оператор. Если сборка прервалась, удалить INVALID-индекс
-- (DROP INDEX CONCURRENTLY) и применить миграцию заново.
CREATE INDEX CONCURRENTLY IF NOT EXISTS "follows_followerId_createdAt_id_idx" ON "follows"("followerId", "createdAt" DESC, "id" DESC);
