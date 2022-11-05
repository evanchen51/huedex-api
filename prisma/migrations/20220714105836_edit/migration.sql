/*
  Warnings:

  - A unique constraint covering the columns `[followerId,languageCode]` on the table `FollowLanguage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[followerId,regionId]` on the table `FollowRegion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[followerId,topicId]` on the table `FollowTopic` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[followerId,userId]` on the table `FollowUser` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AnonymousVote" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "AnonymousVote_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Vote_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "FollowLanguage_followerId_languageCode_key" ON "FollowLanguage"("followerId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "FollowRegion_followerId_regionId_key" ON "FollowRegion"("followerId", "regionId");

-- CreateIndex
CREATE UNIQUE INDEX "FollowTopic_followerId_topicId_key" ON "FollowTopic"("followerId", "topicId");

-- CreateIndex
CREATE UNIQUE INDEX "FollowUser_followerId_userId_key" ON "FollowUser"("followerId", "userId");
