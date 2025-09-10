-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "accessCode" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "name" TEXT,
    "position" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_accessCode_key" ON "public"."User"("accessCode");
