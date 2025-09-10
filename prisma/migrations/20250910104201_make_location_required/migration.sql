/*
  Warnings:

  - Made the column `location` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- First, update any NULL location values to a default value
UPDATE "public"."User" SET "location" = 'Unknown' WHERE "location" IS NULL;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "location" SET NOT NULL;
