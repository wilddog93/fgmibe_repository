/*
  Warnings:

  - You are about to drop the column `membershipPackage` on the `members` table. All the data in the column will be lost.
  - Added the required column `membershipPackageId` to the `members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceMember` to the `programs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceNonMember` to the `programs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "ProgramCategory" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "members" DROP COLUMN "membershipPackage",
ADD COLUMN     "membershipPackageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "programs" ADD COLUMN     "priceMember" INTEGER NOT NULL,
ADD COLUMN     "priceNonMember" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "MembershipPackage";

-- CreateTable
CREATE TABLE "membership_packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_packages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_membershipPackageId_fkey" FOREIGN KEY ("membershipPackageId") REFERENCES "membership_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
