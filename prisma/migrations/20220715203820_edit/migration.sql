/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `googleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `UserPersonalSetting` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[googleId]` on the table `UserPersonalSetting` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `UserPersonalSetting` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_googleId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "googleId",
DROP COLUMN "password";

-- AlterTable
ALTER TABLE "UserPersonalSetting" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "password" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UserPersonalSetting_email_key" ON "UserPersonalSetting"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserPersonalSetting_googleId_key" ON "UserPersonalSetting"("googleId");
