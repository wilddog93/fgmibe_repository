/*
  Warnings:

  - The values [SUCCESS] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [CLOSED] on the enum `ProgramStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `fullName` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `members` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email,programId]` on the table `program_registrations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `tokens` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `members` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `segment` on the `members` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `email` to the `program_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institution` to the `program_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `program_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `segment` to the `program_registrations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Segment" AS ENUM ('STUDENT', 'FRESH_GRADUATE', 'PROFESSIONAL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentMethod" ADD VALUE 'BANK_TRANSFER';
ALTER TYPE "PaymentMethod" ADD VALUE 'EWALLET';

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
ALTER TABLE "payments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "payments" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "PaymentStatus_old";
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ProgramStatus_new" AS ENUM ('ACTIVE', 'INACTIVE');
ALTER TABLE "programs" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "programs" ALTER COLUMN "status" TYPE "ProgramStatus_new" USING ("status"::text::"ProgramStatus_new");
ALTER TYPE "ProgramStatus" RENAME TO "ProgramStatus_old";
ALTER TYPE "ProgramStatus_new" RENAME TO "ProgramStatus";
DROP TYPE "ProgramStatus_old";
ALTER TABLE "programs" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropForeignKey
ALTER TABLE "program_registrations" DROP CONSTRAINT "program_registrations_memberId_fkey";

-- DropForeignKey
ALTER TABLE "program_registrations" DROP CONSTRAINT "program_registrations_programId_fkey";

-- DropForeignKey
ALTER TABLE "tokens" DROP CONSTRAINT "tokens_user_id_fkey";

-- AlterTable
ALTER TABLE "members" DROP COLUMN "fullName",
DROP COLUMN "phoneNumber",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT,
DROP COLUMN "segment",
ADD COLUMN     "segment" "Segment" NOT NULL;

-- AlterTable
ALTER TABLE "program_registrations" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "institution" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "segment" "Segment" NOT NULL,
ALTER COLUMN "memberId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tokens" ALTER COLUMN "blacklisted" SET DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "username" TEXT;

-- DropEnum
DROP TYPE "MemberSegment";

-- CreateIndex
CREATE UNIQUE INDEX "program_registrations_email_programId_key" ON "program_registrations"("email", "programId");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_token_key" ON "tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_registrations" ADD CONSTRAINT "program_registrations_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_registrations" ADD CONSTRAINT "program_registrations_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
