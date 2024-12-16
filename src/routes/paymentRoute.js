import express from 'express';
import * as paymentCtlr from '../controllers/index.js';
import { authMiddleware, userMiddleware } from '../middlewares/index.js';
const paymentRouter = express.Router();

paymentRouter.post(
  '/charge-card',
  authMiddleware,
  userMiddleware,
  paymentCtlr.chargeCard
);
paymentRouter.post(
  '/submit-pin',
  authMiddleware,
  userMiddleware,
  paymentCtlr.submitPin
);
paymentRouter.post(
  '/submit-otp',
  authMiddleware,
  userMiddleware,
  paymentCtlr.submitOtp
);

paymentRouter.post(
  '/initialize',
  authMiddleware,
  userMiddleware,
  paymentCtlr.processPayment
);

paymentRouter.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentCtlr.paystackWebhook
);

paymentRouter.get('/redirect', paymentCtlr.paymentRedirect);

export default paymentRouter;
