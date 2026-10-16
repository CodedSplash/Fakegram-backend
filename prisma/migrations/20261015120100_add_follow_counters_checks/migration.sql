-- Счётчики не могут быть отрицательными. Перед добавлением ограничений
-- обнуляем значения, которые уже ушли в минус.
UPDATE "users" SET "followersCount" = 0 WHERE "followersCount" < 0;
UPDATE "users" SET "followingsCount" = 0 WHERE "followingsCount" < 0;

ALTER TABLE "users" ADD CONSTRAINT "users_followers_count_non_negative" CHECK ("followersCount" >= 0);
ALTER TABLE "users" ADD CONSTRAINT "users_followings_count_non_negative" CHECK ("followingsCount" >= 0);

-- Подписка на самого себя запрещена и на уровне БД.
ALTER TABLE "follows" ADD CONSTRAINT "follows_no_self_follow" CHECK ("followerId" <> "followingId");
