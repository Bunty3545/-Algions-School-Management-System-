import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Algions SMS...');

  // Clean existing data in reverse order of dependencies
  await prisma.auditLog.deleteMany();
  await prisma.feePayment.deleteMany();
  await prisma.feeInvoice.deleteMany();
  await prisma.feeCategory.deleteMany();
  await prisma.examMark.deleteMany();
  await prisma.examSchedule.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.gradeRule.deleteMany();
  await prisma.gradingScale.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.studentGuardianRelation.deleteMany();
  await prisma.guardianProfile.deleteMany();
  await prisma.classSubjectTeacher.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.section.deleteMany();
  await prisma.academicClass.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.user.deleteMany();

  const saltRounds = 10;
  const standardPassword = await bcrypt.hash('Password@123', saltRounds);
  const adminPassword = standardPassword;
  const teacherPassword = standardPassword;
  const guardianPassword = standardPassword;
  const studentPassword = standardPassword;

  // 1. Create Users
  const adminDemo = await prisma.user.create({
    data: {
      email: 'admin@school.demo',
      passwordHash: standardPassword,
      name: 'Dr. Arthur Vance (Principal)',
      role: 'ADMIN',
      phone: '+1-555-0100',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@school.edu',
      passwordHash: standardPassword,
      name: 'Administrative Director',
      role: 'ADMIN',
      phone: '+1-555-0109',
    },
  });

  const teacher1User = await prisma.user.create({
    data: {
      email: 'teacher@school.demo',
      passwordHash: standardPassword,
      name: 'Sarah Connor',
      role: 'TEACHER',
      phone: '+1-555-0101',
    },
  });

  const teacherAltUser = await prisma.user.create({
    data: {
      email: 'teacher.math@school.edu',
      passwordHash: standardPassword,
      name: 'Sarah Connor (Alt)',
      role: 'TEACHER',
      phone: '+1-555-0101',
    },
  });

  const teacher2User = await prisma.user.create({
    data: {
      email: 'teacher.science@school.edu',
      passwordHash: standardPassword,
      name: 'Dr. Bruce Banner',
      role: 'TEACHER',
      phone: '+1-555-0102',
    },
  });

  const teacher3User = await prisma.user.create({
    data: {
      email: 'teacher.english@school.edu',
      passwordHash: standardPassword,
      name: 'Prof. Minerva McGonagall',
      role: 'TEACHER',
      phone: '+1-555-0103',
    },
  });

  const guardian1User = await prisma.user.create({
    data: {
      email: 'guardian@school.demo',
      passwordHash: standardPassword,
      name: 'Robert Stark',
      role: 'GUARDIAN',
      phone: '+1-555-0201',
    },
  });

  const guardianAltUser = await prisma.user.create({
    data: {
      email: 'guardian.stark@school.edu',
      passwordHash: standardPassword,
      name: 'Robert Stark (Alt)',
      role: 'GUARDIAN',
      phone: '+1-555-0201',
    },
  });

  const guardian2User = await prisma.user.create({
    data: {
      email: 'guardian.wayne@school.edu',
      passwordHash: standardPassword,
      name: 'Martha Wayne',
      role: 'GUARDIAN',
      phone: '+1-555-0202',
    },
  });

  const student1User = await prisma.user.create({
    data: {
      email: 'student.arya@school.edu',
      passwordHash: studentPassword,
      name: 'Arya Stark',
      role: 'STUDENT',
      phone: '+1-555-0301',
    },
  });

  const student2User = await prisma.user.create({
    data: {
      email: 'student.bran@school.edu',
      passwordHash: studentPassword,
      name: 'Bran Stark',
      role: 'STUDENT',
      phone: '+1-555-0302',
    },
  });

  // 2. Create Teacher Profiles
  const teacher1Profile = await prisma.teacherProfile.create({
    data: {
      userId: teacher1User.id,
      employeeId: 'TCH-001',
      specialization: 'Advanced Mathematics & Algebra',
    },
  });

  const teacherAltProfile = await prisma.teacherProfile.create({
    data: {
      userId: teacherAltUser.id,
      employeeId: 'TCH-ALT',
      specialization: 'Mathematics & STEM',
    },
  });

  const teacher2Profile = await prisma.teacherProfile.create({
    data: {
      userId: teacher2User.id,
      employeeId: 'TCH-002',
      specialization: 'Physical & Natural Sciences',
    },
  });

  await prisma.teacherProfile.create({
    data: {
      userId: teacher3User.id,
      employeeId: 'TCH-003',
      specialization: 'English Literature & Humanities',
    },
  });

  // 3. Create Guardian Profiles
  const guardian1Profile = await prisma.guardianProfile.create({
    data: {
      userId: guardian1User.id,
      relationship: 'FATHER',
      occupation: 'Civil Engineer',
    },
  });

  const guardianAltProfile = await prisma.guardianProfile.create({
    data: {
      userId: guardianAltUser.id,
      relationship: 'FATHER',
      occupation: 'Civil Engineer',
    },
  });

  const guardian2Profile = await prisma.guardianProfile.create({
    data: {
      userId: guardian2User.id,
      relationship: 'MOTHER',
      occupation: 'Architect',
    },
  });

  // 4. Create Academic Classes & Sections
  const class10 = await prisma.academicClass.create({
    data: {
      name: 'Grade 10',
      code: 'G10',
    },
  });

  const class9 = await prisma.academicClass.create({
    data: {
      name: 'Grade 9',
      code: 'G9',
    },
  });

  const section10A = await prisma.section.create({
    data: {
      classId: class10.id,
      name: 'A',
      roomNumber: 'Room 101',
      capacity: 35,
    },
  });

  const section10B = await prisma.section.create({
    data: {
      classId: class10.id,
      name: 'B',
      roomNumber: 'Room 102',
      capacity: 35,
    },
  });

  const section9B = await prisma.section.create({
    data: {
      classId: class9.id,
      name: 'B',
      roomNumber: 'Room 202',
      capacity: 30,
    },
  });

  // 5. Create Subjects
  const mathSubject = await prisma.subject.create({
    data: {
      name: 'Mathematics',
      code: 'MATH-10',
      description: 'Algebra, Geometry, Trigonometry, and Statistics',
    },
  });

  const scienceSubject = await prisma.subject.create({
    data: {
      name: 'Science & Chemistry',
      code: 'SCI-10',
      description: 'Physics laws, Chemical reactions, and Biology basics',
    },
  });

  const englishSubject = await prisma.subject.create({
    data: {
      name: 'English Literature',
      code: 'ENG-10',
      description: 'Grammar, Reading comprehension, and Creative writing',
    },
  });

  // 6. Teacher Allocations (Crucial for Acceptance Test 1)
  // Sarah Connor teaches Math in Grade 10-A and Grade 9-B
  await prisma.classSubjectTeacher.create({
    data: {
      sectionId: section10A.id,
      subjectId: mathSubject.id,
      teacherProfileId: teacher1Profile.id,
      academicYear: '2024-2025',
    },
  });

  await prisma.classSubjectTeacher.create({
    data: {
      sectionId: section9B.id,
      subjectId: mathSubject.id,
      teacherProfileId: teacher1Profile.id,
      academicYear: '2024-2025',
    },
  });

  // Bruce Banner teaches Science in Grade 10-A
  await prisma.classSubjectTeacher.create({
    data: {
      sectionId: section10A.id,
      subjectId: scienceSubject.id,
      teacherProfileId: teacher2Profile.id,
      academicYear: '2024-2025',
    },
  });

  // 7. Create Student Profiles
  const aryaStudent = await prisma.studentProfile.create({
    data: {
      userId: student1User.id,
      admissionNumber: 'ADM-2024-001',
      firstName: 'Arya',
      lastName: 'Stark',
      gender: 'Female',
      dateOfBirth: '2009-04-15',
      rollNumber: 101,
      sectionId: section10A.id,
      status: 'ACTIVE',
    },
  });

  const branStudent = await prisma.studentProfile.create({
    data: {
      userId: student2User.id,
      admissionNumber: 'ADM-2024-002',
      firstName: 'Bran',
      lastName: 'Stark',
      gender: 'Male',
      dateOfBirth: '2010-06-20',
      rollNumber: 102,
      sectionId: section9B.id,
      status: 'ACTIVE',
    },
  });

  const bruceStudent = await prisma.studentProfile.create({
    data: {
      admissionNumber: 'ADM-2024-003',
      firstName: 'Bruce',
      lastName: 'Wayne',
      gender: 'Male',
      dateOfBirth: '2009-02-19',
      rollNumber: 103,
      sectionId: section10A.id,
      status: 'ACTIVE',
    },
  });

  const hermioneStudent = await prisma.studentProfile.create({
    data: {
      admissionNumber: 'ADM-2024-004',
      firstName: 'Hermione',
      lastName: 'Granger',
      gender: 'Female',
      dateOfBirth: '2009-09-19',
      rollNumber: 104,
      sectionId: section10A.id,
      status: 'ACTIVE',
    },
  });

  // 8. Link Students to Guardians (Crucial for Acceptance Test 4)
  // Robert Stark is guardian of Arya Stark & Bran Stark
  await prisma.studentGuardianRelation.create({
    data: {
      studentId: aryaStudent.id,
      guardianProfileId: guardian1Profile.id,
      isPrimary: true,
    },
  });

  await prisma.studentGuardianRelation.create({
    data: {
      studentId: aryaStudent.id,
      guardianProfileId: guardianAltProfile.id,
      isPrimary: false,
    },
  });

  await prisma.studentGuardianRelation.create({
    data: {
      studentId: branStudent.id,
      guardianProfileId: guardian1Profile.id,
      isPrimary: true,
    },
  });

  // Martha Wayne is guardian of Bruce Wayne
  await prisma.studentGuardianRelation.create({
    data: {
      studentId: bruceStudent.id,
      guardianProfileId: guardian2Profile.id,
      isPrimary: true,
    },
  });

  // 9. Create Grading Scale & Rules (Crucial for Acceptance Test 3)
  const gradingScale = await prisma.gradingScale.create({
    data: {
      name: 'Standard 100pt Percentage Scale',
      isDefault: true,
      rules: {
        create: [
          { grade: 'A+', minScore: 90, maxScore: 100, gradePoint: 4.0, description: 'Outstanding' },
          { grade: 'A', minScore: 80, maxScore: 89.99, gradePoint: 3.7, description: 'Excellent' },
          { grade: 'B+', minScore: 70, maxScore: 79.99, gradePoint: 3.3, description: 'Very Good' },
          { grade: 'B', minScore: 60, maxScore: 69.99, gradePoint: 3.0, description: 'Good' },
          { grade: 'C', minScore: 50, maxScore: 59.99, gradePoint: 2.0, description: 'Average' },
          { grade: 'D', minScore: 40, maxScore: 49.99, gradePoint: 1.0, description: 'Pass' },
          { grade: 'F', minScore: 0, maxScore: 39.99, gradePoint: 0.0, description: 'Fail' },
        ],
      },
    },
  });

  // 10. Pre-seed Attendance Records for past dates (Crucial for Acceptance Test 2)
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  await prisma.attendanceRecord.createMany({
    data: [
      {
        studentId: aryaStudent.id,
        sectionId: section10A.id,
        date: yesterday,
        session: 'FULL_DAY',
        status: 'PRESENT',
        recordedById: teacher1User.id,
      },
      {
        studentId: bruceStudent.id,
        sectionId: section10A.id,
        date: yesterday,
        session: 'FULL_DAY',
        status: 'PRESENT',
        recordedById: teacher1User.id,
      },
      {
        studentId: hermioneStudent.id,
        sectionId: section10A.id,
        date: yesterday,
        session: 'FULL_DAY',
        status: 'PRESENT',
        recordedById: teacher1User.id,
      },
      {
        studentId: aryaStudent.id,
        sectionId: section10A.id,
        date: today,
        session: 'FULL_DAY',
        status: 'PRESENT',
        recordedById: teacher1User.id,
      },
    ],
  });

  // 11. Create Exam & Schedules
  const midtermExam = await prisma.exam.create({
    data: {
      title: 'Midterm Examination 2025',
      term: 'Term 1',
      academicYear: '2024-2025',
      startDate: '2025-03-01',
      endDate: '2025-03-10',
      status: 'PUBLISHED',
    },
  });

  const mathSchedule = await prisma.examSchedule.create({
    data: {
      examId: midtermExam.id,
      sectionId: section10A.id,
      subjectId: mathSubject.id,
      examDate: '2025-03-02',
      maxMarks: 100,
      passMarks: 40,
    },
  });

  const scienceSchedule = await prisma.examSchedule.create({
    data: {
      examId: midtermExam.id,
      sectionId: section10A.id,
      subjectId: scienceSubject.id,
      examDate: '2025-03-04',
      maxMarks: 100,
      passMarks: 40,
    },
  });

  const englishSchedule = await prisma.examSchedule.create({
    data: {
      examId: midtermExam.id,
      sectionId: section10A.id,
      subjectId: englishSubject.id,
      examDate: '2025-03-06',
      maxMarks: 100,
      passMarks: 40,
    },
  });

  // 12. Pre-enter Marks for Arya Stark (92 in Math, 85 in Sci, 88 in Eng)
  await prisma.examMark.createMany({
    data: [
      {
        examScheduleId: mathSchedule.id,
        studentId: aryaStudent.id,
        marksObtained: 92,
        isAbsent: false,
        evaluatedById: teacher1User.id,
      },
      {
        examScheduleId: scienceSchedule.id,
        studentId: aryaStudent.id,
        marksObtained: 85,
        isAbsent: false,
        evaluatedById: teacher2User.id,
      },
      {
        examScheduleId: englishSchedule.id,
        studentId: aryaStudent.id,
        marksObtained: 88,
        isAbsent: false,
        evaluatedById: adminUser.id,
      },
      {
        examScheduleId: mathSchedule.id,
        studentId: hermioneStudent.id,
        marksObtained: 98,
        isAbsent: false,
        evaluatedById: teacher1User.id,
      },
    ],
  });

  // 13. Fee Categories & Invoices (Crucial for Acceptance Test 5)
  await prisma.feeCategory.createMany({
    data: [
      { name: 'Tuition Fee', description: 'Regular academic curriculum fees', isRecurring: true },
      { name: 'STEM Laboratory Fee', description: 'Practical labs and technology materials', isRecurring: false },
      { name: 'Library & Online Resources', description: 'Digital books and journals', isRecurring: true },
    ],
  });

  // Invoice 1: Fully Paid ($1200)
  const invoice1 = await prisma.feeInvoice.create({
    data: {
      invoiceNumber: 'INV-2025-001',
      studentId: aryaStudent.id,
      title: 'Term 1 Tuition Fee',
      category: 'Tuition Fee',
      amount: 1200,
      amountPaid: 1200,
      amountDue: 0,
      dueDate: '2025-02-15',
      status: 'PAID',
    },
  });

  await prisma.feePayment.create({
    data: {
      paymentNumber: 'PAY-2025-001',
      invoiceId: invoice1.id,
      amount: 1200,
      paymentMethod: 'ONLINE_SIMULATED',
      transactionId: 'TXN_SIM_987654321',
      referenceNote: 'Paid via simulated credit portal',
      receivedById: adminUser.id,
    },
  });

  // Invoice 2: Partially Paid ($350 total, $150 paid, $200 due)
  const invoice2 = await prisma.feeInvoice.create({
    data: {
      invoiceNumber: 'INV-2025-002',
      studentId: aryaStudent.id,
      title: 'STEM Laboratory & Computing Fee',
      category: 'STEM Laboratory Fee',
      amount: 350,
      amountPaid: 150,
      amountDue: 200,
      dueDate: '2025-04-30',
      status: 'PARTIALLY_PAID',
    },
  });

  await prisma.feePayment.create({
    data: {
      paymentNumber: 'PAY-2025-002',
      invoiceId: invoice2.id,
      amount: 150,
      paymentMethod: 'ONLINE_SIMULATED',
      transactionId: 'TXN_SIM_112233445',
      referenceNote: 'Installment 1 paid online',
      receivedById: adminUser.id,
    },
  });

  // Invoice 3: Bran Stark Pending ($950)
  await prisma.feeInvoice.create({
    data: {
      invoiceNumber: 'INV-2025-003',
      studentId: branStudent.id,
      title: 'Term 1 Comprehensive Fee',
      category: 'Tuition Fee',
      amount: 950,
      amountPaid: 0,
      amountDue: 950,
      dueDate: '2025-03-31',
      status: 'PENDING',
    },
  });

  // 14. Audit Log
  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        action: 'SYSTEM_INITIALIZATION',
        entityType: 'System',
        entityId: 'ROOT',
        details: 'Initial system seeding with synthetic school data completed',
      },
      {
        userId: teacher1User.id,
        action: 'ATTENDANCE_RECORDED',
        entityType: 'Attendance',
        entityId: section10A.id,
        details: 'Recorded daily attendance for Grade 10-A',
      },
      {
        userId: adminUser.id,
        action: 'PAYMENT_RECORDED',
        entityType: 'FeePayment',
        entityId: invoice1.id,
        details: 'Simulated payment of $1200 received for INV-2025-001',
      },
    ],
  });

  console.log('✅ Seeding completed successfully!');
  console.log('📋 Demo Accounts created:');
  console.log('   Admin:    admin@school.edu / Admin@123');
  console.log('   Teacher:  teacher.math@school.edu / Teacher@123 (Sarah Connor - Assigned to 10-A, 9-B)');
  console.log('   Teacher:  teacher.science@school.edu / Teacher@123 (Dr. Bruce Banner - Assigned to 10-A)');
  console.log('   Guardian: guardian.stark@school.edu / Guardian@123 (Robert Stark - Children: Arya & Bran)');
  console.log('   Guardian: guardian.wayne@school.edu / Guardian@123 (Martha Wayne - Child: Bruce Wayne)');
  console.log('   Student:  student.arya@school.edu / Student@123 (Arya Stark)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
