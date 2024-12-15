import crypto from 'crypto';
import { generateOTP } from '../utils/index.js';
import { Payment, PurchaseHistory, OTP } from '../models/index.js';

export function calculatePaystackSignature(secret, eventData, signature) {
  const hmac = crypto.createHmac('sha512', secret);
  const expectedSignature = hmac
    .update(JSON.stringify(eventData))
    .digest('hex');
  return expectedSignature === signature;
}

export async function completeTransferTransaction(transaction) {
  try {
    // Update transaction status
    transaction.status = 'completed';
    await transaction.save();

    let generatedPin = null;
    if (transaction.itemType === 'pin') {
      let otpExists = true;
      while (otpExists) {
        const { otp } = await generateOTP();
        otpExists = await OTP.exists({ otp });
        if (!otpExists) {
          generatedPin = otp;
        }
      }
    }

    // Create payment record
    const payment = new Payment({
      user: transaction.userId,
      status: 'active',
      itemId: transaction.itemId,
      paymentReference: transaction.reference,
      amount: transaction.amount,
      paymentStatus: 'completed',
      paymentDetails: {
        amount: transaction.amount,
        channel: transaction.type,
        paidAt: new Date(),
        transactionDate: new Date(),
      },
    });
    await payment.save();
    payment.activatePayment();
    await payment.save();

    // Create purchase history with PIN if applicable
    await PurchaseHistory.create({
      user: transaction.userId,
      [transaction.itemType]: transaction.itemId,
      itemType: transaction.itemType,
      amount: transaction.amount,
      paymentStatus: 'completed',
      paymentReference: transaction.reference,
      ...(generatedPin && { pin_number: generatedPin }),
    });

    return generatedPin;
  } catch (error) {
    console.error('Complete transaction error:', error);
    throw error;
  }
}
