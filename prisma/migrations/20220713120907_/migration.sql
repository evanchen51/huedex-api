/*
  Warnings:

  - You are about to drop the column `languageId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_languageId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "languageId",
ADD COLUMN     "languageCode" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE SET NULL ON UPDATE CASCADE;
