-- DropForeignKey
ALTER TABLE "public"."filesystem_items" DROP CONSTRAINT "filesystem_items_parentPath_fkey";

-- AddForeignKey
ALTER TABLE "public"."filesystem_items" ADD CONSTRAINT "filesystem_items_parentPath_fkey" FOREIGN KEY ("parentPath") REFERENCES "public"."filesystem_items"("path") ON DELETE CASCADE ON UPDATE CASCADE;
