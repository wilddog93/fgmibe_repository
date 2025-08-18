-- AlterTable
ALTER TABLE "program_registrations" ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "program_registrations" ADD CONSTRAINT "program_registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
