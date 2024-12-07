import { asyncHandler } from '../utils/asyncHandler.js';
import { User, Course } from '../models/index.js';

export const adminIndex = (req, res) => {
  const admin = req.currentAdmin;
  res.render('admin/index', { admin });
};

export const addCourses = (req, res) => {
  const admin = req.currentAdmin;

  const { results, currentPage, totalPages } = res.paginatedResults;

  res.render('admin/course', { admin, results, currentPage, totalPages });
};

export const addCoursesPost = asyncHandler(async (req, res) => {
  const admin = req.currentAdmin;
  const { price, course_name } = req.body;

  const existingCourse = await Course.findOne({ course_name });
  if (existingCourse) {
    throw new Conflict('Course already registered');
  }

  const course = new Course({
    price,
    course_name,
  });

  await course.save();

  res.status(201).json({
    courseUrl: '/admin/course',
    success: true,
    message: 'Course added successfully.',
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
