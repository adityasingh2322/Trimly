const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// @desc    Create Razorpay Order
// @route   POST /api/payment/order
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
    });

    const options = {
      amount: 50 * 100, // exact amount in smallest currency unit (Paisa = 50 INR)
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    };

    const order = await instance.orders.create(options);

    if (!order) {
      res.status(500);
      throw new Error('Some error occured while generating order');
    }

    res.json(order);
  } catch (error) {
    res.status(500);
    throw new Error(error.message || 'Payment Order generation failed');
  }
});

// @desc    Verify payment signature
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    return res.status(200).json({ message: "Payment verified successfully", paymentId: razorpay_payment_id });
  } else {
    res.status(400);
    throw new Error("Invalid signature sent!");
  }
});

module.exports = {
  createOrder,
  verifyPayment
};
