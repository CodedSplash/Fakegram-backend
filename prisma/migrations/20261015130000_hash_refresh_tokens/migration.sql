-- В БД теперь хранится только SHA-256 хеш refresh токена.
-- Старые строки содержат сырые токены: удаляем их, пользователи просто перелогинятся.
DELETE FROM "RefreshToken";

-- RenameColumn
ALTER TABLE "RefreshToken" RENAME COLUMN "token" TO "tokenHash";

-- AlterColumn
ALTER TABLE "RefreshToken" ALTER COLUMN "tokenHash" SET DATA TYPE CHAR(64);

-- RenameIndex
ALTER INDEX "RefreshToken_token_key" RENAME TO "RefreshToken_tokenHash_key";
