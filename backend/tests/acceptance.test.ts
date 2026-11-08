import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';
import { calculateGrade, compileStudentReportCard, DEFAULT_GRADING_RULES } from '../src/utils/gradingEngine';

describe('Algions School Management System - Core Acceptance Test Suite', () => {
  let adminToken: string;
  let mathTeacherToken: string;
  let starkGuardianToken: string;
  let wayneGuardianToken: string;

  let section10AId: string;
  let section10BId: string;
  let aryaStudentId: string;
  let bruceStudentId: string;
  let midtermExamId: string;

  beforeAll(async () => {
    // 1. Authenticate Admin
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@school.demo', password: 'Password@123' });
    expect(adminRes.status).toBe(200);
    adminToken = adminRes.body.data.token;

    // 2. Authenticate Sarah Connor (Math Teacher - assigned to 10-A and 9-B, NOT 10-B)
    const teacherRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'teacher@school.demo', password: 'Password@123' });
    expect(teacherRes.status).toBe(200);
    mathTeacherToken = teacherRes.body.data.token;

    // 3. Authenticate Robert Stark (Guardian of Arya & Bran, NOT Bruce Wayne)
    const starkRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'guardian@school.demo', password: 'Password@123' });
    expect(starkRes.status).toBe(200);
    starkGuardianToken = starkRes.body.data.token;

    // 4. Authenticate Martha Wayne (Guardian of Bruce Wayne)
    const wayneRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'guardian.wayne@school.edu', password: 'Password@123' });
    expect(wayneRes.status).toBe(200);
    wayneGuardianToken = wayneRes.body.data.token;

    // Fetch entity IDs from DB
    const section10A = await prisma.section.findFirst({
      where: { name: 'A', class: { name: 'Grade 10' } },
    });
    section10AId = section10A!.id;

    const section10B = await prisma.section.findFirst({
      where: { name: 'B', class: { name: 'Grade 10' } },
    });
    section10BId = section10B!.id;

    const arya = await prisma.studentProfile.findFirst({
      where: { admissionNumber: 'ADM-2024-001' },
    });
    aryaStudentId = arya!.id;

    const bruce = await prisma.studentProfile.findFirst({
      where: { admissionNumber: 'ADM-2024-003' },
    });
    bruceStudentId = bruce!.id;

    const exam = await prisma.exam.findFirst({
      where: { title: 'Midterm Examination 2025' },
    });
    midtermExamId = exam!.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ==========================================
  // ACCEPTANCE TEST 1: Teacher Scope Restriction
  // ==========================================
  describe('Acceptance Test 1: Teacher can access only assigned classes', () => {
    it('allows teacher Sarah Connor to access assigned section Grade 10-A attendance sheet (200 OK)', async () => {
      const res = await request(app)
        .get(`/api/v1/attendance/section/${section10AId}`)
        .set('Authorization', `Bearer ${mathTeacherToken}`);

      if (res.status !== 200) {
        console.error('ATTENDANCE 10A ERROR:', res.body);
      }
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sectionId).toBe(section10AId);
    });

    it('rejects teacher Sarah Connor from recording/accessing unassigned section Grade 10-B (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/v1/attendance/section/${section10BId}`)
        .set('Authorization', `Bearer ${mathTeacherToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/not assigned as a teacher/i);
    });
  });

  // ==========================================
  // ACCEPTANCE TEST 2: Attendance Deduplication
  // ==========================================
  describe('Acceptance Test 2: Duplicate attendance prevention and safe updates', () => {
    const testDate = '2025-05-15';

    it('records attendance batch cleanly for an assigned section', async () => {
      const res = await request(app)
        .post('/api/v1/attendance/record')
        .set('Authorization', `Bearer ${mathTeacherToken}`)
        .send({
          sectionId: section10AId,
          date: testDate,
          session: 'MORNING',
          allowUpdate: true,
          entries: [
            { studentId: aryaStudentId, status: 'PRESENT', remarks: 'On time' },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBe(1);
    });

    it('rejects duplicate attendance when allowUpdate is false (409 Conflict)', async () => {
      const duplicateRes = await request(app)
        .post('/api/v1/attendance/record')
        .set('Authorization', `Bearer ${mathTeacherToken}`)
        .send({
          sectionId: section10AId,
          date: testDate,
          session: 'MORNING',
          allowUpdate: false,
          entries: [
            { studentId: aryaStudentId, status: 'ABSENT', remarks: 'Duplicate attempt' },
          ],
        });

      expect(duplicateRes.status).toBe(409);
      expect(duplicateRes.body.success).toBe(false);
      expect(duplicateRes.body.error.name).toBe('ConflictError');
    });

    it('safely updates existing attendance when allowUpdate is true without creating duplicate DB rows', async () => {
      const updateRes = await request(app)
        .post('/api/v1/attendance/record')
        .set('Authorization', `Bearer ${mathTeacherToken}`)
        .send({
          sectionId: section10AId,
          date: testDate,
          session: 'MORNING',
          allowUpdate: true,
          entries: [
            { studentId: aryaStudentId, status: 'LATE', remarks: 'Traffic delay' },
          ],
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);

      // Verify in DB that only 1 record exists for (studentId, date, session)
      const count = await prisma.attendanceRecord.count({
        where: {
          studentId: aryaStudentId,
          date: testDate,
          session: 'MORNING',
        },
      });
      expect(count).toBe(1);

      const record = await prisma.attendanceRecord.findFirst({
        where: { studentId: aryaStudentId, date: testDate, session: 'MORNING' },
      });
      expect(record?.status).toBe('LATE');
    });
  });

  // ==========================================
  // ACCEPTANCE TEST 3: Exam Grading Rules & Report Card
  // ==========================================
  describe('Acceptance Test 3: Exam marks, percentages and grading calculation rules', () => {
    it('calculates correct letter grade and GPA based on score percentage', () => {
      expect(calculateGrade(95).grade).toBe('A+');
      expect(calculateGrade(95).gradePoint).toBe(4.0);

      expect(calculateGrade(85).grade).toBe('A');
      expect(calculateGrade(85).gradePoint).toBe(3.7);

      expect(calculateGrade(74).grade).toBe('B+');
      expect(calculateGrade(62).grade).toBe('B');
      expect(calculateGrade(55).grade).toBe('C');
      expect(calculateGrade(45).grade).toBe('D');
      expect(calculateGrade(32).grade).toBe('F');
    });

    it('compiles full student report card with weighted totals and overall status', async () => {
      const res = await request(app)
        .get(`/api/v1/exams/${midtermExamId}/report-card/${aryaStudentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const report = res.body.data;
      expect(report.studentName).toBe('Arya Stark');
      expect(report.totalMaxMarks).toBe(300);
      // Math: 92, Science: 85, English: 88 => Total 265
      expect(report.totalMarksObtained).toBe(265);
      expect(report.overallPercentage).toBe(88.33);
      expect(report.overallGrade).toBe('A');
      expect(report.isPassed).toBe(true);
      expect(report.subjects.length).toBe(3);
    });

    it('strictly rejects marks exceeding maximum scheduled marks (400 Bad Request)', async () => {
      const schedule = await prisma.examSchedule.findFirst({
        where: { examId: midtermExamId },
      });
      const invalidRes = await request(app)
        .post('/api/v1/exams/marks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          examScheduleId: schedule!.id,
          marks: [
            { studentId: aryaStudentId, marksObtained: 150 }, // Max marks is 100
          ],
        });

      expect(invalidRes.status).toBe(400);
      expect(invalidRes.body.success).toBe(false);
      expect(invalidRes.body.error.message).toMatch(/exceeds scheduled maximum marks/i);
    });
  });

  // ==========================================
  // ACCEPTANCE TEST 4: Guardian Privacy & Data Isolation
  // ==========================================
  describe('Acceptance Test 4: Guardian privacy and multi-tenant student isolation', () => {
    it('allows guardian Robert Stark to access linked student Arya Stark report card (200 OK)', async () => {
      const res = await request(app)
        .get(`/api/v1/exams/${midtermExamId}/report-card/${aryaStudentId}`)
        .set('Authorization', `Bearer ${starkGuardianToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.studentId).toBe(aryaStudentId);
    });

    it('strictly forbids guardian Robert Stark from accessing unlinked student Bruce Wayne report card (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/v1/exams/${midtermExamId}/report-card/${bruceStudentId}`)
        .set('Authorization', `Bearer ${starkGuardianToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/not registered under your guardianship/i);
    });

    it('strictly forbids guardian Robert Stark from viewing Bruce Wayne fee invoices (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/v1/fees/student/${bruceStudentId}`)
        .set('Authorization', `Bearer ${starkGuardianToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // ACCEPTANCE TEST 5: Fee Ledger Reconciliation
  // ==========================================
  describe('Acceptance Test 5: Fee invoices, payments, and ledger reconciliation', () => {
    let testInvoiceId: string;

    it('creates a new fee invoice with zero paid and exact due balance', async () => {
      const res = await request(app)
        .post('/api/v1/fees/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: aryaStudentId,
          title: 'Robotics Workshop Kit',
          category: 'STEM Laboratory Fee',
          amount: 500,
          dueDate: '2025-06-30',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.amount).toBe(500);
      expect(res.body.data.amountPaid).toBe(0);
      expect(res.body.data.amountDue).toBe(500);
      expect(res.body.data.status).toBe('PENDING');

      testInvoiceId = res.body.data.id;
    });

    it('records a partial simulated payment and reconciles invoice balance', async () => {
      const payRes = await request(app)
        .post('/api/v1/fees/pay')
        .set('Authorization', `Bearer ${starkGuardianToken}`)
        .send({
          invoiceId: testInvoiceId,
          amount: 200,
          paymentMethod: 'ONLINE_SIMULATED',
          referenceNote: 'Installment 1',
        });

      expect(payRes.status).toBe(200);
      const invoice = payRes.body.data.invoice;
      expect(invoice.amountPaid).toBe(200);
      expect(invoice.amountDue).toBe(300);
      expect(invoice.status).toBe('PARTIALLY_PAID');
      expect(payRes.body.data.reconciliation.isReconciled).toBe(true);
    });

    it('rejects an overpayment that exceeds the remaining balance (400 Bad Request)', async () => {
      const overpayRes = await request(app)
        .post('/api/v1/fees/pay')
        .set('Authorization', `Bearer ${starkGuardianToken}`)
        .send({
          invoiceId: testInvoiceId,
          amount: 400, // Due is only 300
        });

      expect(overpayRes.status).toBe(400);
      expect(overpayRes.body.error.message).toMatch(/exceeds the outstanding balance/i);
    });

    it('settles remaining balance and marks invoice as fully PAID', async () => {
      const settleRes = await request(app)
        .post('/api/v1/fees/pay')
        .set('Authorization', `Bearer ${starkGuardianToken}`)
        .send({
          invoiceId: testInvoiceId,
          amount: 300,
          paymentMethod: 'ONLINE_SIMULATED',
          referenceNote: 'Final settlement',
        });

      expect(settleRes.status).toBe(200);
      const invoice = settleRes.body.data.invoice;
      expect(invoice.amountPaid).toBe(500);
      expect(invoice.amountDue).toBe(0);
      expect(invoice.status).toBe('PAID');
    });

    it('verifies system-wide fee ledger reconciliation has zero discrepancies', async () => {
      const reconRes = await request(app)
        .get('/api/v1/fees/reconciliation')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(reconRes.status).toBe(200);
      expect(reconRes.body.data.summary.isReconciled).toBe(true);
      expect(reconRes.body.data.discrepancies.length).toBe(0);
      expect(
        reconRes.body.data.summary.totalBilled
      ).toBeCloseTo(
        reconRes.body.data.summary.totalPaid + reconRes.body.data.summary.totalOutstanding,
        2
      );
    });
  });

  // ==========================================
  // NEGATIVE & SECURITY EDGE CASES
  // ==========================================
  describe('Negative & Security Edge Cases', () => {
    it('rejects login with bad credentials (401 Unauthorized)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@school.edu', password: 'WrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects unauthenticated requests to protected endpoints (401 Unauthorized)', async () => {
      const res = await request(app).get('/api/v1/academic/classes');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects non-admin from creating classes (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/v1/academic/classes')
        .set('Authorization', `Bearer ${mathTeacherToken}`)
        .send({ name: 'Grade 11', code: 'G11' });

      expect(res.status).toBe(403);
    });
  });
});
