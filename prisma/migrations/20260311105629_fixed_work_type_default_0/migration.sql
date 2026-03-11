/*
  Warnings:

  - Made the column `fixed_work_type` on table `worker` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "worker" ALTER COLUMN "fixed_work_type" SET NOT NULL,
ALTER COLUMN "fixed_work_type" SET DEFAULT 0;
