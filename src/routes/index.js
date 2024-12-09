import express from 'express';
const router = express.Router();

import pageRoute from './pageRoute.js';
import authRoute from './authRoute.js';
import userRoute from './userRoute.js';
import adminRoute from './adminRoute.js';
import paymentRoute from './paymentRoute.js';

router.use('/', pageRoute);
router.use('/auth', authRoute);
router.use('/user', userRoute);
router.use('/admin', adminRoute);
router.use('/payment', paymentRoute);

export { router };
