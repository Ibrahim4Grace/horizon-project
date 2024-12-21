import { asyncHandler } from '../utils/asyncHandler.js';
import { User, Course, Pin, PurchaseHistory } from '../models/index.js';
import bcrypt from 'bcryptjs';
import { cloudinary } from '../configs/index.js';
import { ResourceNotFound, BadRequest } from '../middlewares/index.js';
import { updateProfile, sendMail } from '../utils/index.js';

export const userIndex = asyncHandler(async (req, res) => {
  const user = req.currentUser;

  // Get the user's course interest
  const userInfo = await User.findById(user._id).select('course_interest');

  // Count the number of courses the user has purchased
  const courseCount = await PurchaseHistory.countDocuments({
    user: user._id,
    itemType: 'course',
  });

  // Get the user's PIN number from the latest 'pin' purchase
  const userPinHistory = await PurchaseHistory.findOne({
    user: user._id,
    itemType: 'pin',
  }).sort({ purchaseDate: -1 });

  const pinNumber = userPinHistory ? userPinHistory.pin_number : null;

  // Sum the total amount spent on both courses and pins
  const totalAmount = await PurchaseHistory.aggregate([
    {
      $match: {
        user: user._id,
        $or: [{ itemType: 'course' }, { itemType: 'pin' }],
      },
    }, // Match both 'course' and 'pin' items
    { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
  ]);

  const totalSpent = totalAmount.length > 0 ? totalAmount[0].totalAmount : 0;

  const { results, currentPage, totalPages } = res.paginatedResults;

  res.render('user/index', {
    user,
    courseCount,
    pinNumber,
    totalSpent,
    courseInterest: userInfo.course_interest,
    allPurchase: results,
    currentPage,
    totalPages,
  });
});

export const uploadUserImage = asyncHandler(async (req, res) => {
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

export const purchasePin = asyncHandler(async (req, res) => {
  const user = req.currentUser;
  const pins = await Pin.find({}).select('duration price').lean();

  const purchaseHistory = await PurchaseHistory.find({
    user: user._id,
    itemType: 'pin',
    paymentStatus: 'completed',
  }).lean();

  // Map over pins and add pin_number from purchase history if it exists
  const enhancedPins = pins.map((pin) => {
    const purchase = purchaseHistory.find(
      (ph) => ph.pin && ph.pin.toString() === pin._id.toString()
    );

    return {
      ...pin,
      pin_number: purchase?.pin_number || 'Pending',
    };
  });

  res.render('user/purchase-pin', {
    user,
    pins: enhancedPins,
    purchaseHistory,
  });
});

export const purchaseCourse = asyncHandler(async (req, res) => {
  const user = req.currentUser;
  const courses = await Course.find({}).select('name duration price').lean();

  // Check if user has a valid pin
  const validPin = await PurchaseHistory.findOne({
    user: user._id,
    itemType: 'pin',
    paymentStatus: 'completed',
    pin_number: { $exists: true, $ne: 'Pending' },
  }).lean();

  // Get user's purchased courses
  const purchasedCourses = await PurchaseHistory.find({
    user: user._id,
    itemType: 'course',
    paymentStatus: 'completed',
  })
    .select('course')
    .lean();

  const purchasedCourseIds = purchasedCourses.map((ph) => ph.course.toString());

  // Add isPurchased flag to each course
  const coursesWithPurchaseStatus = courses.map((course) => ({
    ...course,
    isPurchased: purchasedCourseIds.includes(course._id.toString()),
  }));

  const hasValidPin = !!validPin;

  res.render('user/purchase-course', {
    user,
    courses: coursesWithPurchaseStatus,
    hasValidPin,
  });
});

export const makePayment = asyncHandler(async (req, res) => {
  const user = req.currentUser;
  const { pinId, courseId } = req.query;

  let pin = null;
  let course = null;

  if (pinId) {
    pin = await Pin.findById(pinId);
    if (!pin) {
      throw new ResourceNotFound('Pin not found!');
    }
  }

  if (courseId) {
    course = await Course.findById(courseId);
    if (!course) {
      throw new ResourceNotFound('Course not found!');
    }
  }

  if (!pin && !course) {
    throw new BadRequest('Either pinId or courseId must be provided!');
  }

  res.render('user/payment', { user, pin, course });
});

export const successPage = (req, res) => {
  const user = req.currentUser;
  res.render('user/success', { user });
};

export const userPurchaseHistory = (req, res) => {
  const user = req.currentUser;

  const { results, currentPage, totalPages } = res.paginatedResults;

  res.render('user/purchase-history', {
    user,
    allPurchase: results,
    currentPage,
    totalPages,
  });
};

export const userSettings = (req, res) => {
  const user = req.currentUser;
  res.render('user/setting', { user });
};

export const userSettingsPost = asyncHandler(async (req, res) => {
  const user = req.currentUser;
  const {
    full_name,
    email,
    dob,
    phone_number,
    current_password,
    new_password,
    home_address,
  } = req.body;

  const existingUser = await User.findById(user._id).select('+password');
  if (!existingUser) {
    throw new ResourceNotFound('User not found.');
  }

  let updatedFields = {
    full_name,
    email,
    dob,
    phone_number,
    home_address,
  };

  if (current_password && new_password) {
    const isPasswordMatch = await bcrypt.compare(
      current_password,
      existingUser.password
    );

    if (!isPasswordMatch) {
      throw new BadRequest('Current password is incorrect.');
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    updatedFields.password = hashedPassword;
  }

  const updatedUser = await User.findByIdAndUpdate(user._id, updatedFields, {
    new: true,
  });

  const emailContent = updateProfile(user, updatedUser);
  await sendMail(emailContent);

  const redirectUrl = '/user/setting';
  return res.status(200).json({
    redirectUrl,
    success: true,
    message: 'Profile updated successfully.',
  });
});

export const userTest = (req, res) => {
  const user = req.currentUser;
  res.render('user/test', { user });
};

export const userCourseware = (req, res) => {
  const user = req.currentUser;
  res.render('user/courseware', { user });
};

export const userCertificate = (req, res) => {
  const user = req.currentUser;
  res.render('user/certificate', { user });
};

export const userMessage = (req, res) => {
  const user = req.currentUser;
  res.render('user/message', { user });
};

export const userLogout = asyncHandler(async (req, res) => {
  const logoutRedirectUrl = '/auth/user/login';
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
