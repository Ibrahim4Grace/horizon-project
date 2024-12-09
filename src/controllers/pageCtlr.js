import { ContactUs } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendMail, contactUsFeedBack } from '../utils/index.js';
export const indexPage = (req, res) => {
  res.render('index');
};

export const contact = (req, res) => {
  res.render('contact');
};

export const contactPage = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  const newContactUs = new ContactUs({
    name,
    email,
    message,
  });

  await newContactUs.save();

  const emailContent = contactUsFeedBack(newContactUs);
  await sendMail(emailContent);
  const redirectUrl = '/';
  res
    .status(201)
    .json({ redirectUrl, success: true, message: 'Message successfully sent' });
});
