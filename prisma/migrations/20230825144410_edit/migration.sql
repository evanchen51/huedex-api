/*
  Warnings:

  - You are about to drop the `UserPersonalSetting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserPersonalSetting" DROP CONSTRAINT "UserPersonalSetting_displayLanguageCode_fkey";

-- DropForeignKey
ALTER TABLE "UserPersonalSetting" DROP CONSTRAINT "UserPersonalSetting_userId_fkey";

-- DropTable
DROP TABLE "UserPersonalSetting";

-- CreateTable
CREATE TABLE "UserPersonalSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayLanguageCode" TEXT,
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "googleId" TEXT,
    "password" TEXT,

    CONSTRAINT "UserPersonalSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPersonalSettings_userId_key" ON "UserPersonalSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPersonalSettings_email_key" ON "UserPersonalSettings"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserPersonalSettings_googleId_key" ON "UserPersonalSettings"("googleId");

-- AddForeignKey
ALTER TABLE "UserPersonalSettings" ADD CONSTRAINT "UserPersonalSettings_displayLanguageCode_fkey" FOREIGN KEY ("displayLanguageCode") REFERENCES "Language"("code") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPersonalSettings" ADD CONSTRAINT "UserPersonalSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
