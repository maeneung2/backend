/*
  Warnings:

  - You are about to drop the column `schedule` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the `shift_worker` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "shift_worker" DROP CONSTRAINT "shift_worker_schedule_id_fkey";

-- DropForeignKey
ALTER TABLE "shift_worker" DROP CONSTRAINT "shift_worker_user_id_fkey";

-- AlterTable
ALTER TABLE "schedule" DROP COLUMN "schedule";

-- DropTable
DROP TABLE "shift_worker";

-- CreateTable
CREATE TABLE "worker" (
    "worker_id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL DEFAULT '',
    "is_night" BOOLEAN NOT NULL,
    "is_new" BOOLEAN NOT NULL DEFAULT false,
    "target_work_count" INTEGER NOT NULL,
    "plan" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_pkey" PRIMARY KEY ("worker_id")
);

-- AddForeignKey
ALTER TABLE "worker" ADD CONSTRAINT "worker_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedule"("schedule_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker" ADD CONSTRAINT "worker_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
