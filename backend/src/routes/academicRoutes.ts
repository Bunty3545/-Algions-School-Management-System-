import { Router } from 'express';
import * as academicController from '../controllers/academicController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import { validateRequest } from '../middleware/validator';

const router = Router();

router.use(authenticate);

// Public to all authenticated users
router.get('/classes', academicController.getClasses);
router.get('/subjects', academicController.getSubjects);
router.get('/teachers', academicController.getTeachers);
router.get('/guardians', authorizeRoles('ADMIN', 'TEACHER'), academicController.getGuardians);
router.get('/my-allocations', authorizeRoles('TEACHER', 'ADMIN'), academicController.getMyTeacherAllocations);
router.get('/students', academicController.getStudents);
router.get('/students/:studentId', academicController.getStudent);

// Admin-only management endpoints
router.post(
  '/students',
  authorizeRoles('ADMIN'),
  validateRequest({ body: academicController.createStudentSchema }),
  academicController.createStudent
);

router.put(
  '/students/:studentId',
  authorizeRoles('ADMIN'),
  academicController.updateStudent
);

router.delete(
  '/students/:studentId',
  authorizeRoles('ADMIN'),
  academicController.deleteStudent
);

router.post(
  '/teachers',
  authorizeRoles('ADMIN'),
  validateRequest({ body: academicController.createTeacherSchema }),
  academicController.createTeacher
);

router.post(
  '/subjects',
  authorizeRoles('ADMIN'),
  validateRequest({ body: academicController.createSubjectSchema }),
  academicController.createSubject
);

router.post(
  '/classes',
  authorizeRoles('ADMIN'),
  validateRequest({ body: academicController.createClassSchema }),
  academicController.createClass
);

router.post(
  '/sections',
  authorizeRoles('ADMIN'),
  validateRequest({ body: academicController.createSectionSchema }),
  academicController.createSection
);

router.post(
  '/assign-teacher',
  authorizeRoles('ADMIN'),
  validateRequest({ body: academicController.assignTeacherSchema }),
  academicController.assignTeacher
);

export default router;
