-- AlterTable
ALTER TABLE "public"."activity_logs" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "readBy" TEXT;

-- CreateIndex
CREATE INDEX "activity_logs_isRead_idx" ON "public"."activity_logs"("isRead");

-- AddForeignKey
ALTER TABLE "public"."activity_logs" ADD CONSTRAINT "activity_logs_readBy_fkey" FOREIGN KEY ("readBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
