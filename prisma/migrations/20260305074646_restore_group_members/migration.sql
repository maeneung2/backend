-- AlterTable
ALTER TABLE "user" ADD COLUMN     "group_id" TEXT;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("group_id") ON DELETE SET NULL ON UPDATE CASCADE;
