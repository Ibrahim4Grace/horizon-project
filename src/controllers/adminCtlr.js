import { asyncHandler } from '../utils/asyncHandler.js';
import { cloudinary } from '../configs/index.js';
import { config } from '../configs/index.js';
import {
  newAdmin,
  sendMail,
  updateAdminProfile,
  contactUsReply,
  sendBroadcastTemplate,
} from '../utils/index.js';
import { ResourceNotFound } from '../middlewares/index.js';
import {
  User,
  Course,
  Pin,
  PurchaseHistory,
  Admin,
  ContactUs,
  BroadCastMessage,
} from '../models/index.js';

export const adminIndex = asyncHandler(async (req, res) => {
  const admin = req.currentAdmin;

  // Count total number of users in the database
  const totalUsers = await User.countDocuments();

  // Count total number of courses purchased
  const totalCourses = await PurchaseHistory.countDocuments({
    itemType: 'course',
  });

  // Count total number of pin purchases
  const totalPins = await PurchaseHistory.countDocuments({
    itemType: 'pin',
  });

  // Sum total amount of all purchases
  const totalAmount = await PurchaseHistory.aggregate([
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);

  const totalSpent = totalAmount.length > 0 ? totalAmount[0].totalAmount : 0;

  const { results, currentPage, totalPages, limit } = res.paginatedResults;

  // Fetch user details for each purchase
  const purchasesWithUserDetails = await Promise.all(
    results.map(async (purchase) => {
      const userDetails = await User.findById(purchase.user).select(
        'full_name phone_number'
      );
      return {
        ...purchase,
        userDetails: userDetails || null,
      };
    })
  );

  res.render('admin/index', {
    admin,
    totalUsers,
    totalCourses,
    totalPins,
    totalSpent,
    purchases: purchasesWithUserDetails,
    currentPage,
    totalPages,
    limit,
  });
});

export const uploadAdminImage = asyncHandler(async (req, res) => {
  const admin = req.currentAdmin;

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
  admin.image = image;
  await admin.save();
  const callbackUrl = '/admin/index';
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

export const editCoursePost = asyncHandler(async (req, res) => {
  const courseId = req.params.courseId;

  if (!courseId) {
    throw new ResourceNotFound('Course not found!');
  }

  const { name, price } = req.body;

  const updatedCourse = await Course.findByIdAndUpdate(
    courseId,
    {
      $set: {
        name,
        price,
      },
    },
    { new: true }
  );

  if (!updatedCourse) {
    throw new ResourceNotFound('Course  not found or update failed!');
  }

  const redirectUrl = '/admin/course';
  res.status(201).json({
    course: updatedCourse,
    redirectUrl,
    success: true,
    message: 'Course successfully updated',
  });
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const admin = req.currentAdmin;
  const courseId = await Course.findById(req.params.courseId);

  if (!courseId) {
    throw new ResourceNotFound('Course not found.');
  }
  await Course.findByIdAndDelete(req.params.courseId);
  const redirectUrl = '/admin/course';
  res.status(201).json({
    redirectUrl,
    success: true,
    admin,
    message: 'Course deleted successfully',
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

  const { results, currentPage, totalPages, limit } = res.paginatedResults;

  res.render('admin/admins', {
    admin,
    allAdmin: results,
    currentPage,
    totalPages,
    limit,
  });
};

export const addAdmins = asyncHandler(async (req, res) => {
  const admin = req.currentAdmin;
  const { full_name, email, password, phone_number } = req.body;

  const existingAdmin = await Admin.findOne({
    $or: [{ email }, { phone_number }],
  });

  if (existingAdmin) {
    throw new Conflict('Admin with this email or phone number already exists.');
  }

  const admins = new Admin({
    full_name,
    email,
    password,
    phone_number,
    isEmailVerified: true,
  });

  await admins.save();

  const emailContent = newAdmin(admins);
  await sendMail(emailContent);

  res.status(201).json({
    adminUrl: '/admin/admins',
    success: true,
    message: 'Admin added successfully.',
  });
});

export const purchase = asyncHandler(async (req, res) => {
  const admin = req.currentAdmin;

  const { results, currentPage, totalPages, limit } = res.paginatedResults;

  // Fetch user details for each purchase
  const purchasesWithUserDetails = await Promise.all(
    results.map(async (purchase) => {
      const userDetails = await User.findById(purchase.user).select(
        'full_name phone_number'
      );
      return {
        ...purchase,
        userDetails: userDetails || null,
      };
    })
  );

  res.render('admin/purchase', {
    admin,
    purchases: purchasesWithUserDetails,
    currentPage,
    totalPages,
    limit,
  });
});

export const setting = (req, res) => {
  const admin = req.currentAdmin;
  res.render('admin/setting', { admin });
};

export const student = asyncHandler(async (req, res) => {
  const admin = req.currentAdmin;

  const { results, currentPage, totalPages, limit } = res.paginatedResults;

  // Fetch purchase history for each user
  const studentsWithPins = await Promise.all(
    results.map(async (user) => {
      const purchaseHistory = await PurchaseHistory.findOne({
        user: user._id,
        itemType: 'pin',
        paymentStatus: 'completed',
      }).sort({ createdAt: -1 });

      return {
        ...user,
        pinDetails: purchaseHistory || null,
      };
    })
  );

  res.render('admin/student', {
    admin,
    students: studentsWithPins,
    currentPage,
    totalPages,
    limit,
  });
});

export const studentPost = asyncHandler(async (req, res) => {
  const admin = req.currentAdmin;
  const { full_name, email, phone_number, current_password, new_password } =
    req.body;

  const existingAdmin = await Admin.findById(admin._id).select('+password');
  if (!existingAdmin) {
    throw new ResourceNotFound('Admin not found.');
  }

  let updatedFields = {
    full_name,
    email,
    phone_number,
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

  const updatedAdmin = await Admin.findByIdAndUpdate(admin._id, updatedFields, {
    new: true,
  });

  const emailContent = updateAdminProfile(admin, updatedAdmin);
  await sendMail(emailContent);

  const redirectUrl = '/admin/setting';
  return res.status(200).json({
    redirectUrl,
    success: true,
    message: 'Profile updated successfully.',
  });
});

export const editStudentPost = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId;

  if (!studentId) {
    throw new ResourceNotFound('Student not found!');
  }

  const { full_name, course_interest, class_option, phone_number, email } =
    req.body;

  const updatedUser = await User.findByIdAndUpdate(
    studentId,
    {
      $set: {
        full_name,
        course_interest,
        class_option,
        phone_number,
        email,
      },
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new ResourceNotFound('Student not found or update failed!');
  }

  const redirectUrl = '/admin/student';
  return res.status(200).json({
    success: true,
    student: updatedUser,
    redirectUrl,
    message: 'Student successfully updated',
  });
});

export const deleteStudent = asyncHandler(async (req, res) => {
  const admin = req.currentAdmin;
  const studentId = await User.findById(req.params.studentId);

  if (!studentId) {
    throw new ResourceNotFound('User not found.');
  }
  await User.findByIdAndDelete(req.params.courseId);
  const redirectUrl = '/admin/student';
  res.status(201).json({
    redirectUrl,
    success: true,
    admin,
    message: 'User deleted successfully',
  });
});

export const inboxMessage = (req, res) => {
  const admin = req.currentAdmin;
  const { results, currentPage, totalPages, limit } = res.paginatedResults;

  res.render('admin/inbox-message', {
    admin,
    allcontact: results,
    currentPage,
    totalPages,
    limit,
  });
};

export const replyInboxMessage = asyncHandler(async (req, res) => {
  const admin = req.currentAdmin;

  const { email, name, message } = req.body;

  const newContactUs = new ContactUs({
    email,
    name,
    message,
    adminId: admin,
  });
  await newContactUs.save();

  const emailContent = contactUsReply(newContactUs);
  await sendMail(emailContent);
  const redirectUrl = '/admin/inbox-message';

  res.status(200).json({ redirectUrl, message: 'Message sent successfully' });
});

export const deleteContact = asyncHandler(async (req, res) => {
  const admin = req.currentAdmin;
  const contactId = await ContactUs.findById(req.params.contactId);

  if (!contactId) {
    throw new ResourceNotFound('Message not found.');
  }
  await ContactUs.findByIdAndDelete(req.params.contactId);
  const redirectUrl = '/admin/inbox-message';
  res.status(201).json({
    redirectUrl,
    success: true,
    admin,
    message: 'Message deleted successfully',
  });
});

export const sentMessage = (req, res) => {
  const admin = req.currentAdmin;
  const { results, currentPage, totalPages, limit } = res.paginatedResults;

  res.render('admin/sent-message', {
    admin,
    allBroadcastMessage: results,
    currentPage,
    totalPages,
    limit,
  });
};

export const broadcastMessage = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;
  const admin = req.currentAdmin;

  // Get all user emails from database
  const users = await User.find({}, 'email');
  const recipients = users.map((user) => user.email).filter((email) => email);

  if (recipients.length === 0) {
    return res.status(400).json({
      error: 'No recipients found in the database',
    });
  }

  const broadcastMsg = new BroadCastMessage({
    to: recipients,
    subject,
    message,
    adminId: admin._id,
  });
  await broadcastMsg.save();

  const emailTemplate = sendBroadcastTemplate(broadcastMsg);

  // Send in batches
  const BATCH_SIZE = 50;
  const batches = [];
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    batches.push(recipients.slice(i, i + BATCH_SIZE));
  }

  let successCount = 0;
  let failureCount = 0;

  for (const batch of batches) {
    const mailOptions = {
      ...emailTemplate,
      to: config.nodemailerEmail,
      bcc: batch,
    };

    try {
      await sendMail(mailOptions);
      successCount += batch.length;
    } catch (error) {
      console.error(`Failed to send to batch: ${error.message}`);
      failureCount += batch.length;
      continue;
    }

    if (batches.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  const redirectUrl = '/admin/sent-message';
  let successMessage = '';

  if (successCount === recipients.length) {
    successMessage = `Message sent successfully to ${successCount} recipients`;
  } else if (successCount > 0) {
    successMessage = `Partially successful: Sent to ${successCount} out of ${recipients.length} recipients`;
  } else {
    throw new Error('Failed to send any emails');
  }

  res.status(200).json({
    redirectUrl,
    message: successMessage,
  });
});

export const deleteBroadcastMessage = asyncHandler(async (req, res) => {
  const admin = req.currentAdmin;
  const broadcastId = await BroadCastMessage.findById(req.params.broadcastId);

  if (!broadcastId) {
    throw new ResourceNotFound('Message not found.');
  }
  await BroadCastMessage.findByIdAndDelete(req.params.broadcastId);
  const redirectUrl = '/admin/sent-message';
  res.status(201).json({
    redirectUrl,
    success: true,
    admin,
    message: 'Message deleted successfully',
  });
});

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
