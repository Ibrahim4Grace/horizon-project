import bcrypt from 'bcryptjs';
import otpGenerator from 'otp-generator';
import { asyncHandler } from '../utils/asyncHandler.js';
import { OTP } from '../models/index.js';

const hashFunction = async (data) => {
  const saltRounds = 10;
  return bcrypt.hash(data, saltRounds);
};

export const generateOTP = async () => {
  const otp = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  const hashedOTP = await hashFunction(otp);
  return { otp, hashedOTP };
};

export const saveOTPToDatabase = asyncHandler(
  async (userId, otp, hashedOTP) => {
    const newOTP = new OTP({
      userOrAdmin: userId,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    await newOTP.save();
    return otp;
  }
);
