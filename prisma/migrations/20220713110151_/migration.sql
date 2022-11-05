-- AlterTable
ALTER TABLE "Poll" ADD COLUMN     "regionId" INTEGER;

-- AddForeignKey
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;
