import { Subscription } from '../models/index.js';
import { config } from '../configs/index.js';
import https from 'https';
import { sendJsonResponse } from '../helper/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { log } from '../utils/index.js';
import {
  ServerError,
  BadRequest,
  ResourceNotFound,
} from '../middlewares/index.js';

export const initializeSubscription = asyncHandler(async (req, res) => {
  const { planId } = req.body;
  const user = req.currentUser;

  const plan = await Plan.findById(planId);
  if (!plan) {
    throw new ResourceNotFound('Plan not found');
  }

  // Convert price string to number and remove commas if present
  const priceInNaira = Number(plan.price.toString().replace(/,/g, ''));
  const priceInKobo = priceInNaira * 100;

  if (isNaN(priceInKobo) || priceInKobo <= 0) {
    throw new Error('Invalid price calculation');
  }

  // Initialize Paystack transaction
  const params = JSON.stringify({
    email: user.email,
    amount: priceInKobo,
    callback_url: `${config.frontendDevUrl}/payment/callback`,
    metadata: {
      user: user._id,
      plan_id: planId,
    },
  });

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/transaction/initialize',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.paystackSecret}`,
      'Content-Type': 'application/json',
    },
  };

  return new Promise((resolve, reject) => {
    const paystackRequest = https.request(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', async () => {
        try {
          const result = JSON.parse(data);
          log.info('Paystack parsed response:', result);

          if (result.status) {
            const subscription = await Subscription.create({
              user: user._id,
              plan: planId,
              paymentReference: result.data.reference,
              amount: priceInNaira,
              paymentStatus: 'pending',
              status: 'inactive',
            });

            res.json({
              success: true,
              authorization_url: result.data.authorization_url,
              reference: result.data.reference,
              subscription: subscription,
            });
            resolve();
          } else {
            throw new ResourceNotFound('Payment initialization failed');
          }
        } catch (error) {
          log.error('Error processing Paystack response:', error);
          reject(error);
        }
      });
    });

    paystackRequest.on('error', (error) => {
      log.error('Paystack request error:', error);
      reject(new ServerError('Payment service error'));
    });

    paystackRequest.write(params);
    paystackRequest.end();
  });
});

export const verifySubscription = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: `/transaction/verify/${reference}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${config.paystackSecret}`,
    },
  };

  return new Promise((resolve, reject) => {
    const verifyRequest = https.request(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', async () => {
        try {
          const result = JSON.parse(data);
          log.info('Paystack verification response:', result);

          if (result.status && result.data.status === 'success') {
            const subscription = await Subscription.findOne({
              paymentReference: reference,
            });

            if (!subscription) {
              throw new ResourceNotFound('Subscription not found');
            }

            // Use the new method to activate subscription
            subscription.activateSubscription();

            // Add payment details Convert back to Naira
            subscription.paymentDetails = {
              amount: result.data.amount / 100,
              channel: result.data.channel,
              paidAt: new Date(result.data.paid_at),
              transactionDate: new Date(result.data.transaction_date),
            };

            await subscription.save();

            sendJsonResponse(
              res,
              200,
              'Subscription activated successfully',
              subscription
            );
            resolve();
          } else {
            throw new BadRequest(
              `Payment verification failed: ${
                result.message || 'Unknown error'
              }`
            );
          }
        } catch (error) {
          log.error('Error processing verification:', error);
          reject(error);
        }
      });
    });

    verifyRequest.on('error', (error) => {
      log.error('Verification request error:', error);
      reject(new ServerError('Verification service error'));
    });

    verifyRequest.end();
  });
});
