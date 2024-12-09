import { asyncHandler } from '../utils/asyncHandler.js';
import { User, Course, Pin } from '../models/index.js';
import { cloudinary } from '../configs/index.js';

export const adminIndex = (req, res) => {
  const admin = req.currentAdmin;
  res.render('admin/index', { admin });
};

export const uploadAdminImage = asyncHandler(async (req, res) => {
  const user = req.currentUser;

  const file = req.file;
  if (!file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded.',
    });
  }

  const cloudinaryResult = await cloudinary.uploader.upload(file.path);

  const image = {
    imageId: cloudinaryResult.public_id,
    imageUrl: cloudinaryResult.secure_url,
  };
  user.image = image;
  await user.save();
  const callbackUrl = '/user/index';
  return res.status(200).json({
    callbackUrl,
    success: true,
    message: 'Image uploaded successfully',
  });
});

export const addCourses = (req, res) => {
  const admin = req.currentAdmin;

  const { results, currentPage, totalPages, limit } = res.paginatedResults;

  res.render('admin/course', {
    admin,
    courses: results,
    currentPage,
    totalPages,
    limit,
  });
};

export const addCoursesPost = asyncHandler(async (req, res) => {
  const admin = req.currentAdmin;
  const { price, name } = req.body;

  const existingCourse = await Course.findOne({ name });
  if (existingCourse) {
    throw new Conflict('Course already registered');
  }

  const course = new Course({
    price,
    name,
  });

  await course.save();

  res.status(201).json({
    courseUrl: '/admin/course',
    success: true,
    message: 'Course added successfully.',
  });
});

export const addPins = (req, res) => {
  const admin = req.currentAdmin;

  const { results, currentPage, totalPages, limit } = res.paginatedResults;

  res.render('admin/pin', {
    admin,
    pins: results,
    currentPage,
    totalPages,
    limit,
  });
};

export const addPinsPost = asyncHandler(async (req, res) => {
  const admin = req.currentAdmin;
  const { price, name } = req.body;

  const existingPin = await Pin.findOne({ name });
  if (existingPin) {
    throw new Conflict('Pin already registered');
  }

  const pin = new Pin({
    price,
    name,
  });

  await pin.save();

  res.status(201).json({
    pinUrl: '/admin/pin',
    success: true,
    message: 'Pin added successfully.',
  });
});

export const addAdmin = (req, res) => {
  const admin = req.currentAdmin;
  res.render('admin/all-admin', { admin });
};

export const purchase = (req, res) => {
  const admin = req.currentAdmin;
  res.render('admin/purchase', { admin });
};

export const setting = (req, res) => {
  const admin = req.currentAdmin;
  res.render('admin/setting', { admin });
};

export const student = (req, res) => {
  const admin = req.currentAdmin;
  res.render('admin/student', { admin });
};

export const adminLogout = asyncHandler(async (req, res) => {
  const logoutRedirectUrl = '/auth/admin/login';
  res.clearCookie('accessToken', '', {
    expires: new Date(0),
  });
  res.clearCookie('refreshToken', '', {
    expires: new Date(0),
  });

  res
    .status(200)
    .json({ logoutRedirectUrl, success: true, message: 'You are logged out!' });
  res.end();
});
