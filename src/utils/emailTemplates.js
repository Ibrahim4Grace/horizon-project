import { config } from '../configs/index.js';

export const sendOTPByEmail = async (newUser, otp, otpExpiryHours = 24) => ({
  from: config.nodemailerEmail,
  to: newUser.email,
  subject: 'Your 6-digit Verification Code',
  html: `  <p>Dear ${newUser.full_name}, </p>
      <p>Use the 6-digit Code provided below to verify your email:</p>
      <p>Your verification code is: <b>${otp}</b></p>
      <p>This code will expire in ${otpExpiryHours} hours.</p>
      <p>If you didn't register, please ignore this email.</p>
      <p>Best regards,<br>
          The Horznet Team</p>`,
});

export const welcomeEmail = (user) => ({
  from: config.nodemailerEmail,
  to: user.email,
  subject: 'Welcome to Horznet',
  html: `<p>Hello ${user.full_name},</p>

      <p>Your account has been successfully created, granting you access to our platform's exciting features.</p>
      <p>Should you have any inquiries or require assistance, please don't hesitate to contact our support team.Your satisfaction is our priority, and we are committed to providing you with the assistance you need.</p>
        <p>Best regards,<br>
        The Horznet Team</p>`,
});

export const loginNotification = (admin) => ({
  from: config.nodemailerEmail,
  to: admin.email,
  subject: 'New Login Detected!',
  html: `
            <p>Hello ${admin.full_name},</p>
            
            <p>You recently sign in to your Horznet account. If you initiated the request to sign into Horznet, kindly ignore the mail.</p>

            <p>If you did not initiate the request to sign in to your Horznet account, we strongly advise you to change your account password. Additionally, we encourage you to enable multi-factor authentication to add an additional layer of protection to your Horznet account.</p>
            
            <p>Best regards,<br>
        The Horznet Team</p>`,
});

export const forgetPasswordMsg = (user, otp, otpExpiryHours = 24) => ({
  from: config.nodemailerEmail,
  to: user.email,
  subject: 'Password Reset Request',
  html: `
  <p>Greetings ${user.full_name}  from Horznet Services,</p>
  <p>We received a request to reset the password for the Horznet account associated with this e-mail address.</p>

      <p>Use the 6-digit Code provided below to reset your password:</p>
      <p>Your verification code is: <b>${otp}</b></p>
      <p>This code will expire in ${otpExpiryHours} hours.</p>
      <p>If you did not request to have your password reset, you can safely ignore this email. Rest assured your Horznet Services account is safe.</p>
      <p>Best regards,<br>
      The Horznet Team</p>`,
});

export const sendPasswordResetEmail = (user) => ({
  from: config.nodemailerEmail,
  to: user.email,
  subject: 'Password Reset Confirmation',
  html: `
            <p>Hello ${user.full_name || 'User'},</p>
            <p>Your password has been successfully reset. If you did not perform this action, please contact our support team immediately.</p>

            <p>Best regards,<br>
            The Horznet Team</p>`,
});

export const passwordChangeNotification = (user) => ({
  to: user.email,
  subject: 'Your Password Has Been Changed',
  text: `Hello User,\n\nThis is a confirmation that the password for your account has just been changed. If you did not request this change, please contact our support team immediately.\n\nBest regards,\nThe Horznet Team`,
});

export const updatePassword = (user) => ({
  from: config.nodemailerEmail,
  to: user.email,
  subject: `Password Update Confirmation`,
  html: `
    <h2>Welcome to Horznet!</h2>
    <p>We wanted to inform you that your password has been successfully updated.</p>
    <p>If you did not make this change or if you have any concerns regarding your account security, please contact us immediately.</p>
    <p>Thank you for keeping your account secure!</p>
    <p>Best regards,<br>The Horznet Team</p>
  `,
});
