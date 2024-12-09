import nodemailer from 'nodemailer';
import { config } from '../configs/index.js';
import { ServerError } from '../middlewares/index.js';

export const sendMail = async (emailcontent) => {
  const transporter = nodemailer.createTransport({
    service: config.mailerService,
    host: 'smtp.gmail.com',
    auth: {
      user: config.nodemailerEmail,
      pass: config.nodemailerPassword,
    },
  });

  try {
    await transporter.sendMail(emailcontent);
    return 'Email sent successfully.';
  } catch (error) {
    console.error(error);
    throw new ServerError(error);
  }
};
