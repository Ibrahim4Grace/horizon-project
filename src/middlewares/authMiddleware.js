import jwt from 'jsonwebtoken';
import { config } from '../configs/index.js';
import mongoose from 'mongoose';
import { User, Admin } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ResourceNotFound, Forbidden } from '../middlewares/index.js';

// export const authMiddleware = asyncHandler(async (req, res, next) => {
//   const accessToken =
//     req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

//   const isAdminRoute =
//     req.originalUrl.includes('/admin') ||
//     req.originalUrl.includes('/auth/admin');
//   const loginRedirectUrl = isAdminRoute
//     ? '/auth/admin/login'
//     : '/auth/user/login';

//   const isTrustedRedirect = req.originalUrl.includes('/payment/redirect');

//   if (!accessToken) {
//     if (isTrustedRedirect) {
//       // Optionally log the event for monitoring
//       console.log('Bypassing auth for trusted redirect');
//       return next();
//     }
//     return res.redirect(loginRedirectUrl);
//   }

//   // if (!accessToken) {
//   //   return res.redirect(loginRedirectUrl);
//   // }

//   try {
//     const decodedAccessToken = jwt.verify(accessToken, config.accessToken);

//     if (!mongoose.Types.ObjectId.isValid(decodedAccessToken.id)) {
//       return res.redirect(loginRedirectUrl);
//     }

//     req.user = decodedAccessToken;
//     next();
//   } catch (err) {
//     return res.redirect(loginRedirectUrl);
//   }
// });

export const authMiddleware = asyncHandler(async (req, res, next) => {
  const accessToken =
    req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

  const isAdminRoute =
    req.originalUrl.includes('/admin') ||
    req.originalUrl.includes('/auth/admin');
  const loginRedirectUrl = isAdminRoute
    ? '/auth/admin/login'
    : '/auth/user/login';

  // Check if this is a payment redirect URL
  const isPaymentRedirect = req.originalUrl.includes('/payment/redirect');

  // If it's a payment redirect, bypass authentication
  if (isPaymentRedirect) {
    console.log('Bypassing auth for payment redirect');
    return next();
  }

  // No token, redirect to login
  if (!accessToken) {
    return res.redirect(loginRedirectUrl);
  }

  try {
    const decodedAccessToken = jwt.verify(accessToken, config.accessToken);

    if (
      !decodedAccessToken ||
      !mongoose.Types.ObjectId.isValid(decodedAccessToken.id)
    ) {
      return res.redirect(loginRedirectUrl);
    }

    req.user = decodedAccessToken;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.redirect(loginRedirectUrl);
  }
});
export const userMiddleware = asyncHandler(async (req, res, next) => {
  const user = await User.findById(new mongoose.Types.ObjectId(req.user.id));
  if (!user) {
    throw new ResourceNotFound('User not found!');
  }

  if (user.role !== 'User') {
    throw new Forbidden('Only user can access this page!');
  }

  if (user.image && user.image.imageUrl) {
    user.imageUrl = user.image.imageUrl;
  }

  req.currentUser = user;
  next();
});

export const adminMiddleware = asyncHandler(async (req, res, next) => {
  const admin = await Admin.findById(new mongoose.Types.ObjectId(req.user.id));
  if (!admin) {
    throw new ResourceNotFound('Admin not found!');
  }

  if (admin.role !== 'Admin') {
    throw new Forbidden('Only admin can access this page!');
  }

  if (admin.image && admin.image.imageUrl) {
    admin.imageUrl = admin.image.imageUrl;
  }

  req.currentAdmin = admin;
  next();
});
