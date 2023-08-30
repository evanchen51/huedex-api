-- AlterTable
ALTER TABLE "Poll" ADD COLUMN     "pollTypeCode" TEXT;

-- CreateTable
CREATE TABLE "PollType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "info" TEXT NOT NULL,
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PollType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PollType_code_key" ON "PollType"("code");

-- AddForeignKey
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_pollTypeCode_fkey" FOREIGN KEY ("pollTypeCode") REFERENCES "PollType"("code") ON DELETE SET NULL ON UPDATE CASCADE;
