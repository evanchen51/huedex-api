/*
  Warnings:

  - You are about to drop the column `info` on the `MediaType` table. All the data in the column will be lost.
  - Added the required column `description` to the `MediaType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MediaType" DROP COLUMN "info",
ADD COLUMN     "description" TEXT NOT NULL;
