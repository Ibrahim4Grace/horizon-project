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
  // Add detailed logging
  console.log('Current URL:', req.originalUrl);
  console.log('Request method:', req.method);

  // Check for payment redirect first, before any other logic
  if (req.originalUrl.startsWith('/payment/redirect')) {
    console.log('Payment redirect detected - bypassing authentication');
    return next();
  }

  const accessToken =
    req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
  console.log('Access token exists:', !!accessToken);

  const isAdminRoute =
    req.originalUrl.includes('/admin') ||
    req.originalUrl.includes('/auth/admin');
  const loginRedirectUrl = isAdminRoute
    ? '/auth/admin/login'
    : '/auth/user/login';

  if (!accessToken) {
    console.log('No access token found - redirecting to login');
    return res.redirect(loginRedirectUrl);
  }

  try {
    // Verify token and handle potential undefined
    const decodedAccessToken = jwt.verify(accessToken, config.accessToken);
    console.log('Token decoded:', !!decodedAccessToken);

    // Safety check before accessing id
    if (!decodedAccessToken) {
      console.log('Decoded token is null/undefined');
      return res.redirect(loginRedirectUrl);
    }

    if (typeof decodedAccessToken !== 'object') {
      console.log('Decoded token is not an object');
      return res.redirect(loginRedirectUrl);
    }

    if (!decodedAccessToken.id) {
      console.log('No id in decoded token');
      return res.redirect(loginRedirectUrl);
    }

    if (!mongoose.Types.ObjectId.isValid(decodedAccessToken.id)) {
      console.log('Invalid ObjectId in token');
      return res.redirect(loginRedirectUrl);
    }

    req.user = decodedAccessToken;
    return next();
  } catch (err) {
    console.error('Auth middleware error:', {
      message: err.message,
      stack: err.stack,
      tokenExists: !!accessToken,
    });
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
