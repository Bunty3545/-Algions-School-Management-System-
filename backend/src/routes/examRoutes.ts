import { Router } from 'express';
import * as examController from '../controllers/examController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles, verifyGuardianStudentAccess } from '../middleware/rbac';
import { validateRequest } from '../middleware/validator';

const router = Router();

router.use(authenticate);

router.get('/', examController.getExams);
router.post(
  '/',
  authorizeRoles('ADMIN'),
  validateRequest({ body: examController.createExamSchema }),
  examController.createExam
);

router.get('/:examId/schedules', examController.getExamSchedules);
router.post(
  '/schedules',
  authorizeRoles('ADMIN'),
  validateRequest({ body: examController.createScheduleSchema }),
  examController.createExamSchedule
);

router.get(
  '/schedules/:scheduleId/sheet',
  authorizeRoles('ADMIN', 'TEACHER'),
  examController.getMarksSheet
);

router.post(
  '/marks',
  authorizeRoles('ADMIN', 'TEACHER'),
  validateRequest({ body: examController.submitMarksSchema }),
  examController.submitMarks
);

router.get(
  '/:examId/report-card/:studentId',
  verifyGuardianStudentAccess('studentId'),
  examController.getReportCard
);

export default router;
