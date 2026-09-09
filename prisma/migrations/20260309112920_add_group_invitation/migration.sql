-- CreateTable
CREATE TABLE "group_invitation" (
    "invite_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "group_invitation_pkey" PRIMARY KEY ("invite_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "group_invitation_group_id_user_id_key" ON "group_invitation"("group_id", "user_id");

-- AddForeignKey
ALTER TABLE "group_invitation" ADD CONSTRAINT "group_invitation_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_invitation" ADD CONSTRAINT "group_invitation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
