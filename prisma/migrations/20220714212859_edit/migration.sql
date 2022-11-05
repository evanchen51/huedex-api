/*
  Warnings:

  - You are about to drop the column `name` on the `Topic` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[text]` on the table `Topic` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `text` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Topic_name_key";

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "name",
ADD COLUMN     "text" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Topic_text_key" ON "Topic"("text");
