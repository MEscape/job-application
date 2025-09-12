-- AlterTable
ALTER TABLE "public"."filesystem_items" ADD COLUMN     "downloadCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "filePath" TEXT,
ADD COLUMN     "isReal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "uploadedBy" TEXT;

-- CreateIndex
CREATE INDEX "filesystem_items_isReal_idx" ON "public"."filesystem_items"("isReal");

-- CreateIndex
CREATE INDEX "filesystem_items_uploadedBy_idx" ON "public"."filesystem_items"("uploadedBy");

-- AddForeignKey
ALTER TABLE "public"."filesystem_items" ADD CONSTRAINT "filesystem_items_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
