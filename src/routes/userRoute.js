import { Router } from 'express';

import * as userCtlr from '../controllers/index.js';
import { authMiddleware, userMiddleware } from '../middlewares/index.js';

const userRoute = Router();

userRoute.get('/index', authMiddleware, userMiddleware, userCtlr.userIndex);
userRoute.get(
  '/purchase',
  authMiddleware,
  userMiddleware,
  userCtlr.userPurchase
);
userRoute.get(
  '/purchase-history',
  authMiddleware,
  userMiddleware,
  userCtlr.userPurchaseHistory
);
userRoute.get('/data', authMiddleware, userMiddleware, userCtlr.userData);
userRoute.get(
  '/setting',
  authMiddleware,
  userMiddleware,
  userCtlr.userSettings
);

export default userRoute;
