import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

const KBZPAY_API_URL = 'https://api.kbzpay.com/api/v1';
const KBZPAY_API_KEY = process.env.KBZPAY_API_KEY;
const KBZPAY_MERCHANT_ID = process.env.KBZPAY_MERCHANT_ID;
const KBZPAY_WEBHOOK_SECRET = process.env.KBZPAY_WEBHOOK_SECRET;

// Helper function to generate transaction ID
function generateTransactionId() {
  return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to create payment signature
function createSignature(data) {
  if (!KBZPAY_WEBHOOK_SECRET) return null;
  const message = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto
    .createHmac('sha256', KBZPAY_WEBHOOK_SECRET)
    .update(message)
    .digest('hex');
}

// Helper function to verify webhook signature
function verifyWebhookSignature(payload, signature) {
  if (!KBZPAY_WEBHOOK_SECRET) return false;
  if (!signature) return false;

  const expectedSignature = createSignature(payload);
  if (!expectedSignature) return false;

  const sigBuf = Buffer.from(String(signature), 'utf8');
  const expBuf = Buffer.from(String(expectedSignature), 'utf8');

  if (sigBuf.length !== expBuf.length) return false;

  try {
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch (e) {
    return false;
  }
}

// POST /kbz-pay/create-payment
router.post('/create-payment', async (req, res) => {
  const { courseId, studentId, amount, phone } = req.body;

  // Validate input
  if (!courseId || !studentId || !amount || !phone) {
    return res.status(400).json({
      error: 'Missing required fields: courseId, studentId, amount, phone',
    });
  }

  const transactionId = generateTransactionId();

  // Create pending purchase record in PocketBase
  const purchaseRecord = await pb.collection('purchases').create({
    transactionId,
    courseId,
    studentId,
    amount,
    phone,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });

  logger.info(`Created pending purchase record: ${transactionId}`);

  // Call KBZ PAY API to create payment
  const kbzPayPayload = {
    merchantId: KBZPAY_MERCHANT_ID,
    transactionId,
    amount: Math.round(amount * 100), // Convert to cents
    phone,
    description: `Course Payment - ${courseId}`,
    returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success?transactionId=${transactionId}`,
    cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-cancel`,
  };

  try {
    const kbzPayResponse = await axios.post(
      `${KBZPAY_API_URL}/payment/create`,
      kbzPayPayload,
      {
        headers: {
          'Authorization': `Bearer ${KBZPAY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!kbzPayResponse.data || !kbzPayResponse.data.paymentUrl) {
      logger.error('KBZ PAY API did not return payment URL', kbzPayResponse.data);
      return res.status(502).json({ error: 'Payment provider error' });
    }

    logger.info(`Payment created with KBZ PAY: ${transactionId}`);

    return res.json({
      paymentUrl: kbzPayResponse.data.paymentUrl,
      transactionId,
    });
  } catch (err) {
    logger.error('Error creating KBZ payment', err);
    return res.status(502).json({ error: 'Payment provider request failed' });
  }
});

// GET /kbz-pay/verify/:transactionId
router.get('/verify/:transactionId', async (req, res) => {
  const { transactionId } = req.params;

  if (!transactionId) {
    return res.status(400).json({ error: 'Transaction ID is required' });
  }

  // Fetch purchase record from PocketBase
  const purchaseRecords = await pb
    .collection('purchases')
    .getFullList({
      filter: `transactionId = "${transactionId}"`,
    });

  if (purchaseRecords.length === 0) {
    return res.status(404).json({ error: `Purchase record not found for transaction: ${transactionId}` });
  }

  const purchase = purchaseRecords[0];

  try {
    // Verify payment status with KBZ PAY API
    const kbzPayResponse = await axios.get(
      `${KBZPAY_API_URL}/payment/verify/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${KBZPAY_API_KEY}`,
        },
      }
    );

    const paymentStatus = kbzPayResponse.data && kbzPayResponse.data.status;

    // Update purchase record with final status
    await pb.collection('purchases').update(purchase.id, {
      status: paymentStatus,
      verifiedAt: new Date().toISOString(),
    });

    logger.info(`Payment verified: ${transactionId} - Status: ${paymentStatus}`);

    if (paymentStatus === 'completed') {
      return res.json({
        status: 'completed',
        amount: purchase.amount,
        courseId: purchase.courseId,
        studentId: purchase.studentId,
        transactionId,
      });
    }

    if (paymentStatus === 'failed') {
      return res.status(402).json({ error: `Payment failed for transaction: ${transactionId}` });
    }

    // pending status
    return res.json({
      status: 'pending',
      amount: purchase.amount,
      courseId: purchase.courseId,
      studentId: purchase.studentId,
      transactionId,
    });
  } catch (err) {
    logger.error('Error verifying KBZ payment', err);
    return res.status(502).json({ error: 'Payment provider request failed' });
  }
});

// POST /kbz-pay/webhook
router.post('/webhook', async (req, res) => {
  const { transactionId, status, amount } = req.body;
  const signature = req.headers['x-kbzpay-signature'];

  if (!signature) {
    logger.warn('Webhook received without signature');
    return res.status(400).json({ error: 'Missing signature' });
  }

  // Verify webhook signature
  const valid = verifyWebhookSignature(req.body, signature);
  if (!valid) {
    logger.warn(`Invalid webhook signature for transaction: ${transactionId}`);
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  // Fetch purchase record from PocketBase
  const purchaseRecords = await pb
    .collection('purchases')
    .getFullList({
      filter: `transactionId = "${transactionId}"`,
    });

  if (purchaseRecords.length === 0) {
    logger.warn(`Purchase record not found for webhook: ${transactionId}`);
    return res.status(404).json({ error: 'Purchase not found' });
  }

  const purchase = purchaseRecords[0];

  // Update purchase status
  await pb.collection('purchases').update(purchase.id, {
    status,
    webhookReceivedAt: new Date().toISOString(),
  });

  logger.info(
    `Webhook processed: ${transactionId} - Status: ${status} - Amount: ${amount}`
  );

  // Return 200 OK to acknowledge receipt
  return res.json({ success: true, transactionId });
});

export default router;