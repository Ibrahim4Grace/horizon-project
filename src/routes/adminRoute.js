import { Router } from 'express';

import * as adminCtlr from '../controllers/index.js';
import { authMiddleware, adminMiddleware } from '../middlewares/index.js';
import { User, Course, Pin } from '../models/index.js';
import { validateData } from '../middlewares/index.js';
import { paginatedResults } from '../utils/index.js';
import { courseSchema, pinSchema } from '../schemas/index.js';
import { adminImage } from '../configs/index.js';

const adminRoute = Router();

adminRoute.get('/index', authMiddleware, adminMiddleware, adminCtlr.adminIndex);

adminRoute.post(
  '/uploadAdminImage',
  authMiddleware,
  adminMiddleware,
  adminImage.single('image'),
  adminCtlr.uploadAdminImage
);

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
  '/pin',
  authMiddleware,
  adminMiddleware,
  paginatedResults(Pin),
  adminCtlr.addPins
);
adminRoute.post(
  '/pin',
  authMiddleware,
  adminMiddleware,
  validateData(pinSchema),
  adminCtlr.addPinsPost
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

adminRoute.delete(
  '/signOut',
  authMiddleware,
  adminMiddleware,
  adminCtlr.adminLogout
);

export default adminRoute;
