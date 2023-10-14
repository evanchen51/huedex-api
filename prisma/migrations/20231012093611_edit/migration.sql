/*
  Warnings:

  - The `featured` column on the `Poll` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Poll" DROP COLUMN "featured",
ADD COLUMN     "featured" BOOLEAN;
