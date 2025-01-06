import { User, OTP, Admin } from '../models/index.js';
import bcrypt from 'bcryptjs';
import { config } from '../configs/index.js';
import jwt from 'jsonwebtoken';
import {
  ResourceNotFound,
  BadRequest,
  Conflict,
  Forbidden,
  Unauthorized,
} from '../middlewares/index.js';
import {
  sendMail,
  forgetPasswordMsg,
  sendPasswordResetEmail,
  generateOTP,
  saveOTPToDatabase,
  sendOTPByEmail,
  welcomeEmail,
  loginNotification,
} from '../utils/index.js';

export class authService {
  async register(userData, Model) {
    const { email, promocode } = userData;

    const existingUser = await Model.findOne({ email });
    if (existingUser) {
      throw new Conflict('Email already registered!');
    }

    // Validate promocode
    const validPromocodes = ['onoyakebet9ja', 'osha', 'ojo'];
    if (promocode && validPromocodes.includes(promocode.toLowerCase())) {
      userData.appliedDiscount = true;
      userData.promocode = promocode;
    }

    const newUser = new Model(userData);
    await newUser.save();

    const { otp, hashedOTP } = await generateOTP();
    await saveOTPToDatabase(newUser._id, otp, hashedOTP);

    const emailContent = await sendOTPByEmail(newUser, otp);
    await sendMail(emailContent);

    return newUser;
  }

  async verifyOTP(otp, Model) {
    const existingOtp = await OTP.findOne({ otp: { $exists: true } });

    if (!existingOtp) {
      throw new BadRequest('Invalid or expired OTP');
    }

    const userId = existingOtp.userOrAdmin;
    const user = await Model.findById(userId);

    if (!user) {
      throw new ResourceNotFound(`${Model.modelName} not found!`);
    }

    const isOTPValid = await bcrypt.compare(otp, existingOtp.otp);

    if (!isOTPValid || new Date() > existingOtp.expiresAt) {
      throw new BadRequest('Invalid or expired OTP');
    }

    user.isEmailVerified = true;
    await user.save();
    await OTP.deleteOne({ _id: existingOtp._id });

    const emailContent = welcomeEmail(user);
    await sendMail(emailContent);

    return user;
  }
}

// Base password reset service
class PasswordResetService {
  constructor(Model, userType) {
    this.Model = Model;
    this.userType = userType;
  }

  async handleForgotPassword(email) {
    const user = await this.Model.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      throw new ResourceNotFound(`${this.userType} email not found`);
    }

    await OTP.deleteMany({ userOrAdmin: user._id });

    const { otp, hashedOTP } = await generateOTP();
    await saveOTPToDatabase(user._id, otp, hashedOTP);

    const emailContent = forgetPasswordMsg(user, otp);
    await sendMail(emailContent);

    return 'Your 6-digit Verification Code has been sent.';
  }

  async handleVerifyOTP(otp) {
    const existingOtp = await OTP.findOne({
      otp: { $exists: true },
      expiresAt: { $gt: new Date() },
    }).select('+otp');

    if (!existingOtp) {
      throw new BadRequest('Invalid or expired OTP');
    }

    const userId = existingOtp.userOrAdmin;
    const user = await this.Model.findById(userId);

    if (!user) {
      throw new ResourceNotFound(`${this.userType} not found!`);
    }

    // Verify OTP
    const isOTPValid = await bcrypt.compare(otp, existingOtp.otp);
    if (!isOTPValid || new Date() > existingOtp.expiresAt) {
      throw new BadRequest('Invalid or expired OTP');
    }

    // Clean up used OTP
    await OTP.deleteOne({ _id: existingOtp._id });

    // Generate reset token
    const resetToken = jwt.sign(
      {
        userId: existingOtp.userOrAdmin,
        type: this.userType.toLowerCase(),
      },
      config.jwtSecret,
      {
        expiresIn: config.jwtExpiry,
        audience: `${this.userType.toLowerCase()}-reset`,
      }
    );

    return resetToken;
  }

  async handleResetPassword(resetToken, new_password) {
    if (!resetToken) {
      throw new BadRequest('Reset token is missing');
    }
    try {
      const decoded = jwt.verify(resetToken, config.jwtSecret, {
        audience: `${this.userType.toLowerCase()}-reset`,
      });

      if (decoded.type !== this.userType.toLowerCase()) {
        throw new BadRequest('Invalid reset token');
      }

      const user = await this.Model.findById(decoded.userId);
      if (!user) {
        throw new ResourceNotFound(`${this.userType} not found`);
      }

      if (!new_password) {
        throw new BadRequest('New password is missing');
      }

      user.password = new_password;
      await user.save();

      // Clean up any remaining OTPs
      await OTP.deleteMany({ userOrAdmin: decoded.userId });

      const emailContent = sendPasswordResetEmail(user);
      await sendMail(emailContent);

      return 'Password reset successfully';
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new BadRequest('Invalid reset token');
      }
      if (error.name === 'TokenExpiredError') {
        throw new BadRequest('Reset token has expired');
      }
      throw error;
    }
  }
}

//login
class AuthLoginervice {
  constructor(model) {
    this.model = model;
  }

  async login(email, password, options = {}) {
    const { redirectPath = '/', shouldSendLoginNotification = false } = options;

    const account = await this.model.findOne({ email }).select('+password');
    if (!account) {
      throw new ResourceNotFound('Invalid email or password');
    }

    if (!account.isEmailVerified) {
      throw new Forbidden('Verify your email before sign in.');
    }

    const isPasswordMatch = await account.matchPassword(password);
    if (!isPasswordMatch) {
      throw new Unauthorized('Invalid email or password');
    }

    if (shouldSendLoginNotification) {
      const emailContent = loginNotification(account);
      await sendMail(emailContent);
    }

    const userId = account._id.toString();

    const userResponse = account.toObject();
    delete userResponse.password;

    return {
      userId,
      user: userResponse,
      redirectUrl: redirectPath,
    };
  }
}

class AdminAuthService extends AuthLoginervice {
  constructor() {
    super(Admin);
  }

  async login(email, password) {
    return super.login(email, password, {
      redirectPath: '/admin/index',
      shouldSendLoginNotification: true,
    });
  }
}

class UserAuthService extends AuthLoginervice {
  constructor() {
    super(User);
  }

  async login(email, password) {
    return super.login(email, password, {
      redirectPath: '/user/index',
    });
  }
}

export const authServiceInstance = new authService();
export const userPasswordService = new PasswordResetService(User, 'User');
export const adminPasswordService = new PasswordResetService(Admin, 'Admin');
export const adminAuthService = new AdminAuthService();
export const userAuthService = new UserAuthService();
