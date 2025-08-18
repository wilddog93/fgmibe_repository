/*
  Warnings:

  - You are about to drop the column `user_id` on the `members` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `members` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "RegistrationSource" ADD VALUE 'ADMIN';

-- DropForeignKey
ALTER TABLE "members" DROP CONSTRAINT "members_user_id_fkey";

-- DropIndex
DROP INDEX "members_user_id_key";

-- AlterTable
ALTER TABLE "members" DROP COLUMN "user_id",
ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "referenceType" TEXT;

-- AlterTable
ALTER TABLE "program_registrations" ALTER COLUMN "institution" DROP NOT NULL,
ALTER COLUMN "segment" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "members_userId_key" ON "members"("userId");

-- CreateIndex
CREATE INDEX "program_registrations_programId_idx" ON "program_registrations"("programId");

-- CreateIndex
CREATE INDEX "program_registrations_userId_idx" ON "program_registrations"("userId");

-- CreateIndex
CREATE INDEX "program_registrations_memberId_idx" ON "program_registrations"("memberId");

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
