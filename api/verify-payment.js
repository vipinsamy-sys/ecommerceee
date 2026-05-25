const crypto = require('crypto');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body || {};

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({ success: false, error: 'Missing fields' });
  }

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const expectedBuffer = Buffer.from(expected, 'utf8');
  const receivedBuffer = Buffer.from(razorpay_signature, 'utf8');

  if (expectedBuffer.length !== receivedBuffer.length) {
    return res.status(400).json({ success: false, error: 'Invalid signature' });
  }

  const isValid = crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

  if (!isValid) {
    return res.status(400).json({ success: false, error: 'Invalid signature' });
  }

  return res.json({ success: true });
};
