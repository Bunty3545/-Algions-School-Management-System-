import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as academicService from '../services/academicService';

export const createClassSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
});

export const createSectionSchema = z.object({
  classId: z.string().min(1),
  name: z.string().min(1),
  roomNumber: z.string().optional(),
  capacity: z.number().int().positive().optional(),
});

export const assignTeacherSchema = z.object({
  sectionId: z.string().min(1),
  subjectId: z.string().min(1),
  teacherProfileId: z.string().min(1),
  academicYear: z.string().optional(),
});

export async function getClasses(req: Request, res: Response, next: NextFunction) {
  try {
    const classes = await academicService.getAllClasses();
    return res.status(200).json({ success: true, data: classes });
  } catch (error) {
    next(error);
  }
}

export async function createClass(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await academicService.createClass(req.body.name, req.body.code);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function createSection(req: Request, res: Response, next: NextFunction) {
  try {
    const { classId, name, roomNumber, capacity } = req.body;
    const result = await academicService.createSection(classId, name, roomNumber, capacity);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getSubjects(req: Request, res: Response, next: NextFunction) {
  try {
    const subjects = await academicService.getAllSubjects();
    return res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    next(error);
  }
}

export async function getTeachers(req: Request, res: Response, next: NextFunction) {
  try {
    const teachers = await academicService.getAllTeachers();
    return res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    next(error);
  }
}

export async function getMyTeacherAllocations(req: Request, res: Response, next: NextFunction) {
  try {
    const teacherProfileId = req.user?.teacherProfileId;
    if (!teacherProfileId) {
      return res.status(200).json({ success: true, data: [] });
    }
    const allocations = await academicService.getTeacherAllocations(teacherProfileId);
    return res.status(200).json({ success: true, data: allocations });
  } catch (error) {
    next(error);
  }
}

export async function assignTeacher(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await academicService.assignTeacherToSectionSubject({
      ...req.body,
      recordedById: req.user?.id,
    });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getStudents(req: Request, res: Response, next: NextFunction) {
  try {
    const { sectionId, search } = req.query as { sectionId?: string; search?: string };
    const students = await academicService.getAllStudents({ sectionId, search });
    return res.status(200).json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
}

export async function getStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const student = await academicService.getStudentById(req.params.studentId);
    return res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
}

export const createStudentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  admissionNumber: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  rollNumber: z.number().int().optional(),
  sectionId: z.string().min(1),
  guardianName: z.string().optional(),
  guardianEmail: z.string().email().optional(),
  guardianPhone: z.string().optional(),
});

export async function createStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await academicService.createStudent({
      ...req.body,
      recordedById: req.user?.id,
    });
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function updateStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await academicService.updateStudent(req.params.studentId, {
      ...req.body,
      recordedById: req.user?.id,
    });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function deleteStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await academicService.deleteStudent(req.params.studentId, req.user?.id);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export const createTeacherSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  specialization: z.string().optional(),
});

export async function createTeacher(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await academicService.createTeacher({
      ...req.body,
      recordedById: req.user?.id,
    });
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export const createSubjectSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
});

export async function createSubject(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await academicService.createSubject(req.body);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getGuardians(req: Request, res: Response, next: NextFunction) {
  try {
    const guardians = await academicService.getAllGuardians();
    return res.status(200).json({ success: true, data: guardians });
  } catch (error) {
    next(error);
  }
}
