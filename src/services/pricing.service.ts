// src/services/pricing.service.ts
import { PrismaClient, Segment } from '@prisma/client';
const prisma = new PrismaClient();

type PriceInputProgram = {
  programId: string;
  email: string;
};

type PriceInputMember = {
  membershipPackageId: string;
};

export async function computePriceProgram({ programId, email }: PriceInputProgram) {
  // Contoh sederhana: harga member vs non-member
  const normalizedEmail = email.trim().toLowerCase();
  const member = await prisma.member.findUnique({ where: { email: normalizedEmail } });
  const programPrice = await prisma.program.findUnique({ where: { id: programId ?? '' } });
  // (opsional) baca tabel pricelist/metadata program untuk paket
  // Di sini kita hardcode contoh:

  return {
    amount: member ? programPrice?.priceMember : programPrice?.priceNonMember,
    source: member ? 'MEMBER' : ('NON_MEMBER' as const),
    memberId: member?.id ?? null
  };
}

export async function computePriceMember({ membershipPackageId }: PriceInputMember) {
  const memberPrice = await prisma.membershipPackage.findUnique({
    where: { id: membershipPackageId ?? '' }
  });

  return {
    id: memberPrice?.id,
    name: memberPrice?.name,
    amount: memberPrice?.price
  };
}
