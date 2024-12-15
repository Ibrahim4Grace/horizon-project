import {
  Payment,
  Course,
  Pin,
  PurchaseHistory,
  Transaction,
} from '../models/index.js';
import { config } from '../configs/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

import {
  makePaystackRequest,
  handleSuccessfulPayment,
  generateOTP,
  completeTransferTransaction,
  calculatePaystackSignature,
} from '../utils/index.js';
import { ServerError, ResourceNotFound } from '../middlewares/index.js';

import axios from 'axios';

export const chargeCard = asyncHandler(async (req, res) => {
  // Create a lock key based on user and item
  const { courseId, pinId, card } = req.body;
  const user = req.currentUser;
  const itemId = courseId || pinId;

  // First, check if there's a pending or completed payment for this user and item
  const existingTransaction = await Payment.findOne({
    user: user._id,
    itemId: itemId,
    createdAt: {
      $gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
    },
  });

  if (existingTransaction) {
    return res.status(409).json({
      success: false,
      message:
        'A payment for this item is already in progress or was recently completed',
      reference: existingTransaction.paymentReference,
    });
  }

  const item = courseId
    ? await Course.findById(courseId)
    : await Pin.findById(pinId);

  if (!item) {
    console.error('Item not found:', { courseId, pinId });
    throw new ResourceNotFound('Item not found');
  }

  // Convert price to kobo (Paystack uses kobo)
  const priceInNaira = Number(item.price.toString().replace(/,/g, ''));
  const priceInKobo = priceInNaira * 100;

  // Create initial payment record with pending status
  const initialPayment = await Payment.create({
    user: user._id,
    itemId: itemId,
    amount: priceInNaira,
    paymentStatus: 'pending',
    status: 'inactive',
  });

  try {
    const params = JSON.stringify({
      email: user.email,
      amount: priceInKobo,
      card: {
        number: card.number,
        cvv: card.cvv,
        expiry_month: card.expiryMonth,
        expiry_year: card.expiryYear,
      },
      metadata: {
        user_id: user._id.toString(),
        item_id: itemId,
        payment_id: initialPayment._id.toString(), // Include our payment ID
        item_type: courseId ? 'course' : 'pin',
      },
    });

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/charge',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.paystackSecret}`,
        'Content-Type': 'application/json',
      },
    };

    const result = await makePaystackRequest(options, params);

    if (!result.status) {
      // Clean up the initial payment record if Paystack request fails
      await Payment.findByIdAndDelete(initialPayment._id);
      throw new ResourceNotFound(
        result.message || 'Payment initialization failed'
      );
    }

    // Update the initial payment with Paystack reference
    await Payment.findByIdAndUpdate(initialPayment._id, {
      paymentReference: result.data.reference,
      paymentStatus: result.data.status === 'success' ? 'completed' : 'pending',
      status: result.data.status === 'success' ? 'active' : 'inactive',
    });

    // Generate PIN if this is a pin purchase and payment is successful
    let generatedPin = null;
    if (!courseId && pinId && result.data.status === 'success') {
      const { otp } = await generateOTP();
      generatedPin = otp;
    }

    // Create purchase history
    const purchaseHistoryData = {
      user: user._id,
      itemName: item.name,
      itemType: courseId ? 'course' : 'pin',
      amount: priceInNaira,
      paymentStatus: result.data.status === 'success' ? 'completed' : 'pending',
      paymentReference: result.data.reference,
      ...(generatedPin && { pin_number: generatedPin }),
    };

    if (courseId) {
      purchaseHistoryData.course = courseId;
    } else {
      purchaseHistoryData.pin = pinId;
    }

    const purchaseHistory = await PurchaseHistory.create(purchaseHistoryData);

    // Handle different response scenarios
    if (result.data.status === 'success') {
      await handleSuccessfulPayment(initialPayment, result.data);

      res.json({
        success: true,
        message: 'Payment successful',
        payment: initialPayment,
        purchaseHistory,
        ...(generatedPin && { generatedPin }),
      });
    } else if (result.data.status === 'send_pin') {
      res.json({
        success: true,
        message: 'Please enter PIN',
        reference: result.data.reference,
        payment: initialPayment,
        purchaseHistory,
      });
    } else if (result.data.status === 'send_otp') {
      res.json({
        success: true,
        message: 'Please enter OTP',
        reference: result.data.reference,
        payment: initialPayment,
        purchaseHistory,
      });
    } else {
      throw new Error(`Unexpected payment status: ${result.data.status}`);
    }
  } catch (error) {
    // Clean up the initial payment record if anything fails
    await Payment.findByIdAndDelete(initialPayment._id);
    throw error;
  }
});

export const submitPin = asyncHandler(async (req, res) => {
  const user = req.currentUser;
  const { reference, pin } = req.body;

  const payment = await Payment.findOne({
    paymentReference: reference,
  });
  if (!payment) {
    throw new ResourceNotFound('Payment not found');
  }

  const params = JSON.stringify({ reference, pin });
  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/charge/submit_pin',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.paystackSecret}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    const result = await makePaystackRequest(options, params);

    if (result.data.status === 'success') {
      await handleSuccessfulPayment(payment, result.data);
      res.json({
        success: true,
        message: 'Payment successful',
        payment,
      });
    } else if (result.data.status === 'send_otp') {
      res.json({
        success: true,
        message: 'Please enter OTP',
        reference: result.data.reference,
      });
    } else {
      throw new ResourceNotFound(result.message || 'PIN verification failed');
    }
  } catch (error) {
    console.error('Error processing PIN submission:', error);
    throw new ServerError(error.message || 'PIN verification failed');
  }
});

export const submitOtp = asyncHandler(async (req, res) => {
  const user = req.currentUser;
  const { reference, otp } = req.body;

  const payment = await Payment.findOne({
    paymentReference: reference,
  });
  if (!payment) {
    throw new ResourceNotFound('Payment not found');
  }

  const params = JSON.stringify({ reference, otp });
  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/charge/submit_otp',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.paystackSecret}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    const result = await makePaystackRequest(options, params);

    if (result.data.status === 'success') {
      await handleSuccessfulPayment(payment, result.data);
      res.json({
        success: true,
        message: 'Payment successful',
        payment,
      });
    } else {
      throw new ResourceNotFound(result.message || 'OTP verification failed');
    }
  } catch (error) {
    console.error('Error processing OTP submission:', error);
    throw new ServerError(error.message || 'OTP verification failed');
  }
});

export const processPayment = asyncHandler(async (req, res) => {
  const user = req.currentUser;
  try {
    const { paymentMethod, amount, pinId, courseId } = req.body;

    if (!user?.email) {
      return res.status(400).json({ error: 'User email is required' });
    }

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    if (paymentMethod === 'transfer') {
      const paymentData = {
        amount: amount * 100,
        email: user.email,
        currency: 'NGN',
        callback_url: `${process.env.PROD_BASE_URL}/payment/redirect`,
      };

      const response = await axios.post(
        `${process.env.PAYSTACK_BASE_URL}/transaction/initialize`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const transfer = response.data;

      if (!transfer.data?.reference) {
        throw new Error('Invalid transfer response from Paystack');
      }

      const payment = new Payment({
        user: user._id,
        itemId: pinId || courseId,
        amount,
        paymentStatus: 'pending',
        status: 'inactive',
        paymentReference: transfer.data.reference,
      });
      await payment.save();

      const transaction = new Transaction({
        reference: transfer.data.reference,
        userId: user._id,
        amount,
        type: 'transfer',
        itemId: pinId || courseId,
        itemType: pinId ? 'pin' : 'course',
        status: 'pending',
        paymentDetails: {
          transfer_code: transfer.data.reference,
          access_code: transfer.data.access_code,
          authorization_url: transfer.data.authorization_url,
        },
      });
      await transaction.save();

      return res.json({
        status: true,
        reference: transfer.data.reference,
        authorization_url: transfer.data.authorization_url,
        access_code: transfer.data.access_code,
      });
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    const errorMessage =
      error.response?.data?.message || 'Payment processing failed';
    return res.status(500).json({
      status: false,
      error: errorMessage,
    });
  }
});

export const paystackWebhook = asyncHandler(async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const signature = req.headers['x-paystack-signature'];

    console.log('Received webhook request:', req.body); // Log the incoming webhook data
    console.log('Paystack Signature:', signature);

    // Verify Paystack signature
    if (
      !signature ||
      !calculatePaystackSignature(secret, req.body, signature) // Pass signature to the function
    ) {
      console.log('Invalid signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const data = req.body.data;

    console.log('Webhook event:', event); // Log the event type
    console.log('Event data:', data); // Log event data

    if (event === 'charge.success') {
      const reference = data.reference;

      console.log('Processing charge.success for reference:', reference);

      // Find and update the transaction
      const transaction = await Transaction.findOne({ reference });

      if (!transaction) {
        console.log('Transaction not found:', reference);
        return res.status(404).json({ error: 'Transaction not found' });
      }

      if (transaction.status !== 'pending') {
        console.log('Transaction already processed:', reference);
        return res.status(400).json({ error: 'Transaction already processed' });
      }

      console.log('Updating transaction to completed');
      transaction.status = 'completed';
      await transaction.save();

      // Update associated payment
      const payment = await Payment.findOne({ paymentReference: reference });
      if (payment) {
        console.log('Updating payment to completed');
        payment.paymentStatus = 'completed';
        payment.status = 'active';
        payment.startDate = new Date();
        // payment.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Example for subscription of 30 days
        await payment.save();
      }

      // Generate PIN (or complete transfer)
      const generatedPin = await completeTransferTransaction(transaction);

      // Respond with success and include PIN if generated
      return res.json({
        status: true,
        reference: data.reference,
        authorization_url: data.authorization_url,
        access_code: data.access_code,
        ...(generatedPin && { pin: generatedPin }),
      });
    }

    console.log('Webhook processed successfully');
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export const paymentRedirect = asyncHandler(async (req, res) => {
  const reference = req.query.reference;

  if (!reference) {
    return res.redirect('/user/index?payment=failed');
  }

  try {
    // Verify transaction with Paystack
    const verifyUrl = `${process.env.PAYSTACK_BASE_URL}/transaction/verify/${reference}`;
    const response = await axios.get(verifyUrl, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const transaction = response.data.data;

    // Check if the payment was successful
    if (transaction.status === 'success') {
      // Redirect to user page with success
      return res.redirect(`/user/index?payment=success&reference=${reference}`);
    } else {
      // Redirect to user page with failure
      return res.redirect('/user/index?payment=failed');
    }
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return res.redirect('/user/index?payment=error');
  }
});
