// src/services/midtrans.service.ts
import crypto from 'crypto';
import midtransClient from 'midtrans-client';
import fetch from 'node-fetch';
const BASE_URL = process.env.MIDTRANS_BASE_URL || 'https://app.sandbox.midtrans.com/snap/v1';
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;
const CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY!;

// Basic auth header
function authHeader() {
  const token = Buffer.from(`${SERVER_KEY}:`).toString('base64');
  return `Basic ${token}`;
}

// setup coreApi
const core = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: SERVER_KEY,
  clientKey: CLIENT_KEY
});

// Create transaction (QRIS example via Core API)
// Refer Midtrans docs untuk payload lain (e.g. ewallet, bank_transfer, snap)
// Di sini kita pakai charge API (qris)
export async function createTransactionQris(params: {
  orderId: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  customerPhone?: string | null;
}) {
  const body = {
    payment_type: 'qris',
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.amount
    },
    customer_details: {
      email: params.customerEmail,
      name: params.customerName,
      phone: params.customerPhone
    }
    // gopay: {
    //   enable_callback: true, // optional
    //   callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`
    // }
  };

  const res = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Midtrans charge failed: ${res.status} ${err}`);
  }
  return res.json(); // response includes qr_string / actions
}

// Signature verification (for notifications):
// sha512(order_id + status_code + gross_amount + serverKey)
export function verifyNotificationSignature(input: {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string; // from midtrans notif
}) {
  const raw = `${input.order_id}${input.status_code}${input.gross_amount}${SERVER_KEY}`;
  const expected = crypto.createHash('sha512').update(raw).digest('hex');
  return expected === input.signature_key;
}
