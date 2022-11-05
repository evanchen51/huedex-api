/*
  Warnings:

  - The primary key for the `AnonymousVote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `AnonymousVote` table. All the data in the column will be lost.
  - The primary key for the `Vote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Vote` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AnonymousVote" DROP CONSTRAINT "AnonymousVote_pkey",
DROP COLUMN "id";

-- AlterTable
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_pkey",
DROP COLUMN "id";
