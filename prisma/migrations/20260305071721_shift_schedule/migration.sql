/*
  Warnings:

  - You are about to drop the column `schedule_id` on the `group` table. All the data in the column will be lost.
  - You are about to drop the column `admin` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `group_id` on the `user` table. All the data in the column will be lost.
  - Added the required column `date` to the `schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selected_day` to the `schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selected_night` to the `schedule` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `schedule` on the `schedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "group" DROP CONSTRAINT "group_schedule_id_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_group_id_fkey";

-- AlterTable
ALTER TABLE "group" DROP COLUMN "schedule_id";

-- AlterTable
ALTER TABLE "schedule" ADD COLUMN     "date" TEXT NOT NULL,
ADD COLUMN     "selected_day" JSONB NOT NULL,
ADD COLUMN     "selected_night" JSONB NOT NULL,
DROP COLUMN "schedule",
ADD COLUMN     "schedule" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "admin",
DROP COLUMN "group_id";

-- CreateTable
CREATE TABLE "shift_worker" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "is_night" BOOLEAN NOT NULL,
    "is_new" BOOLEAN NOT NULL DEFAULT false,
    "target_work_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shift_worker_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_worker" ADD CONSTRAINT "shift_worker_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedule"("schedule_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_worker" ADD CONSTRAINT "shift_worker_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
