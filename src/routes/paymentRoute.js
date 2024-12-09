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

export default paymentRouter;
