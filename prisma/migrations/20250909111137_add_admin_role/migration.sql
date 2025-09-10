/*
  Warnings:

  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Folder` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."FileType" AS ENUM ('FOLDER', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'ARCHIVE', 'CODE', 'TEXT', 'OTHER');

-- DropForeignKey
ALTER TABLE "public"."File" DROP CONSTRAINT "File_folderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."File" DROP CONSTRAINT "File_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Folder" DROP CONSTRAINT "Folder_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Folder" DROP CONSTRAINT "Folder_userId_fkey";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "public"."File";

-- DropTable
DROP TABLE "public"."Folder";

-- CreateTable
CREATE TABLE "public"."filesystem_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."FileType" NOT NULL,
    "path" TEXT NOT NULL,
    "parentPath" TEXT,
    "size" INTEGER,
    "extension" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateModified" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "filesystem_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "filesystem_items_path_key" ON "public"."filesystem_items"("path");

-- CreateIndex
CREATE INDEX "filesystem_items_parentPath_idx" ON "public"."filesystem_items"("parentPath");

-- CreateIndex
CREATE INDEX "filesystem_items_type_idx" ON "public"."filesystem_items"("type");

-- CreateIndex
CREATE INDEX "filesystem_items_path_idx" ON "public"."filesystem_items"("path");

-- AddForeignKey
ALTER TABLE "public"."filesystem_items" ADD CONSTRAINT "filesystem_items_parentPath_fkey" FOREIGN KEY ("parentPath") REFERENCES "public"."filesystem_items"("path") ON DELETE SET NULL ON UPDATE CASCADE;
