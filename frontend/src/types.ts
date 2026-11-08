export type Role = 'ADMIN' | 'TEACHER' | 'GUARDIAN' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  teacherProfileId?: string;
  guardianProfileId?: string;
  studentProfileId?: string;
  guardianChildren?: Array<{
    id: string;
    name: string;
    admissionNumber: string;
    className: string;
    sectionId: string;
  }>;
}

export interface AcademicClass {
  id: string;
  name: string;
  code: string;
  sections: Section[];
}

export interface Section {
  id: string;
  name: string;
  classId: string;
  class?: AcademicClass;
  roomNumber?: string;
  capacity: number;
  _count?: {
    students: number;
  };
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface TeacherAllocation {
  id: string;
  sectionId: string;
  section: Section & { class: AcademicClass; _count?: { students: number } };
  subjectId: string;
  subject: Subject;
  teacherProfileId: string;
  academicYear: string;
}

export interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  rollNumber?: number;
  sectionId: string;
  section: Section & { class: AcademicClass };
  status: string;
}

export interface AttendanceSheetStudent {
  studentId: string;
  name: string;
  admissionNumber: string;
  rollNumber?: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'NOT_RECORDED';
  remarks?: string;
  recordId?: string;
}

export interface AttendanceSheet {
  sectionId: string;
  className: string;
  sectionName: string;
  date: string;
  session: string;
  totalStudents: number;
  summary: {
    recordedCount: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    attendanceRate: number;
  };
  students: AttendanceSheetStudent[];
}

export interface StudentAttendanceSummary {
  studentId: string;
  name: string;
  admissionNumber: string;
  className: string;
  totalSessions: number;
  presentSessions: number;
  absentSessions: number;
  lateSessions: number;
  excusedSessions: number;
  attendanceRate: number;
  history: Array<{
    id: string;
    date: string;
    session: string;
    status: string;
    remarks?: string;
  }>;
}

export interface Exam {
  id: string;
  title: string;
  term: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface ExamSchedule {
  id: string;
  examId: string;
  exam: Exam;
  sectionId: string;
  section: Section & { class: AcademicClass };
  subjectId: string;
  subject: Subject;
  examDate: string;
  maxMarks: number;
  passMarks: number;
}

export interface CalculatedSubjectResult {
  subjectName: string;
  subjectCode: string;
  maxMarks: number;
  passMarks: number;
  marksObtained: number;
  percentage: number;
  grade: string;
  gradePoint: number;
  isPassed: boolean;
  remarks?: string;
}

export interface ReportCard {
  studentId: string;
  studentName: string;
  rollNumber?: number;
  admissionNumber: string;
  className: string;
  sectionName: string;
  examTitle: string;
  academicYear: string;
  subjects: CalculatedSubjectResult[];
  totalMarksObtained: number;
  totalMaxMarks: number;
  overallPercentage: number;
  overallGrade: string;
  overallGradePoint: number;
  isPassed: boolean;
  summaryRemark: string;
}

export interface FeeInvoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  student?: Student;
  title: string;
  category: string;
  amount: number;
  amountPaid: number;
  amountDue: number;
  dueDate: string;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  notes?: string;
  payments?: FeePayment[];
}

export interface FeePayment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  referenceNote?: string;
  transactionId?: string;
  paidAt: string;
}

export interface FeeLedgerReconciliation {
  summary: {
    totalInvoicesCount: number;
    totalBilled: number;
    totalPaid: number;
    totalOutstanding: number;
    totalPaymentsSum: number;
    isReconciled: boolean;
  };
  discrepancies: any[];
}

export interface AuditLog {
  id: string;
  userId?: string;
  user?: {
    name: string;
    email: string;
    role: string;
  };
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}
