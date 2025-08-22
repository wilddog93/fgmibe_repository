// src/services/payment.service.ts
import redis from '../config/redis';
import { PrismaClient, Segment } from '@prisma/client';
import midtransClient from 'midtrans-client';

const prisma = new PrismaClient();

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY as string,
  clientKey: process.env.MIDTRANS_CLIENT_KEY as string
});

export async function handleSettlement(orderId: string) {
  // 1) ambil metadata dari redis
  const cached = await redis.get(`pay:${orderId}`);
  if (!cached) {
    throw new Error(`No cache found for orderId ${orderId}`);
  }

  const meta = JSON.parse(cached) as {
    programId: string;
    email: string;
    name: string;
    phone: string | null;
    institution: string | null;
    segment: Segment | null;
    programPackage: string | null;
    userId: number | null;
    memberId: string | null;
    source: 'MEMBER' | 'NON_MEMBER' | 'ADMIN';
    amount: number;
    currency: 'IDR';
    method: string;
  };

  // 2) cek status ke midtrans
  const snapAny = snap as any;
  const status = await snap.transaction.status(orderId);

  if (status.transaction_status === 'settlement') {
    // 3) insert ke DB
    await prisma.programRegistration.create({
      data: {
        userId: meta.userId ?? 0, // kalau userId null → lo bisa decide apakah bikin guest user atau throw error
        programId: meta.programId,
        email: meta.email,
        name: meta.name, // TODO: ambil dari redis
        phone: '', // TODO: ambil dari redis
        institution: '', // TODO: ambil dari redis
        segment: null, // TODO: ambil dari redis
        programPackage: '', // TODO: ambil dari redis
        source: meta.source
      }
    });

    // optional: hapus cache biar ga dobel
    await redis.del(`pay:${orderId}`);
  }

  return status;
}
