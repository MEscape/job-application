/*
  Warnings:

  - Made the column `uploadedBy` on table `filesystem_items` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."filesystem_items" DROP CONSTRAINT "filesystem_items_uploadedBy_fkey";

-- DropIndex
DROP INDEX "public"."filesystem_items_isReal_idx";

-- AlterTable
ALTER TABLE "public"."filesystem_items" ALTER COLUMN "uploadedBy" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."filesystem_items" ADD CONSTRAINT "filesystem_items_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
