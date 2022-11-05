/*
  Warnings:

  - You are about to drop the column `text` on the `Topic` table. All the data in the column will be lost.
  - Added the required column `name` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Topic_text_key";

-- AlterTable
ALTER TABLE "Topic"
RENAME COLUMN "text" TO "name";

-- AlterTable
ALTER TABLE "UserPersonalSetting" ALTER COLUMN "displayLanguageCode" SET DEFAULT 'un';
