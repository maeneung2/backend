/*
  Warnings:

  - You are about to drop the column `admin` on the `shift_worker` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "shift_worker" DROP COLUMN "admin";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "admin" BOOLEAN NOT NULL DEFAULT false;
