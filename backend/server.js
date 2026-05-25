const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');
const Razorpay = require('razorpay');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ error: 'Amount and currency are required' });
    }

    const amountInPaise = Math.round(Number(amount) * 100);
    if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const receipt = `rcpt_${Date.now()}`;
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt
    });

    return res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

app.post('/api/verify-payment', (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment verification fields' });
  }

  const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest('hex');

  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
  const receivedBuffer = Buffer.from(razorpay_signature, 'utf8');

  if (expectedBuffer.length !== receivedBuffer.length) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const isValid = crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

  if (!isValid) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  return res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Razorpay server running on port ${port}`);
});
