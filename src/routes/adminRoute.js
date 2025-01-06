import { Router } from 'express';
import * as adminCtlr from '../controllers/index.js';
import { authMiddleware, adminMiddleware } from '../middlewares/index.js';
import { validateData } from '../middlewares/index.js';
import { paginatedResults } from '../utils/index.js';
import { adminImage } from '../configs/index.js';
import {
  Course,
  Pin,
  User,
  PurchaseHistory,
  Admin,
  ContactUs,
  BroadCastMessage,
} from '../models/index.js';
import {
  courseSchema,
  pinSchema,
  adminRegisterSchema,
  updateadminSchema,
  contactSchema,
  broadcastSchema,
} from '../schemas/index.js';

const adminRoute = Router();

adminRoute.get(
  '/index',
  authMiddleware,
  adminMiddleware,
  paginatedResults(PurchaseHistory),
  adminCtlr.adminIndex
);

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
adminRoute.put(
  '/courses/:courseId',
  authMiddleware,
  adminMiddleware,
  validateData(courseSchema),
  adminCtlr.editCoursePost
);
adminRoute.delete(
  '/courses/:courseId',
  authMiddleware,
  adminMiddleware,
  adminCtlr.deleteCourse
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
  '/admins',
  authMiddleware,
  adminMiddleware,
  paginatedResults(Admin),
  adminCtlr.addAdmin
);
adminRoute.post(
  '/admins',
  authMiddleware,
  adminMiddleware,
  validateData(adminRegisterSchema),
  adminCtlr.addAdmins
);
adminRoute.get(
  '/purchase',
  authMiddleware,
  adminMiddleware,
  paginatedResults(PurchaseHistory),
  adminCtlr.purchase
);
adminRoute.get(
  '/certificate',
  authMiddleware,
  adminMiddleware,
  adminCtlr.certificate
);
adminRoute.post(
  '/unlock-certificate',
  authMiddleware,
  adminMiddleware,
  adminCtlr.unlockCertificate
);
adminRoute.get('/setting', authMiddleware, adminMiddleware, adminCtlr.setting);
adminRoute.post(
  '/setting',
  authMiddleware,
  adminMiddleware,
  validateData(updateadminSchema),
  adminCtlr.studentPost
);
adminRoute.get(
  '/student',
  authMiddleware,
  adminMiddleware,
  paginatedResults(User),
  adminCtlr.student
);
adminRoute.put(
  '/student/:studentId',
  authMiddleware,
  adminMiddleware,
  adminCtlr.editStudentPost
);
adminRoute.delete(
  '/student/:studentId',
  authMiddleware,
  adminMiddleware,
  adminCtlr.deleteStudent
);

adminRoute.get(
  '/inbox-message',
  authMiddleware,
  adminMiddleware,
  paginatedResults(ContactUs),
  adminCtlr.inboxMessage
);

adminRoute.post(
  '/inbox-message',
  authMiddleware,
  adminMiddleware,
  validateData(contactSchema),
  adminCtlr.replyInboxMessage
);

adminRoute.delete(
  '/inbox-message/:contactId',
  authMiddleware,
  adminMiddleware,
  adminCtlr.deleteContact
);

adminRoute.get(
  '/sent-message',
  authMiddleware,
  adminMiddleware,
  paginatedResults(BroadCastMessage),
  adminCtlr.sentMessage
);

adminRoute.post(
  '/sent-message',
  authMiddleware,
  adminMiddleware,
  validateData(broadcastSchema),
  adminCtlr.broadcastMessage
);

adminRoute.delete(
  '/sent-message/:broadcastId',
  authMiddleware,
  adminMiddleware,
  adminCtlr.deleteBroadcastMessage
);

adminRoute.delete(
  '/signOut',
  authMiddleware,
  adminMiddleware,
  adminCtlr.adminLogout
);

export default adminRoute;
