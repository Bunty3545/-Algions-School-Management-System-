import { prisma } from '../utils/prisma';
import { getStudentAttendanceSummary } from './attendanceService';
import { getStudentFeeSummary } from './feeService';

export async function getAdminDashboardMetrics() {
  const [
    studentCount,
    teacherCount,
    classCount,
    sectionCount,
    subjectCount,
    invoices,
    recentAudits,
  ] = await Promise.all([
    prisma.studentProfile.count({ where: { status: 'ACTIVE' } }),
    prisma.teacherProfile.count(),
    prisma.academicClass.count(),
    prisma.section.count(),
    prisma.subject.count(),
    prisma.feeInvoice.findMany({ select: { amount: true, amountPaid: true, amountDue: true } }),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, role: true } } },
    }),
  ]);

  const totalBilled = invoices.reduce((sum, i) => sum + i.amount, 0);
  const totalCollected = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
  const totalOutstanding = invoices.reduce((sum, i) => sum + i.amountDue, 0);
  const feeCollectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  // Today's attendance
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = await prisma.attendanceRecord.findMany({
    where: { date: today },
  });
  const todayPresent = todayAttendance.filter((a) => a.status === 'PRESENT').length;
  const attendanceRateToday =
    todayAttendance.length > 0 ? Math.round((todayPresent / todayAttendance.length) * 100) : 100;

  return {
    overview: {
      studentCount,
      teacherCount,
      classCount,
      sectionCount,
      subjectCount,
    },
    finances: {
      totalBilled: Math.round(totalBilled * 100) / 100,
      totalCollected: Math.round(totalCollected * 100) / 100,
      totalOutstanding: Math.round(totalOutstanding * 100) / 100,
      collectionRate: feeCollectionRate,
    },
    attendance: {
      recordsToday: todayAttendance.length,
      presentToday: todayPresent,
      rateToday: attendanceRateToday,
    },
    recentActivities: recentAudits,
  };
}

export async function getTeacherDashboardMetrics(teacherProfileId: string) {
  const allocations = await prisma.classSubjectTeacher.findMany({
    where: { teacherProfileId },
    include: {
      section: {
        include: {
          class: true,
          students: { where: { status: 'ACTIVE' } },
        },
      },
      subject: true,
    },
  });

  const today = new Date().toISOString().split('T')[0];

  const assignedClassesWithAttendance = await Promise.all(
    allocations.map(async (alloc) => {
      const attendance = await prisma.attendanceRecord.findMany({
        where: {
          sectionId: alloc.sectionId,
          date: today,
        },
      });

      const present = attendance.filter((a) => a.status === 'PRESENT').length;
      return {
        allocationId: alloc.id,
        sectionId: alloc.sectionId,
        className: `${alloc.section.class.name}-${alloc.section.name}`,
        subjectName: alloc.subject.name,
        studentCount: alloc.section.students.length,
        attendanceRecordedToday: attendance.length > 0,
        presentToday: present,
      };
    })
  );

  return {
    totalAssignedClasses: allocations.length,
    assignedClasses: assignedClassesWithAttendance,
  };
}

export async function getGuardianDashboardMetrics(guardianProfileId: string) {
  const relation = await prisma.studentGuardianRelation.findMany({
    where: { guardianProfileId },
    include: {
      student: {
        include: {
          section: { include: { class: true } },
        },
      },
    },
  });

  const childrenSummaries = await Promise.all(
    relation.map(async (rel) => {
      const [attendance, fee] = await Promise.all([
        getStudentAttendanceSummary(rel.studentId),
        getStudentFeeSummary(rel.studentId),
      ]);

      return {
        studentId: rel.student.id,
        name: `${rel.student.firstName} ${rel.student.lastName}`,
        admissionNumber: rel.student.admissionNumber,
        rollNumber: rel.student.rollNumber,
        className: `${rel.student.section.class.name}-${rel.student.section.name}`,
        attendanceRate: attendance.attendanceRate,
        totalBilled: fee.totalBilled,
        totalOutstanding: fee.totalOutstanding,
        recentAttendance: attendance.history.slice(0, 5),
        invoices: fee.invoices,
      };
    })
  );

  return {
    children: childrenSummaries,
  };
}
