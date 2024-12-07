import { Router } from 'express';

import * as adminCtlr from '../controllers/index.js';
import { authMiddleware, adminMiddleware } from '../middlewares/index.js';
import { User, Course } from '../models/index.js';
import { validateData } from '../middlewares/index.js';
import { paginatedResults } from '../utils/index.js';
import { courseSchema } from '../schemas/index.js';

const adminRoute = Router();

adminRoute.get('/index', authMiddleware, adminMiddleware, adminCtlr.adminIndex);
adminRoute.get(
  '/course',
  authMiddleware,
  adminMiddleware,
  paginatedResults(Course),
  adminCtlr.addCourses
);
adminRoute.post(
  '/course',
  authMiddleware,
  adminMiddleware,
  validateData(courseSchema),
  adminCtlr.addCoursesPost
);
adminRoute.get(
  '/all-admin',
  authMiddleware,
  adminMiddleware,
  adminCtlr.addAdmin
);
adminRoute.get(
  '/purchase',
  authMiddleware,
  adminMiddleware,
  adminCtlr.purchase
);
adminRoute.get('/setting', authMiddleware, adminMiddleware, adminCtlr.setting);
adminRoute.get('/student', authMiddleware, adminMiddleware, adminCtlr.student);

export default adminRoute;
