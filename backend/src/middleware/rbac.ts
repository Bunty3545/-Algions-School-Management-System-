import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { prisma } from '../utils/prisma';

export function authorizeRoles(...allowedRoles: Array<'ADMIN' | 'TEACHER' | 'GUARDIAN' | 'STUDENT'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(`Forbidden: Role '${req.user.role}' is not authorized for this resource`)
      );
    }

    next();
  };
}

/**
 * Acceptance Test 1 Enforcement:
 * Ensures a teacher can ONLY access/record attendance/marks for classes they are assigned to.
 * Admins bypass this check.
 */
export function verifyTeacherSectionAccess(sectionIdField: string = 'sectionId') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return next(new UnauthorizedError());
      
      // Admin has universal school-wide access
      if (req.user.role === 'ADMIN') {
        return next();
      }

      if (req.user.role !== 'TEACHER') {
        return next(new ForbiddenError('Only teachers and administrators can access this class workflow'));
      }

      const sectionId = req.params[sectionIdField] || req.body[sectionIdField] || req.query[sectionIdField];
      if (!sectionId) {
        return next();
      }

      const teacherProfileId = req.user.teacherProfileId;
      if (!teacherProfileId) {
        return next(new ForbiddenError('Teacher profile not linked to user account'));
      }

      // Check allocation in database
      const allocation = await prisma.classSubjectTeacher.findFirst({
        where: {
          sectionId: String(sectionId),
          teacherProfileId,
        },
      });

      if (!allocation) {
        return next(
          new ForbiddenError('Access Denied: You are not assigned as a teacher for this class section')
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Acceptance Test 4 Enforcement:
 * Ensures a guardian can ONLY see their linked students' records (attendance, report cards, fees).
 * Admins and assigned teachers bypass this check.
 */
export function verifyGuardianStudentAccess(studentIdField: string = 'studentId') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return next(new UnauthorizedError());

      if (req.user.role === 'ADMIN' || req.user.role === 'TEACHER') {
        return next();
      }

      const studentId = req.params[studentIdField] || req.body[studentIdField] || req.query[studentIdField];
      if (!studentId) {
        return next();
      }

      if (req.user.role === 'STUDENT') {
        if (req.user.studentProfileId !== String(studentId)) {
          return next(new ForbiddenError('Access Denied: You can only access your own student records'));
        }
        return next();
      }

      if (req.user.role === 'GUARDIAN') {
        const guardianProfileId = req.user.guardianProfileId;
        if (!guardianProfileId) {
          return next(new ForbiddenError('Guardian profile not linked to user account'));
        }

        const relation = await prisma.studentGuardianRelation.findFirst({
          where: {
            guardianProfileId,
            studentId: String(studentId),
          },
        });

        if (!relation) {
          return next(
            new ForbiddenError('Access Denied: This student is not registered under your guardianship')
          );
        }

        return next();
      }

      next(new ForbiddenError());
    } catch (err) {
      next(err);
    }
  };
}
