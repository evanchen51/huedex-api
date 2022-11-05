/*
  Warnings:

  - A unique constraint covering the columns `[pollId,voterId]` on the table `AnonymousVote` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pollId,voterId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "AnonymousVote_voterId_pollId_key";

-- DropIndex
DROP INDEX "Vote_voterId_pollId_key";

-- CreateIndex
CREATE UNIQUE INDEX "AnonymousVote_pollId_voterId_key" ON "AnonymousVote"("pollId", "voterId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_pollId_voterId_key" ON "Vote"("pollId", "voterId");
