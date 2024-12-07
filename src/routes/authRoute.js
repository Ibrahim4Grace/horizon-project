import { Router } from 'express';
import { validateData } from '../middlewares/index.js';
import * as authCtlr from '../controllers/index.js';
import {
  registerSchema,
  adminRegisterSchema,
  verifySchema,
  forgetPswdSchema,
  loginSchema,
  newPasswordSchema,
} from '../schemas/index.js';

const authRoute = Router();

authRoute.get('/user/login', authCtlr.userLogins);
authRoute.get('/user/register', authCtlr.userRegister);
authRoute.get('/user/forget-password', authCtlr.userForgetPassword);
authRoute.get('/user/verify-otp', authCtlr.userVerifyOtp);
authRoute.get('/admin/login', authCtlr.adminLogins);
authRoute.get('/admin/register', authCtlr.adminRegister);
authRoute.get('/admin/forget-password', authCtlr.adminForgetPassword);
authRoute.get('/admin/verify-otp', authCtlr.adminVerifyOtp);
authRoute.get('/user/password/verify-otp', authCtlr.userVerifyPasswordOtpView);
authRoute.get(
  '/admin/password/verify-otp',
  authCtlr.adminVerifyPasswordOtpView
);
authRoute.get('/user/reset-password', authCtlr.userRestPassword);
authRoute.get('/admin/reset-password', authCtlr.adminRestPassword);

//USER//
authRoute.post(
  '/user/register',
  validateData(registerSchema),
  authCtlr.registerUser
);

authRoute.post(
  '/admin/register',
  validateData(adminRegisterSchema),
  authCtlr.registerAdmin
);

authRoute.post(
  '/user/verify-otp',
  validateData(verifySchema),
  authCtlr.verifyUserOtp
);

authRoute.post(
  '/admin/verify-otp',
  validateData(verifySchema),
  authCtlr.verifyAdminOtp
);

authRoute.post('/user/login', validateData(loginSchema), authCtlr.userLogin);
authRoute.post('/admin/login', validateData(loginSchema), authCtlr.adminLogin);

authRoute.post(
  '/user/password/forgot',
  validateData(forgetPswdSchema),
  authCtlr.userForgotPassword
);

authRoute.post(
  '/admin/password/forgot',
  validateData(forgetPswdSchema),
  authCtlr.adminForgotPassword
);

authRoute.post(
  '/user/password/verify-otp',
  validateData(verifySchema),
  authCtlr.userVerifyPasswordOtp
);

authRoute.post(
  '/admin/password/verify-otp',
  validateData(verifySchema),
  authCtlr.adminVerifyPasswordOtp
);

authRoute.post(
  '/user/password/reset',
  validateData(newPasswordSchema),
  authCtlr.userResetPassword
);

authRoute.post(
  '/admin/password/reset',
  validateData(newPasswordSchema),
  authCtlr.adminResetPassword
);

authRoute.post('/token/refresh', authCtlr.refreshAccessToken);

export default authRoute;
