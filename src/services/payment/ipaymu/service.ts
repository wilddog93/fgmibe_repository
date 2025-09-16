// src/services/ipaymu.service.ts
import crypto from 'crypto';
import axios from 'axios';
import config from '../../../config/config';

const IPAYMU_URL = config.ipaymu.apiUrl || 'https://sandbox.ipaymu.com/api/v2';
const VA = config.ipaymu.va || '';
const APIKEY = config.ipaymu.apiKey || '';

function generateSignature(body: any, method = 'POST') {
  // 1. Stringify payload
  const bodyString = JSON.stringify(body);

  // 2. Hash body
  const bodyEncrypt = crypto.createHash('sha256').update(bodyString).digest('hex');

  // 3. Build string to sign
  const stringToSign = `${method}:${VA}:${bodyEncrypt}:${APIKEY}`;
  // logger.info(`[IPAYMU] String to sign ${stringToSign}`);

  // 4. Generate HMAC SHA256 signature
  const signature = crypto.createHmac('sha256', APIKEY).update(stringToSign).digest('hex');
  // logger.info(`[IPAYMU] Signature generated ${signature}`);
  return signature;
}

export async function createIpaymuCheckout(params: {
  referenceId: string;
  product: string[];
  qty: string[];
  price: string[];
  description: string[];
  returnUrl: string;
  notifyUrl: string;
  cancelUrl: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  // pickupArea?: string;
  // pickupAddress?: string;
}) {
  const body = {
    ...params,
    paymentMethod: 'qris' // default
  };

  const signature = generateSignature(body, 'POST');
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T.Z]/g, '') // hapus karakter non-digit
    .slice(0, 14); // ambil YYYYMMDDHHMMSS

  const formData = new FormData();
  Object.entries(body).forEach(([key, value]) => {
    formData.append(key, Array.isArray(value) ? value.join(',') : value);
  });

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    va: VA,
    signature: signature,
    timestamp
  };
  // console.log(formData, 'formData-checkout');
  // const { data, status } = await axios.post(`${IPAYMU_URL}/payment`, body, { headers });
  // console.log({ data, status }, 'data-checkout');

  const data = await fetch(`${IPAYMU_URL}/payment`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    redirect: 'follow'
  });
  const result = await data.json();
  console.log(result, 'result-checkout');
  if (result.Status !== 200) {
    throw new Error(result.Message);
  }
  return result;
  // .then((response) => response.text())
  // .then((result) => console.log(result))
  // .catch((error) => console.log('error', error));
  // const { data } = await axios.post(`${IPAYMU_URL}/payment`, body, { headers });
}

export async function checkIpaymuTransaction(transactionId: string) {
  const body = { transactionId };
  const signature = generateSignature(body, 'POST');

  const headers = {
    va: VA,
    signature,
    'Content-Type': 'application/json'
  };

  const { data } = await axios.post(`${IPAYMU_URL}/transaction`, body, { headers });
  return data;
}

export async function checkIpaymuHistory() {
  const body = {};
  const signature = generateSignature(body, 'POST');

  const headers = {
    va: VA,
    signature,
    'Content-Type': 'application/json'
  };

  const { data } = await axios.post(`${IPAYMU_URL}/history`, body, { headers });
  return data;
}

export async function checkIpaymuBalance(account: string) {
  const body = { account };
  const signature = generateSignature(body, 'POST');

  const headers = {
    va: VA,
    signature,
    'Content-Type': 'application/json'
  };

  const { data } = await axios.post(`${IPAYMU_URL}/balance`, body, { headers });
  return data;
}

export default {
  createIpaymuCheckout,
  checkIpaymuTransaction
};
