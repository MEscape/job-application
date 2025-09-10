-- CreateTable
CREATE TABLE "public"."File" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'application/pdf',
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT,
    "userId" TEXT NOT NULL,
    "folderId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Folder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "userId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "File_userId_idx" ON "public"."File"("userId");

-- CreateIndex
CREATE INDEX "File_folderId_idx" ON "public"."File"("folderId");

-- CreateIndex
CREATE INDEX "File_isDeleted_idx" ON "public"."File"("isDeleted");

-- CreateIndex
CREATE INDEX "Folder_userId_idx" ON "public"."Folder"("userId");

-- CreateIndex
CREATE INDEX "Folder_parentId_idx" ON "public"."Folder"("parentId");

-- CreateIndex
CREATE INDEX "Folder_isDeleted_idx" ON "public"."Folder"("isDeleted");

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Folder" ADD CONSTRAINT "Folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Folder" ADD CONSTRAINT "Folder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
