import { Request, Response, NextFunction } from 'express';
import config from '../config/config';
import crypto from 'crypto';

/**
 * Generate iPaymu signature
 * @param method HTTP Method (POST/GET)
 * @param va Virtual Account Number
 * @param apiKey API Key from iPaymu
 * @param body Request Body (object)
 */
export function generateIpaymuSignature(
  method: string,
  va: string,
  apiKey: string,
  body: unknown
): string {
  const bodyString = JSON.stringify(body);
  const bodyHash = crypto.createHash('sha256').update(bodyString).digest('hex').toLowerCase();

  const stringToSign = `${method}:${va}:${bodyHash}:${apiKey}`;
  return crypto.createHmac('sha256', apiKey).update(stringToSign).digest('hex');
}

/**
 * Express middleware to verify iPaymu webhook signature
 */
export function ipaymuVerificationMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const VA = config.ipaymu.va;
    const API_KEY = config.ipaymu.apiKey;
    const receivedSignature = req.headers['signature'];

    if (!receivedSignature) {
      return res.status(401).json({ message: 'Missing signature header' });
    }

    const expectedSignature = generateIpaymuSignature('POST', VA, API_KEY, req.body);

    if (expectedSignature !== receivedSignature) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    next();
  } catch (err) {
    console.error('iPaymu Verification Error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
