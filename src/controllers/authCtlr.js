import { User, Admin } from '../models/index.js';
import { config } from '../configs/index.js';
import jwt from 'jsonwebtoken';
import { sendJsonResponse } from '../helper/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Unauthorized } from '../middlewares/index.js';
import { generateTokensAndSetCookies } from '../utils/index.js';
import {
  userPasswordService,
  adminPasswordService,
  authServiceInstance,
  adminAuthService,
  userAuthService,
} from '../services/index.js';

export const userRegister = (req, res) => {
  res.render('auth/user/register');
};

export const registerUser = asyncHandler(async (req, res) => {
  const userData = {
    full_name: req.body.full_name,
    email: req.body.email,
    course_interest: req.body.course_interest,
    class_option: req.body.class_option,
    phone_number: req.body.phone_number,
    password: req.body.password,
    promocode: req.body.promocode,
    role: 'User',
  };

  const user = await authServiceInstance.register(userData, User);
  const redirectUrl = '/auth/user/verify-otp';

  const message = user.appliedDiscount
    ? 'Registration successful with promocode discount applied. Please verify your email.'
    : 'Registration successful. Please verify your email.';

  res.status(201).json({
    redirectUrl,
    success: true,
    message,
  });
});

export const userVerifyOtp = (req, res) => {
  res.render('auth/user/verify-otp', { isPasswordReset: false });
};

export const verifyUserOtp = asyncHandler(async (req, res) => {
  await authServiceInstance.verifyOTP(req.body.otp, User);
  const redirectUrl = '/auth/user/login';
  res.status(201).json({
    redirectUrl,
    success: true,
    message: 'Email Verified successfully.',
  });
});

export const adminVerifyOtp = (req, res) => {
  res.render('auth/admin/verify-otp', { isPasswordReset: false });
};

export const verifyAdminOtp = asyncHandler(async (req, res) => {
  await authServiceInstance.verifyOTP(req.body.otp, Admin);
  const redirectUrl = '/auth/admin/login';
  res.status(201).json({
    redirectUrl,
    success: true,
    message: 'Email Verified successfully.',
  });
});

export const userLogins = (req, res) => {
  res.render('auth/user/login');
};

export const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { userId, user, redirectUrl } = await userAuthService.login(
    email,
    password
  );

  const { accessToken, refreshToken } = generateTokensAndSetCookies(
    res,
    userId
  );

  res.status(200).json({
    redirectUrl,
    user,
    accessToken,
    refreshToken,
    success: true,
    message: 'Login successful.',
  });
});

export const adminLogins = (req, res) => {
  res.render('auth/admin/login');
};

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { userId, user, redirectUrl } = await adminAuthService.login(
    email,
    password
  );

  const { accessToken, refreshToken } = generateTokensAndSetCookies(
    res,
    userId
  );

  res.status(200).json({
    redirectUrl,
    user,
    accessToken,
    refreshToken,
    success: true,
    message: 'Login successful.',
  });
});

export const userForgetPassword = (req, res) => {
  res.render('auth/user/forget-password');
};

export const userForgotPassword = asyncHandler(async (req, res) => {
  const message = await userPasswordService.handleForgotPassword(
    req.body.email
  );
  const redirectsUrl = '/auth/user/password/verify-otp';
  res.status(200).json({
    redirectsUrl,
    message,
    success: true,
  });
});

export const adminForgetPassword = (req, res) => {
  res.render('auth/admin/forget-password');
};

export const adminForgotPassword = asyncHandler(async (req, res) => {
  const message = await adminPasswordService.handleForgotPassword(
    req.body.email
  );
  const redirectsUrl = '/auth/admin/password/verify-otp';
  res.status(200).json({
    redirectsUrl,
    message,
    success: true,
  });
});

export const userVerifyPasswordOtpView = (req, res) => {
  res.render('auth/user/verify-otp', { isPasswordReset: true });
};
export const userVerifyPasswordOtp = asyncHandler(async (req, res) => {
  const resetToken = await userPasswordService.handleVerifyOTP(req.body.otp);

  req.session.resetToken = resetToken;
  res.status(200).json({
    resetUrl: '/auth/user/reset-password',
    message: 'OTP verified successfully. You can now reset your password.',
    success: true,
    resetToken,
  });
});

export const adminVerifyPasswordOtpView = (req, res) => {
  res.render('auth/admin/verify-otp', { isPasswordReset: true });
};

export const adminVerifyPasswordOtp = asyncHandler(async (req, res) => {
  const resetToken = await adminPasswordService.handleVerifyOTP(req.body.otp);
  req.session.resetToken = resetToken;
  res.status(200).json({
    resetUrl: '/auth/admin/reset-password',
    message: 'OTP verified successfully. You can now reset your password.',
    success: true,
    resetToken,
  });
});

export const userRestPassword = (req, res) => {
  const resetToken = req.session.resetToken;
  if (!resetToken) {
    return res.redirect('/auth/user/forget-password');
  }

  res.render('auth/user/reset-password', { resetToken });
};

export const userResetPassword = asyncHandler(async (req, res) => {
  const resetToken = req.headers.authorization?.split(' ')[1];
  const message = await userPasswordService.handleResetPassword(
    resetToken,
    req.body.new_password
  );

  if (req.session.resetToken) {
    delete req.session.resetToken;
  }

  res.status(200).json({
    reseDonetUrl: '/auth/user/login',
    message,
    success: true,
    resetToken,
  });
});

export const adminRestPassword = (req, res) => {
  const resetToken = req.session.resetToken;
  if (!resetToken) {
    return res.redirect('/auth/admin/forget-password');
  }
  res.render('auth/admin/reset-password', { resetToken });
};

export const adminResetPassword = asyncHandler(async (req, res) => {
  const resetToken = req.headers.authorization?.split(' ')[1];
  const message = await adminPasswordService.handleResetPassword(
    resetToken,
    req.body.new_password
  );

  if (req.session.resetToken) {
    delete req.session.resetToken;
  }

  res.status(200).json({
    reseDonetUrl: '/auth/admin/login',
    message,
    success: true,
    resetToken,
  });
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new Unauthorized('No refresh token provided');
  }

  const decoded = jwt.verify(refreshToken, config.refreshSecret);

  const account =
    (await Admin.findById(decoded.id)) || (await User.findById(decoded.id));

  if (!account) {
    throw new Unauthorized('Account not found');
  }

  const { accessToken, refreshToken: newRefreshToken } =
    generateTokensAndSetCookies(res, account._id.toString());

  sendJsonResponse(
    res,
    200,
    'Token refreshed successfully',
    null,
    accessToken,
    newRefreshToken
  );
});
