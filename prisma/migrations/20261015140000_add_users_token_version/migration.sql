-- Версия токенов пользователя: access/refresh токены несут её в claim "tv",
-- инкремент отзывает все ранее выданные токены.
-- Существующие строки получают 0; токены без "tv" считаются версией 0.

-- AlterTable
ALTER TABLE "users" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;
