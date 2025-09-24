-- AlterTable
ALTER TABLE "public"."filesystem_items" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "filesystem_items_userId_idx" ON "public"."filesystem_items"("userId");

-- AddForeignKey
ALTER TABLE "public"."filesystem_items" ADD CONSTRAINT "filesystem_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
