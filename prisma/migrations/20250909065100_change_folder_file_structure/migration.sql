/*
  Warnings:

  - You are about to drop the column `filename` on the `File` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,path]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parentPath` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storagePath` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parentPath` to the `Folder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `Folder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."File" DROP COLUMN "filename",
ADD COLUMN     "color" TEXT,
ADD COLUMN     "extension" TEXT,
ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "parentPath" TEXT NOT NULL,
ADD COLUMN     "storagePath" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "public"."Folder" ADD COLUMN     "color" TEXT,
ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentPath" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "File_parentPath_idx" ON "public"."File"("parentPath");

-- CreateIndex
CREATE INDEX "Folder_parentPath_idx" ON "public"."Folder"("parentPath");

-- CreateIndex
CREATE UNIQUE INDEX "Folder_userId_path_key" ON "public"."Folder"("userId", "path");
