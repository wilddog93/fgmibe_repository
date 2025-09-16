// src/services/midtrans.service.ts
import crypto from 'crypto';
import midtransClient from 'midtrans-client';
import fetch from 'node-fetch';
const BASE_URL = process.env.MIDTRANS_BASE_URL || 'https://app.sandbox.midtrans.com/snap/v1';
const API_URL = process.env.MIDTRANS_API_URL || 'https://api.sandbox.midtrans.com/v2';
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;
const CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY!;

// Basic auth header
const authHeaderMidtrans = () => {
  const token = Buffer.from(`${SERVER_KEY}:`).toString('base64');
  return `Basic ${token}`;
};

// setup coreApi
const core = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: SERVER_KEY,
  clientKey: CLIENT_KEY
});

// setup snapApi
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: SERVER_KEY,
  clientKey: CLIENT_KEY
});

// create charge coreApi
/**
 *
 * @param {string} orderId
 * @param {number} amount
 * @param {any} customerDetails
 * @param {any} itemDetails
 * @returns {Promise}
 */
export const createTransactionCharge = async (params: {
  orderId: string;
  amount: number;
  customerDetails: any;
  itemDetails: any;
}) => {
  const body = {
    payment_type: 'gopay',
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.amount
    },
    customer_details: params?.customerDetails,
    item_details: params?.itemDetails,
    gopay: {
      enable_callback: true,
      callback_url: `${process.env.FRONTEND_URL}/payment/success`
    }
  };
  const result = await core.charge(body);
  return result;
};

// Create transaction (QRIS example via Core API)
// Refer Midtrans docs untuk payload lain (e.g. ewallet, bank_transfer, snap)
// Di sini kita pakai charge API (qris)
/**
 * Create transaction
 * @param {string} orderId
 * @param {number} amount
 * @param {string} customerEmail
 * @param {string} customerName
 * @param {string} customerPhone
 * @returns {Promise}
 */
export const createTransactionSnap = async (params: {
  orderId: string;
  amount: number;
  customerDetails?: any;
  itemDetails?: any;
}) => {
  const body = {
    payment_type: 'qris',
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.amount
    },
    customer_details: params?.customerDetails,
    item_details: params?.itemDetails
  };

  const result = await snap.createTransaction(body);
  return result;

  // const res = await fetch(`${BASE_URL}/transactions`, {
  //   method: 'POST',
  //   headers: {
  //     Authorization: authHeaderMidtrans(),
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(body)
  // });

  // if (!res.ok) {
  //   const err = await res.text();
  //   throw new Error(`Midtrans charge failed: ${res.status} ${err}`);
  // }
  // // response includes qr_string / actions
  // return res.json();
};

export interface TransactionStatusParams {
  order_id?: string;
}

type TransactionStatusResult = {
  ok: boolean;
  result?: {
    transaction_time?: string;
    gross_amount?: string;
    currency?: string;
    order_id?: string;
    payment_type?: string;
    signature_key?: string;
    status_code: string;
    transaction_id?: string;
    transaction_status?: string;
    fraud_status?: string;
    settlement_time?: string;
    status_message: string;
    merchant_id?: string;
  };
};

// get transaction status
export const getTransactionStatus = async <Key extends keyof TransactionStatusResult>(
  params: TransactionStatusParams,
  keys: Key[] = ['ok', 'result'] as Key[]
): Promise<any> => {
  const status = await fetch(`${API_URL}/${params.order_id}/status`, {
    method: 'GET',
    headers: {
      Authorization: authHeaderMidtrans(),
      'Content-Type': 'application/json'
    }
  });
  if (!status.ok) {
    const err = await status.text();
    throw new Error(`Midtrans status failed: ${status.status} ${err}`);
  }
  const result = await status.json();
  return result as Promise<Pick<TransactionStatusResult, Key>>;
};

// Signature verification (for notifications):
// sha512(order_id + status_code + gross_amount + serverKey)
/**
 * Verify notification signature
 * @param {string} order_id
 * @param {string} status_code
 * @param {string} gross_amount
 * @param {string} signature_key
 * @returns {boolean}
 */
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

export default {
  createTransactionSnap,
  createTransactionCharge,
  getTransactionStatus,
  verifyNotificationSignature
};
