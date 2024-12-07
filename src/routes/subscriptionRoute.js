import express from 'express';
import * as subscriptionCtlr from '../controllers/index.js';
import { authMiddleware, userMiddleware } from '../middlewares/index.js';

const subscriptionRouter = express.Router();

subscriptionRouter.post(
  '/initialize',
  authMiddleware,
  userMiddleware,
  subscriptionCtlr.initializeSubscription
);

subscriptionRouter.get(
  '/verify/:reference',
  authMiddleware,
  userMiddleware,
  subscriptionCtlr.verifySubscription
);

export default subscriptionRouter;
