/*
  Warnings:

  - You are about to drop the column `is_night` on the `worker` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "worker" DROP COLUMN "is_night",
ADD COLUMN     "fixed_work_type" INTEGER;
