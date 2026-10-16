-- Индекс под keyset-пагинацию подписчиков, см. 20261015130100_add_follows_follower_keyset_index.
CREATE INDEX CONCURRENTLY IF NOT EXISTS "follows_followingId_createdAt_id_idx" ON "follows"("followingId", "createdAt" DESC, "id" DESC);
