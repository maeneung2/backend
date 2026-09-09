/*
  Warnings:

  - You are about to drop the column `group_users` on the `group` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "group" DROP COLUMN "group_users";

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("group_id") ON DELETE SET NULL ON UPDATE CASCADE;
