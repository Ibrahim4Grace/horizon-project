import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { config } from '../configs/index.js';

export const generateTokensAndSetCookies = (res, userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid userId format');
  }

  console.log('Config secrets:', {
    accessToken: config.accessToken,
    refreshToken: config.refreshToken,
  });

  const accessToken = jwt.sign({ id: userId }, config.accessToken, {
    expiresIn: config.accessExpireTime,
  });

  const refreshToken = jwt.sign({ id: userId }, config.refreshToken, {
    expiresIn: config.refreshExpireTime,
  });

  console.log('Generated tokens:', { accessToken, refreshToken });

  res.cookie('accessToken', accessToken, {
    maxAge: 15 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.cookie('refreshToken', refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return { accessToken, refreshToken };
};
