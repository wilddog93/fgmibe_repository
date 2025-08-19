// src/services/pricing.service.ts
import { PrismaClient, Segment } from '@prisma/client';
const prisma = new PrismaClient();

type PriceInput = {
  programId: string;
  email: string;
  programPackage?: string | null;
};

export async function computePrice({ programId, email, programPackage }: PriceInput) {
  // Contoh sederhana: harga member vs non-member
  const normalizedEmail = email.trim().toLowerCase();
  const member = await prisma.member.findUnique({ where: { email: normalizedEmail } });
  // (opsional) baca tabel pricelist/metadata program untuk paket
  // Di sini kita hardcode contoh:
  const priceNonMember = 60000;
  const priceMember = 30000;

  return {
    amount: member ? priceMember : priceNonMember,
    source: member ? 'MEMBER' : ('NON_MEMBER' as const),
    memberId: member?.id ?? null
  };
}
