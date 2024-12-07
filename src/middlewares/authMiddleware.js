import jwt from 'jsonwebtoken';
import { config } from '../configs/index.js';
import mongoose from 'mongoose';
import { User, Admin } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  Unauthorized,
  ResourceNotFound,
  Forbidden,
} from '../middlewares/index.js';

export const authMiddleware = asyncHandler(async (req, res, next) => {
  const accessToken =
    req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

  if (!accessToken) {
    throw new Unauthorized('Sign in to access this pagea');
  }
  try {
    const decodedAccessToken = jwt.verify(accessToken, config.accessToken);

    if (!mongoose.Types.ObjectId.isValid(decodedAccessToken.id)) {
      throw new Unauthorized('Invalid user ID format');
    }

    req.user = decodedAccessToken;
    next();
  } catch (err) {
    return next(
      new Unauthorized('Invalid or expired token. Please sign in again.')
    );
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
