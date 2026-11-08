import { prisma } from '../utils/prisma';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { compileStudentReportCard, DEFAULT_GRADING_RULES, GradeRuleDefinition } from '../utils/gradingEngine';
import { createAuditLog } from './auditService';

export async function getAllExams() {
  return await prisma.exam.findMany({
    include: {
      _count: {
        select: { schedules: true },
      },
    },
    orderBy: { startDate: 'desc' },
  });
}

export async function createExam(params: {
  title: string;
  term: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  status?: string;
}) {
  return await prisma.exam.create({
    data: {
      title: params.title,
      term: params.term,
      academicYear: params.academicYear,
      startDate: params.startDate,
      endDate: params.endDate,
      status: params.status || 'SCHEDULED',
    },
  });
}

export async function getExamSchedules(examId: string, sectionId?: string) {
  const where: any = { examId };
  if (sectionId) {
    where.sectionId = sectionId;
  }

  return await prisma.examSchedule.findMany({
    where,
    include: {
      exam: true,
      section: { include: { class: true } },
      subject: true,
      _count: { select: { marks: true } },
    },
    orderBy: { examDate: 'asc' },
  });
}

export async function createExamSchedule(params: {
  examId: string;
  sectionId: string;
  subjectId: string;
  examDate: string;
  maxMarks?: number;
  passMarks?: number;
}) {
  return await prisma.examSchedule.create({
    data: {
      examId: params.examId,
      sectionId: params.sectionId,
      subjectId: params.subjectId,
      examDate: params.examDate,
      maxMarks: params.maxMarks || 100,
      passMarks: params.passMarks || 40,
    },
    include: {
      subject: true,
      section: { include: { class: true } },
    },
  });
}

export async function getMarksEntrySheet(examScheduleId: string) {
  const schedule = await prisma.examSchedule.findUnique({
    where: { id: examScheduleId },
    include: {
      exam: true,
      subject: true,
      section: {
        include: {
          class: true,
          students: {
            where: { status: 'ACTIVE' },
            orderBy: [{ rollNumber: 'asc' }, { firstName: 'asc' }],
          },
        },
      },
      marks: true,
    },
  });

  if (!schedule) {
    throw new NotFoundError('Exam schedule not found');
  }

  const marksMap = new Map<string, any>();
  schedule.marks.forEach((m) => marksMap.set(m.studentId, m));

  const sheet = schedule.section.students.map((student) => {
    const markRecord = marksMap.get(student.id);
    return {
      studentId: student.id,
      name: `${student.firstName} ${student.lastName}`,
      rollNumber: student.rollNumber,
      admissionNumber: student.admissionNumber,
      marksObtained: markRecord ? markRecord.marksObtained : null,
      isAbsent: markRecord ? markRecord.isAbsent : false,
      remarks: markRecord ? markRecord.remarks : null,
      isPassed: markRecord && !markRecord.isAbsent ? markRecord.marksObtained >= schedule.passMarks : false,
    };
  });

  return {
    examScheduleId: schedule.id,
    examTitle: schedule.exam.title,
    className: schedule.section.class.name,
    sectionName: schedule.section.name,
    subjectName: schedule.subject.name,
    maxMarks: schedule.maxMarks,
    passMarks: schedule.passMarks,
    students: sheet,
  };
}

export async function submitExamMarks(params: {
  examScheduleId: string;
  marks: Array<{
    studentId: string;
    marksObtained: number;
    isAbsent?: boolean;
    remarks?: string;
  }>;
  evaluatedById: string;
}) {
  const { examScheduleId, marks, evaluatedById } = params;

  const schedule = await prisma.examSchedule.findUnique({
    where: { id: examScheduleId },
    include: { subject: true, exam: true },
  });

  if (!schedule) {
    throw new NotFoundError('Exam schedule not found');
  }

  // Business rule validation: reject marks exceeding maximum marks or negative
  for (const m of marks) {
    if (!m.isAbsent) {
      if (m.marksObtained < 0) {
        throw new BadRequestError(`Invalid marks: Marks obtained (${m.marksObtained}) cannot be negative`);
      }
      if (m.marksObtained > schedule.maxMarks) {
        throw new BadRequestError(
          `Invalid marks: Marks obtained (${m.marksObtained}) exceeds scheduled maximum marks (${schedule.maxMarks})`
        );
      }
    }
  }

  const results = await prisma.$transaction(async (tx) => {
    const saved = [];
    for (const m of marks) {
      const mark = await tx.examMark.upsert({
        where: {
          examScheduleId_studentId: {
            examScheduleId,
            studentId: m.studentId,
          },
        },
        update: {
          marksObtained: m.marksObtained,
          isAbsent: m.isAbsent || false,
          remarks: m.remarks || null,
          evaluatedById,
        },
        create: {
          examScheduleId,
          studentId: m.studentId,
          marksObtained: m.marksObtained,
          isAbsent: m.isAbsent || false,
          remarks: m.remarks || null,
          evaluatedById,
        },
      });
      saved.push(mark);
    }
    return saved;
  });

  await createAuditLog({
    userId: evaluatedById,
    action: 'MARKS_SUBMITTED',
    entityType: 'ExamMark',
    entityId: examScheduleId,
    details: `Submitted marks for ${schedule.subject.name} (${schedule.exam.title}), total students: ${marks.length}`,
  });

  return results;
}

/**
 * Acceptance Test 3 implementation:
 * Computes report card accurately from marks and configurable grading rules.
 */
export async function getStudentReportCard(studentId: string, examId: string) {
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

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
  });

  if (!exam) {
    throw new NotFoundError('Exam not found');
  }

  // Get active grading scale rules
  const activeScale = await prisma.gradingScale.findFirst({
    where: { isDefault: true },
    include: { rules: true },
  });

  const rules: GradeRuleDefinition[] = activeScale?.rules?.length
    ? activeScale.rules.map((r) => ({
        grade: r.grade,
        minScore: r.minScore,
        maxScore: r.maxScore,
        gradePoint: r.gradePoint,
        description: r.description,
      }))
    : DEFAULT_GRADING_RULES;

  // Find all schedules for this exam and this student's section
  const schedules = await prisma.examSchedule.findMany({
    where: {
      examId,
      sectionId: student.sectionId,
    },
    include: {
      subject: true,
      marks: {
        where: { studentId },
      },
    },
  });

  const subjectMarkDetails = schedules.map((sch) => {
    const markRecord = sch.marks[0];
    return {
      subjectName: sch.subject.name,
      subjectCode: sch.subject.code,
      maxMarks: sch.maxMarks,
      passMarks: sch.passMarks,
      marksObtained: markRecord ? markRecord.marksObtained : 0,
      isAbsent: markRecord ? markRecord.isAbsent : false,
      remarks: markRecord ? markRecord.remarks : null,
    };
  });

  return compileStudentReportCard(
    student,
    exam,
    subjectMarkDetails,
    rules
  );
}
