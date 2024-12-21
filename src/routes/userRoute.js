import { Router } from 'express';

import * as userCtlr from '../controllers/index.js';
import { authMiddleware, userMiddleware } from '../middlewares/index.js';
import { paginatedResults } from '../utils/index.js';
import { PurchaseHistory } from '../models/index.js';
import { userImage } from '../configs/index.js';
import { validateData } from '../middlewares/index.js';
import { updateDataSchema } from '../schemas/index.js';

const userRoute = Router();

userRoute.get(
  '/index',
  authMiddleware,
  userMiddleware,
  paginatedResults(PurchaseHistory),
  userCtlr.userIndex
);

userRoute.post(
  '/uploadUserImage',
  authMiddleware,
  userMiddleware,
  userImage.single('image'),
  userCtlr.uploadUserImage
);

userRoute.get(
  '/purchase-pin',
  authMiddleware,
  userMiddleware,
  userCtlr.purchasePin
);
userRoute.get(
  '/purchase-course',
  authMiddleware,
  userMiddleware,
  userCtlr.purchaseCourse
);
userRoute.get('/payment', authMiddleware, userMiddleware, userCtlr.makePayment);

userRoute.get('/success', authMiddleware, userMiddleware, userCtlr.successPage);

userRoute.get(
  '/purchase-history',
  authMiddleware,
  userMiddleware,
  paginatedResults(PurchaseHistory),
  userCtlr.userPurchaseHistory
);
userRoute.get(
  '/setting',
  authMiddleware,
  userMiddleware,
  userCtlr.userSettings
);
userRoute.post(
  '/setting',
  authMiddleware,
  userMiddleware,
  validateData(updateDataSchema),
  userCtlr.userSettingsPost
);
userRoute.get('/test', authMiddleware, userMiddleware, userCtlr.userTest);
userRoute.get(
  '/courseware',
  authMiddleware,
  userMiddleware,
  userCtlr.userCourseware
);

userRoute.get(
  '/certificate',
  authMiddleware,
  userMiddleware,
  userCtlr.userCertificate
);

userRoute.get('/message', authMiddleware, userMiddleware, userCtlr.userMessage);

userRoute.delete(
  '/signOut',
  authMiddleware,
  userMiddleware,
  userCtlr.userLogout
);

export default userRoute;
