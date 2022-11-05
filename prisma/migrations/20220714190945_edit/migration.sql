/*
  Warnings:

  - You are about to drop the column `regionId` on the `Poll` table. All the data in the column will be lost.
  - You are about to drop the column `regionId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `FollowRegion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Region` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[optionId,pollId,voterId]` on the table `AnonymousVote` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[optionId,pollId,voterId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "FollowRegion" DROP CONSTRAINT "FollowRegion_followerId_fkey";

-- DropForeignKey
ALTER TABLE "FollowRegion" DROP CONSTRAINT "FollowRegion_regionId_fkey";

-- DropForeignKey
ALTER TABLE "Poll" DROP CONSTRAINT "Poll_regionId_fkey";

-- DropForeignKey
ALTER TABLE "Region" DROP CONSTRAINT "Region_parentId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_regionId_fkey";

-- DropIndex
DROP INDEX "AnonymousVote_pollId_voterId_key";

-- DropIndex
DROP INDEX "Vote_pollId_voterId_key";

-- AlterTable
ALTER TABLE "Poll" DROP COLUMN "regionId",
ADD COLUMN     "numOfChoices" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "regionId";

-- DropTable
DROP TABLE "FollowRegion";

-- DropTable
DROP TABLE "Region";

-- CreateIndex
CREATE UNIQUE INDEX "AnonymousVote_optionId_pollId_voterId_key" ON "AnonymousVote"("optionId", "pollId", "voterId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_optionId_pollId_voterId_key" ON "Vote"("optionId", "pollId", "voterId");
