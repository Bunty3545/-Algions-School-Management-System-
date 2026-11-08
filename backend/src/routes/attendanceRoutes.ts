import { Router } from 'express';
import * as attendanceController from '../controllers/attendanceController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles, verifyTeacherSectionAccess, verifyGuardianStudentAccess } from '../middleware/rbac';
import { validateRequest } from '../middleware/validator';

const router = Router();

router.use(authenticate);

// Record attendance: Teacher (assigned only) or Admin
router.post(
  '/record',
  authorizeRoles('ADMIN', 'TEACHER'),
  verifyTeacherSectionAccess('sectionId'),
  validateRequest({ body: attendanceController.recordAttendanceSchema }),
  attendanceController.recordAttendance
);

// Get section attendance sheet: Teacher (assigned only) or Admin
router.get(
  '/section/:sectionId',
  authorizeRoles('ADMIN', 'TEACHER'),
  verifyTeacherSectionAccess('sectionId'),
  attendanceController.getSectionAttendance
);

// Get individual student attendance: Guardian (linked only), Student (self), Teacher, or Admin
router.get(
  '/student/:studentId',
  verifyGuardianStudentAccess('studentId'),
  attendanceController.getStudentAttendance
);

export default router;
