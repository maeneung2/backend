/*
  Warnings:

  - You are about to drop the column `target_work_count` on the `worker` table. All the data in the column will be lost.
  - You are about to drop the column `user_name` on the `worker` table. All the data in the column will be lost.
  - Added the required column `rest_count` to the `worker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "worker" DROP COLUMN "target_work_count",
DROP COLUMN "user_name",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "rest_count" INTEGER NOT NULL;
