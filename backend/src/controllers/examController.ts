import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as examService from '../services/examService';

export const createExamSchema = z.object({
  title: z.string().min(1),
  term: z.string().min(1),
  academicYear: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  status: z.string().optional(),
});

export const createScheduleSchema = z.object({
  examId: z.string().min(1),
  sectionId: z.string().min(1),
  subjectId: z.string().min(1),
  examDate: z.string().min(1),
  maxMarks: z.number().positive().optional(),
  passMarks: z.number().positive().optional(),
});

export const submitMarksSchema = z.object({
  examScheduleId: z.string().min(1),
  marks: z.array(
    z.object({
      studentId: z.string().min(1),
      marksObtained: z.number().min(0),
      isAbsent: z.boolean().optional(),
      remarks: z.string().optional(),
    })
  ).min(1, 'At least one mark entry is required'),
});

export async function getExams(req: Request, res: Response, next: NextFunction) {
  try {
    const exams = await examService.getAllExams();
    return res.status(200).json({ success: true, data: exams });
  } catch (error) {
    next(error);
  }
}

export async function createExam(req: Request, res: Response, next: NextFunction) {
  try {
    const exam = await examService.createExam(req.body);
    return res.status(201).json({ success: true, data: exam });
  } catch (error) {
    next(error);
  }
}

export async function getExamSchedules(req: Request, res: Response, next: NextFunction) {
  try {
    const { examId } = req.params;
    const { sectionId } = req.query as { sectionId?: string };
    const schedules = await examService.getExamSchedules(examId, sectionId);
    return res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    next(error);
  }
}

export async function createExamSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const schedule = await examService.createExamSchedule(req.body);
    return res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    next(error);
  }
}

export async function getMarksSheet(req: Request, res: Response, next: NextFunction) {
  try {
    const { scheduleId } = req.params;
    const sheet = await examService.getMarksEntrySheet(scheduleId);
    return res.status(200).json({ success: true, data: sheet });
  } catch (error) {
    next(error);
  }
}

export async function submitMarks(req: Request, res: Response, next: NextFunction) {
  try {
    const { examScheduleId, marks } = req.body;
    const result = await examService.submitExamMarks({
      examScheduleId,
      marks,
      evaluatedById: req.user!.id,
    });
    return res.status(200).json({
      success: true,
      message: 'Marks recorded and published successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getReportCard(req: Request, res: Response, next: NextFunction) {
  try {
    const { examId, studentId } = req.params;
    const reportCard = await examService.getStudentReportCard(studentId, examId);
    return res.status(200).json({ success: true, data: reportCard });
  } catch (error) {
    next(error);
  }
}
