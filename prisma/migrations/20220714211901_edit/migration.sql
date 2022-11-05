/*
  Warnings:

  - You are about to drop the column `text` on the `Topic` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Topic` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Topic_text_key";

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "text",
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_key" ON "Topic"("name");
