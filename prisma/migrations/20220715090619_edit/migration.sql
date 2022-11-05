/*
  Warnings:

  - The primary key for the `AnonymousVote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `FollowLanguage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `FollowTopic` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `FollowUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Language` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `MediaType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Option` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Poll` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PollTopic` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Topic` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserPersonalSetting` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Vote` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "AnonymousVote" DROP CONSTRAINT "AnonymousVote_optionId_fkey";

-- DropForeignKey
ALTER TABLE "AnonymousVote" DROP CONSTRAINT "AnonymousVote_pollId_fkey";

-- DropForeignKey
ALTER TABLE "AnonymousVote" DROP CONSTRAINT "AnonymousVote_voterId_fkey";

-- DropForeignKey
ALTER TABLE "FollowLanguage" DROP CONSTRAINT "FollowLanguage_followerId_fkey";

-- DropForeignKey
ALTER TABLE "FollowTopic" DROP CONSTRAINT "FollowTopic_followerId_fkey";

-- DropForeignKey
ALTER TABLE "FollowTopic" DROP CONSTRAINT "FollowTopic_topicId_fkey";

-- DropForeignKey
ALTER TABLE "FollowUser" DROP CONSTRAINT "FollowUser_followerId_fkey";

-- DropForeignKey
ALTER TABLE "FollowUser" DROP CONSTRAINT "FollowUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "Option" DROP CONSTRAINT "Option_pollId_fkey";

-- DropForeignKey
ALTER TABLE "Poll" DROP CONSTRAINT "Poll_anonymousPosterId_fkey";

-- DropForeignKey
ALTER TABLE "Poll" DROP CONSTRAINT "Poll_posterId_fkey";

-- DropForeignKey
ALTER TABLE "PollTopic" DROP CONSTRAINT "PollTopic_pollId_fkey";

-- DropForeignKey
ALTER TABLE "PollTopic" DROP CONSTRAINT "PollTopic_topicId_fkey";

-- DropForeignKey
ALTER TABLE "UserPersonalSetting" DROP CONSTRAINT "UserPersonalSetting_userId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_optionId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_pollId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_voterId_fkey";

-- AlterTable
ALTER TABLE "AnonymousVote" DROP CONSTRAINT "AnonymousVote_pkey",
ALTER COLUMN "pollId" SET DATA TYPE TEXT,
ALTER COLUMN "optionId" SET DATA TYPE TEXT,
ALTER COLUMN "voterId" SET DATA TYPE TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "AnonymousVote_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "AnonymousVote_id_seq";

-- AlterTable
ALTER TABLE "FollowLanguage" DROP CONSTRAINT "FollowLanguage_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "followerId" SET DATA TYPE TEXT,
ADD CONSTRAINT "FollowLanguage_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "FollowLanguage_id_seq";

-- AlterTable
ALTER TABLE "FollowTopic" DROP CONSTRAINT "FollowTopic_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "followerId" SET DATA TYPE TEXT,
ALTER COLUMN "topicId" SET DATA TYPE TEXT,
ADD CONSTRAINT "FollowTopic_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "FollowTopic_id_seq";

-- AlterTable
ALTER TABLE "FollowUser" DROP CONSTRAINT "FollowUser_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "followerId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "FollowUser_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "FollowUser_id_seq";

-- AlterTable
ALTER TABLE "Language" DROP CONSTRAINT "Language_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Language_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Language_id_seq";

-- AlterTable
ALTER TABLE "MediaType" DROP CONSTRAINT "MediaType_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "MediaType_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "MediaType_id_seq";

-- AlterTable
ALTER TABLE "Option" DROP CONSTRAINT "Option_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "pollId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Option_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Option_id_seq";

-- AlterTable
ALTER TABLE "Poll" DROP CONSTRAINT "Poll_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "posterId" SET DATA TYPE TEXT,
ALTER COLUMN "anonymousPosterId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Poll_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Poll_id_seq";

-- AlterTable
ALTER TABLE "PollTopic" DROP CONSTRAINT "PollTopic_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "pollId" SET DATA TYPE TEXT,
ALTER COLUMN "topicId" SET DATA TYPE TEXT,
ADD CONSTRAINT "PollTopic_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PollTopic_id_seq";

-- AlterTable
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Topic_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Topic_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "UserPersonalSetting" DROP CONSTRAINT "UserPersonalSetting_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserPersonalSetting_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "UserPersonalSetting_id_seq";

-- AlterTable
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_pkey",
ALTER COLUMN "pollId" SET DATA TYPE TEXT,
ALTER COLUMN "optionId" SET DATA TYPE TEXT,
ALTER COLUMN "voterId" SET DATA TYPE TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Vote_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Vote_id_seq";

-- AddForeignKey
ALTER TABLE "FollowLanguage" ADD CONSTRAINT "FollowLanguage_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowTopic" ADD CONSTRAINT "FollowTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowTopic" ADD CONSTRAINT "FollowTopic_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUser" ADD CONSTRAINT "FollowUser_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUser" ADD CONSTRAINT "FollowUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_anonymousPosterId_fkey" FOREIGN KEY ("anonymousPosterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollTopic" ADD CONSTRAINT "PollTopic_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollTopic" ADD CONSTRAINT "PollTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPersonalSetting" ADD CONSTRAINT "UserPersonalSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnonymousVote" ADD CONSTRAINT "AnonymousVote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnonymousVote" ADD CONSTRAINT "AnonymousVote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnonymousVote" ADD CONSTRAINT "AnonymousVote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
