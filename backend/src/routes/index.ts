import { Router } from 'express';
import authRoutes from './authRoutes';
import academicRoutes from './academicRoutes';
import attendanceRoutes from './attendanceRoutes';
import examRoutes from './examRoutes';
import feeRoutes from './feeRoutes';
import auditRoutes from './auditRoutes';
import dashboardRoutes from './dashboardRoutes';
import * as academicController from '../controllers/academicController';
import * as feeController from '../controllers/feeController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import { validateRequest } from '../middleware/validator';

const apiRouter = Router();

// Primary core API groups
apiRouter.use('/auth', authRoutes);
apiRouter.use('/academic', academicRoutes);
apiRouter.use('/attendance', attendanceRoutes);
apiRouter.use('/exams', examRoutes);
apiRouter.use('/fees', feeRoutes);
apiRouter.use('/audit', auditRoutes);
apiRouter.use('/dashboard', dashboardRoutes);

// Direct top-level resource aliases matching Section 12 Specification
// Students
apiRouter.get('/students', authenticate, academicController.getStudents);
apiRouter.get('/students/:studentId', authenticate, academicController.getStudent);
apiRouter.post('/students', authenticate, authorizeRoles('ADMIN'), validateRequest({ body: academicController.createStudentSchema }), academicController.createStudent);
apiRouter.put('/students/:studentId', authenticate, authorizeRoles('ADMIN'), academicController.updateStudent);
apiRouter.delete('/students/:studentId', authenticate, authorizeRoles('ADMIN'), academicController.deleteStudent);

// Guardians
apiRouter.get('/guardians', authenticate, authorizeRoles('ADMIN', 'TEACHER'), academicController.getGuardians);

// Teachers
apiRouter.get('/teachers', authenticate, academicController.getTeachers);
apiRouter.post('/teachers', authenticate, authorizeRoles('ADMIN'), validateRequest({ body: academicController.createTeacherSchema }), academicController.createTeacher);

// Classes & Sections
apiRouter.get('/classes', authenticate, academicController.getClasses);
apiRouter.post('/classes', authenticate, authorizeRoles('ADMIN'), validateRequest({ body: academicController.createClassSchema }), academicController.createClass);
apiRouter.post('/sections', authenticate, authorizeRoles('ADMIN'), validateRequest({ body: academicController.createSectionSchema }), academicController.createSection);
apiRouter.post('/teacher-assignments', authenticate, authorizeRoles('ADMIN'), validateRequest({ body: academicController.assignTeacherSchema }), academicController.assignTeacher);

// Subjects
apiRouter.get('/subjects', authenticate, academicController.getSubjects);
apiRouter.post('/subjects', authenticate, authorizeRoles('ADMIN'), validateRequest({ body: academicController.createSubjectSchema }), academicController.createSubject);

// Results, Payments, Reports, Audit Logs
apiRouter.use('/results', examRoutes);
apiRouter.post('/payments', authenticate, validateRequest({ body: feeController.recordPaymentSchema }), feeController.payInvoice);
apiRouter.use('/reports', dashboardRoutes);
apiRouter.use('/audit-logs', auditRoutes);

export default apiRouter;
