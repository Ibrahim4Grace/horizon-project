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

// Process payment (both card and transfer)
paymentRouter.post(
  '/initialize',
  authMiddleware,
  userMiddleware,
  paymentCtlr.processPayment
);

// Verify card payment
paymentRouter.get(
  '/verify/:reference',
  authMiddleware,
  userMiddleware,
  paymentCtlr.verifyPayment
);

export default paymentRouter;
