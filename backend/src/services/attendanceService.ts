import { prisma } from '../utils/prisma';
import { ConflictError, NotFoundError } from '../utils/errors';
import { createAuditLog } from './auditService';

export interface AttendanceEntryInput {
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
}

export async function recordAttendanceBatch(params: {
  sectionId: string;
  date: string; // YYYY-MM-DD
  session?: string; // default "FULL_DAY"
  entries: AttendanceEntryInput[];
  recordedById: string;
  allowUpdate?: boolean; // If false, throws ConflictError on duplicate
}) {
  const { sectionId, date, session = 'FULL_DAY', entries, recordedById, allowUpdate = true } = params;

  // Verify section exists
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: { class: true },
  });

  if (!section) {
    throw new NotFoundError('Section not found');
  }

  // Check if any record already exists if allowUpdate is false
  if (!allowUpdate) {
    const existing = await prisma.attendanceRecord.findFirst({
      where: {
        sectionId,
        date,
        session,
        studentId: { in: entries.map((e) => e.studentId) },
      },
    });

    if (existing) {
      throw new ConflictError(
        `Attendance for date ${date} (${session}) has already been recorded. Use update mode to modify.`
      );
    }
  }

  // Execute atomic upsert within transaction
  const results = await prisma.$transaction(async (tx) => {
    const upsertedRecords = [];

    for (const entry of entries) {
      const record = await tx.attendanceRecord.upsert({
        where: {
          studentId_date_session: {
            studentId: entry.studentId,
            date,
            session,
          },
        },
        update: {
          status: entry.status,
          remarks: entry.remarks || null,
          recordedById,
          sectionId,
        },
        create: {
          studentId: entry.studentId,
          sectionId,
          date,
          session,
          status: entry.status,
          remarks: entry.remarks || null,
          recordedById,
        },
      });

      upsertedRecords.push(record);
    }

    return upsertedRecords;
  });

  // Create audit log
  await createAuditLog({
    userId: recordedById,
    action: 'ATTENDANCE_RECORDED',
    entityType: 'Attendance',
    entityId: sectionId,
    details: {
      section: `${section.class.name}-${section.name}`,
      date,
      session,
      totalEntries: entries.length,
      presentCount: entries.filter((e) => e.status === 'PRESENT').length,
      absentCount: entries.filter((e) => e.status === 'ABSENT').length,
    },
  });

  return {
    count: results.length,
    records: results,
  };
}

export async function getSectionAttendance(sectionId: string, date: string, session = 'FULL_DAY') {
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: {
      class: true,
      students: {
        where: { status: 'ACTIVE' },
        orderBy: [{ rollNumber: 'asc' }, { firstName: 'asc' }],
      },
    },
  });

  if (!section) {
    throw new NotFoundError('Section not found');
  }

  const existingRecords = await prisma.attendanceRecord.findMany({
    where: {
      sectionId,
      date,
      session,
    },
  });

  const recordMap = new Map<string, any>();
  existingRecords.forEach((r) => recordMap.set(r.studentId, r));

  const attendanceSheet = section.students.map((student) => {
    const record = recordMap.get(student.id);
    return {
      studentId: student.id,
      name: `${student.firstName} ${student.lastName}`,
      admissionNumber: student.admissionNumber,
      rollNumber: student.rollNumber,
      status: record ? record.status : 'NOT_RECORDED',
      remarks: record ? record.remarks : null,
      recordId: record ? record.id : null,
      recordedAt: record ? record.updatedAt : null,
    };
  });

  const recordedCount = existingRecords.length;
  const presentCount = existingRecords.filter((r) => r.status === 'PRESENT').length;
  const absentCount = existingRecords.filter((r) => r.status === 'ABSENT').length;
  const lateCount = existingRecords.filter((r) => r.status === 'LATE').length;
  const excusedCount = existingRecords.filter((r) => r.status === 'EXCUSED').length;

  return {
    sectionId: section.id,
    className: section.class.name,
    sectionName: section.name,
    date,
    session,
    totalStudents: section.students.length,
    summary: {
      recordedCount,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      attendanceRate: section.students.length > 0 ? Math.round((presentCount / section.students.length) * 100) : 0,
    },
    students: attendanceSheet,
  };
}

export async function getStudentAttendanceSummary(studentId: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      section: {
        include: { class: true },
      },
    },
  });

  if (!student) {
    throw new NotFoundError('Student not found');
  }

  const records = await prisma.attendanceRecord.findMany({
    where: { studentId },
    orderBy: { date: 'desc' },
  });

  const total = records.length;
  const present = records.filter((r) => r.status === 'PRESENT').length;
  const absent = records.filter((r) => r.status === 'ABSENT').length;
  const late = records.filter((r) => r.status === 'LATE').length;
  const excused = records.filter((r) => r.status === 'EXCUSED').length;

  const percentage = total > 0 ? Math.round((present / total) * 1000) / 10 : 100;

  return {
    studentId: student.id,
    name: `${student.firstName} ${student.lastName}`,
    admissionNumber: student.admissionNumber,
    className: `${student.section.class.name}-${student.section.name}`,
    totalSessions: total,
    presentSessions: present,
    absentSessions: absent,
    lateSessions: late,
    excusedSessions: excused,
    attendanceRate: percentage,
    history: records.slice(0, 30),
  };
}
