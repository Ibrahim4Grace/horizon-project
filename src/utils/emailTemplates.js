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

export const updateProfile = (user, updatedUser) => ({
  from: config.nodemailerEmail,
  to: user.email,
  subject: `Your Information Has Been Modified!`,
  html: `
     <p>Dear  ${user.full_name},</p>
    <p>This message is to inform you that there has been an update to your information in our database.</p>

    <p>Your new information:</p>
    <ul>
        <li>Full Name: ${updatedUser.full_name}</li>
        <li>Email Address: ${updatedUser.email}</li>
        <li>Phone Number: ${updatedUser.phone_number}</li>
        <li>Date of Birth: ${updatedUser.dob}</li>
        <li>Home Address: ${updatedUser.home_address}</li>
    </ul>

    <p>Thank you for keeping your account secure!</p>
    <p>Best regards,<br>The Horznet Team</p>
  `,
});

export const contactUsFeedBack = (newContactUs) => ({
  from: config.nodemailerEmail,
  to: newContactUs.email,
  subject: `Thank you for reaching out to us!`,
  html: `
     <p>Dear  ${newContactUs.name},</p>
   <p>We truly appreciate you taking the time to contact us regarding your inquiry. Your message has been received, and our team will get back to you shortly.</p>
    <p>Best regards,<br>The Horznet Team</p>
  `,
});

export const contactUsReply = (newContactUs) => ({
  from: config.nodemailerEmail,
  to: newContactUs.email,
  subject: `Re: Your Inquiry to Hornet`,
  html: `
    <p>Dear User,</p>
    <p>Thank you for your patience. We're following up on your inquiry regarding your message.</p>
    <p>Here's our response:</p>
    <p>${newContactUs.message}</p>
    <p>If you have any further questions, please don't hesitate to contact us.</p>
    <p>Best regards,<br>The Hornet Team</p>
  `,
});

export const newAdmin = (admins) => ({
  from: config.nodemailerEmail,
  to: admins.email,
  subject: 'Welcome to Horznet',
  html: `
    <p>Hello ${admins.full_name},</p>
    <p>Welcome to Horznet! Your admin account has been successfully created. Below are your account details:</p>
    <ul>
      <li><strong>Full Name:</strong> ${admins.full_name}</li>
      <li><strong>Email Address:</strong> ${admins.email}</li>
      <li><strong>Phone Number:</strong> ${admins.phone_number}</li>
      <li><strong>Temporary Password:</strong> 123456</li>
    </ul>
    <p><strong>Important:</strong> Please log in to your account and change your password.</p>
    <p>If you have any questions or need assistance, feel free to contact our support team. We're here to help and ensure you have the best experience on our platform.</p>
    <p>Best regards,</p>
    <p>The Horznet Team</p>
  `,
});

export const updateAdminProfile = (admin, updatedAdmin) => ({
  from: config.nodemailerEmail,
  to: admin.email,
  subject: `Your Information Has Been Modified!`,
  html: `
     <p>Dear  ${admin.full_name},</p>
    <p>This message is to inform you that there has been an update to your information in our database.</p>

    <p>Your new information:</p>
    <ul>
        <li>Full Name: ${updatedAdmin.full_name}</li>
        <li>Email Address: ${updatedAdmin.email}</li>
        <li>Phone Number: ${updatedAdmin.phone_number}</li>
    </ul>

    <p>Thank you for keeping your account secure!</p>
    <p>Best regards,<br>The Horznet Team</p>
  `,
});

export const sendBroadcastTemplate = (broadcastMsg) => ({
  from: config.nodemailerEmail,
  subject: broadcastMsg.subject,
  html: `
    <p>Dear User,</p>
    <p>${broadcastMsg.message}</p>
    <p>Best regards,<br>The Horznet Team</p>
  `,
});
