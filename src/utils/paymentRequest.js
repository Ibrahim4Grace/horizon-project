import { ServerError } from '../middlewares/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import https from 'https';

export const makePaystackRequest = (options, params) => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          console.error('Failed to parse Paystack response:', error);
          reject(new ServerError('Invalid response from payment service'));
        }
      });
    });

    req.on('error', (error) => {
      console.error('Paystack request error:', error);
      reject(new ServerError('Payment service error'));
    });

    if (params) {
      req.write(params);
    }
    req.end();
  });
};

export const handleSuccessfulPayment = asyncHandler(
  async (payment, paymentData) => {
    payment.status = 'active';
    payment.paymentStatus = 'completed';
    payment.startDate = new Date();
    payment.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (paymentData.authorization) {
      payment.authorization = {
        authorization_code: paymentData.authorization.authorization_code,
        card_type: paymentData.authorization.card_type,
        last4: paymentData.authorization.last4,
        exp_month: paymentData.authorization.exp_month,
        exp_year: paymentData.authorization.exp_year,
        bin: paymentData.authorization.bin,
        bank: paymentData.authorization.bank,
        signature: paymentData.authorization.signature,
        reusable: paymentData.authorization.reusable,
        country_code: paymentData.authorization.country_code,
      };
    }

    await payment.save();
  }
);
