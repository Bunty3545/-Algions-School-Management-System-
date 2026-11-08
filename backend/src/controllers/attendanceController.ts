import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as attendanceService from '../services/attendanceService';

export const recordAttendanceSchema = z.object({
  sectionId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  session: z.string().optional(),
  allowUpdate: z.boolean().optional(),
  entries: z.array(
    z.object({
      studentId: z.string().min(1),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
      remarks: z.string().optional(),
    })
  ).min(1, 'At least one student attendance record is required'),
});

export async function recordAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const { sectionId, date, session, entries, allowUpdate } = req.body;
    const result = await attendanceService.recordAttendanceBatch({
      sectionId,
      date,
      session,
      entries,
      recordedById: req.user!.id,
      allowUpdate,
    });

    return res.status(200).json({
      success: true,
      message: `Successfully recorded attendance for ${result.count} students`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSectionAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const { sectionId } = req.params;
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const session = (req.query.session as string) || 'FULL_DAY';

    const sheet = await attendanceService.getSectionAttendance(sectionId, date, session);
    return res.status(200).json({ success: true, data: sheet });
  } catch (error) {
    next(error);
  }
}

export async function getStudentAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const { studentId } = req.params;
    const summary = await attendanceService.getStudentAttendanceSummary(studentId);
    return res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
}
