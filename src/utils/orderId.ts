// src/utils/orderId.ts
import crypto from 'crypto';

export function genOrderId(prefix = 'ORD'): string {
  const ts = Date.now().toString(36);
  const rnd = crypto.randomBytes(4).toString('hex');
  return `${prefix}-${ts}-${rnd}`.toUpperCase();
}
