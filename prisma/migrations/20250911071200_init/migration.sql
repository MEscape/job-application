-- CreateEnum
CREATE TYPE "public"."FileType" AS ENUM ('FOLDER', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'ARCHIVE', 'CODE', 'TEXT', 'OTHER');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "accessCode" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "name" TEXT,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "User_accessCode_key" ON "public"."User"("accessCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

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
