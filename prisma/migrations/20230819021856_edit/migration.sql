/*
  Warnings:

  - The primary key for the `Topic` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `Topic` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `Topic` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FollowTopic" DROP CONSTRAINT "FollowTopic_topicId_fkey";

-- DropForeignKey
ALTER TABLE "PollTopic" DROP CONSTRAINT "PollTopic_topicId_fkey";

-- DropIndex
DROP INDEX "Topic_name_key";

-- AlterTable
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_pkey",
DROP COLUMN "name",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Topic_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_id_key" ON "Topic"("id");

-- AddForeignKey
ALTER TABLE "FollowTopic" ADD CONSTRAINT "FollowTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollTopic" ADD CONSTRAINT "PollTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
