import { prisma } from '../utils/prisma';
import { NotFoundError, ConflictError } from '../utils/errors';
import { createAuditLog } from './auditService';

export async function getAllClasses() {
  return await prisma.academicClass.findMany({
    include: {
      sections: {
        include: {
          _count: {
            select: { students: true },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function createClass(name: string, code: string) {
  const existing = await prisma.academicClass.findFirst({
    where: { OR: [{ name }, { code }] },
  });
  if (existing) {
    throw new ConflictError('A class with this name or code already exists');
  }

  return await prisma.academicClass.create({
    data: { name, code },
  });
}

export async function createSection(classId: string, name: string, roomNumber?: string, capacity: number = 40) {
  const existing = await prisma.section.findUnique({
    where: {
      classId_name: { classId, name },
    },
  });
  if (existing) {
    throw new ConflictError('A section with this name already exists in this class');
  }

  return await prisma.section.create({
    data: { classId, name, roomNumber, capacity },
    include: { class: true },
  });
}

export async function getAllSubjects() {
  return await prisma.subject.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function getAllTeachers() {
  return await prisma.teacherProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      allocations: {
        include: {
          section: {
            include: { class: true },
          },
          subject: true,
        },
      },
    },
  });
}

export async function getTeacherAllocations(teacherProfileId: string) {
  const allocations = await prisma.classSubjectTeacher.findMany({
    where: { teacherProfileId },
    include: {
      section: {
        include: {
          class: true,
          _count: { select: { students: true } },
        },
      },
      subject: true,
    },
  });

  return allocations;
}

export async function assignTeacherToSectionSubject(params: {
  sectionId: string;
  subjectId: string;
  teacherProfileId: string;
  academicYear?: string;
  recordedById?: string;
}) {
  const { sectionId, subjectId, teacherProfileId, academicYear = '2024-2025', recordedById } = params;

  const allocation = await prisma.classSubjectTeacher.upsert({
    where: {
      sectionId_subjectId: { sectionId, subjectId },
    },
    update: {
      teacherProfileId,
      academicYear,
    },
    create: {
      sectionId,
      subjectId,
      teacherProfileId,
      academicYear,
    },
    include: {
      section: { include: { class: true } },
      subject: true,
      teacherProfile: { include: { user: true } },
    },
  });

  if (recordedById) {
    await createAuditLog({
      userId: recordedById,
      action: 'TEACHER_ASSIGNED',
      entityType: 'ClassSubjectTeacher',
      entityId: allocation.id,
      details: `Assigned teacher ${allocation.teacherProfile.user.name} to ${allocation.section.class.name}-${allocation.section.name} for ${allocation.subject.name}`,
    });
  }

  return allocation;
}

export async function getAllStudents(filter?: { sectionId?: string; search?: string }) {
  const where: any = { status: 'ACTIVE' };
  if (filter?.sectionId) {
    where.sectionId = filter.sectionId;
  }
  if (filter?.search) {
    where.OR = [
      { firstName: { contains: filter.search } },
      { lastName: { contains: filter.search } },
      { admissionNumber: { contains: filter.search } },
    ];
  }

  return await prisma.studentProfile.findMany({
    where,
    include: {
      section: {
        include: { class: true },
      },
      guardians: {
        include: {
          guardianProfile: {
            include: { user: true },
          },
        },
      },
    },
    orderBy: [{ section: { class: { name: 'asc' } } }, { rollNumber: 'asc' }],
  });
}

export async function getStudentById(studentId: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      section: {
        include: {
          class: true,
          teacherAllocations: {
            include: {
              subject: true,
              teacherProfile: { include: { user: true } },
            },
          },
        },
      },
      guardians: {
        include: {
          guardianProfile: {
            include: { user: true },
          },
        },
      },
      feeInvoices: {
        orderBy: { dueDate: 'asc' },
      },
    },
  });

  if (!student) {
    throw new NotFoundError('Student not found');
  }

  return student;
}

export async function createStudent(data: {
  firstName: string;
  lastName: string;
  admissionNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  rollNumber?: number;
  sectionId: string;
  guardianName?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  recordedById?: string;
}) {
  const count = await prisma.studentProfile.count();
  const admissionNumber = data.admissionNumber || `ADM-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

  const student = await prisma.studentProfile.create({
    data: {
      admissionNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender || 'Other',
      dateOfBirth: data.dateOfBirth,
      rollNumber: data.rollNumber || count + 1,
      sectionId: data.sectionId,
      status: 'ACTIVE',
    },
    include: {
      section: { include: { class: true } },
    },
  });

  // If guardian info provided, create or link guardian
  if (data.guardianEmail && data.guardianName) {
    let guardianUser = await prisma.user.findUnique({
      where: { email: data.guardianEmail.toLowerCase() },
      include: { guardianProfile: true },
    });

    if (!guardianUser) {
      const bcrypt = (await import('bcryptjs')).default;
      const defaultPassword = await bcrypt.hash('Password@123', 10);
      guardianUser = await prisma.user.create({
        data: {
          email: data.guardianEmail.toLowerCase(),
          name: data.guardianName,
          phone: data.guardianPhone || '+1-555-0999',
          role: 'GUARDIAN',
          passwordHash: defaultPassword,
          guardianProfile: {
            create: {
              relationship: 'PARENT',
            },
          },
        },
        include: { guardianProfile: true },
      });
    }

    if (guardianUser.guardianProfile) {
      await prisma.studentGuardianRelation.upsert({
        where: {
          studentId_guardianProfileId: {
            studentId: student.id,
            guardianProfileId: guardianUser.guardianProfile.id,
          },
        },
        create: {
          studentId: student.id,
          guardianProfileId: guardianUser.guardianProfile.id,
          isPrimary: true,
        },
        update: {},
      });
    }
  }

  if (data.recordedById) {
    await createAuditLog({
      userId: data.recordedById,
      action: 'STUDENT_CREATED',
      entityType: 'StudentProfile',
      entityId: student.id,
      details: `Enrolled new student ${student.firstName} ${student.lastName} (${admissionNumber}) into ${student.section.class.name}-${student.section.name}`,
    });
  }

  return student;
}

export async function updateStudent(studentId: string, data: {
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  rollNumber?: number;
  sectionId?: string;
  status?: string;
  recordedById?: string;
}) {
  const existing = await prisma.studentProfile.findUnique({ where: { id: studentId } });
  if (!existing) {
    throw new NotFoundError('Student not found');
  }

  const updated = await prisma.studentProfile.update({
    where: { id: studentId },
    data: {
      firstName: data.firstName ?? existing.firstName,
      lastName: data.lastName ?? existing.lastName,
      gender: data.gender ?? existing.gender,
      dateOfBirth: data.dateOfBirth ?? existing.dateOfBirth,
      rollNumber: data.rollNumber ?? existing.rollNumber,
      sectionId: data.sectionId ?? existing.sectionId,
      status: data.status ?? existing.status,
    },
    include: {
      section: { include: { class: true } },
    },
  });

  if (data.recordedById) {
    await createAuditLog({
      userId: data.recordedById,
      action: 'STUDENT_UPDATED',
      entityType: 'StudentProfile',
      entityId: updated.id,
      details: `Updated details for student ${updated.firstName} ${updated.lastName}`,
    });
  }

  return updated;
}

export async function deleteStudent(studentId: string, recordedById?: string) {
  const existing = await prisma.studentProfile.findUnique({ where: { id: studentId } });
  if (!existing) {
    throw new NotFoundError('Student not found');
  }

  await prisma.studentProfile.delete({ where: { id: studentId } });

  if (recordedById) {
    await createAuditLog({
      userId: recordedById,
      action: 'STUDENT_DELETED',
      entityType: 'StudentProfile',
      entityId: studentId,
      details: `Deleted student ${existing.firstName} ${existing.lastName} (${existing.admissionNumber})`,
    });
  }

  return { success: true, message: 'Student removed successfully' };
}

export async function createTeacher(data: {
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  recordedById?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing) {
    throw new ConflictError('A user with this email address already exists');
  }

  const bcrypt = (await import('bcryptjs')).default;
  const passwordHash = await bcrypt.hash('Password@123', 10);
  const count = await prisma.teacherProfile.count();
  const employeeId = `TCH-${String(count + 1).padStart(3, '0')}`;

  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      name: data.name,
      phone: data.phone || '+1-555-0800',
      role: 'TEACHER',
      passwordHash,
      teacherProfile: {
        create: {
          employeeId,
          specialization: data.specialization || 'General Education',
        },
      },
    },
    include: {
      teacherProfile: true,
    },
  });

  if (data.recordedById) {
    await createAuditLog({
      userId: data.recordedById,
      action: 'TEACHER_CREATED',
      entityType: 'TeacherProfile',
      entityId: user.teacherProfile!.id,
      details: `Created new teacher profile for ${user.name} (${employeeId})`,
    });
  }

  return user;
}

export async function createSubject(data: { name: string; code: string; description?: string }) {
  const existing = await prisma.subject.findFirst({
    where: { OR: [{ name: data.name }, { code: data.code }] },
  });
  if (existing) {
    throw new ConflictError('Subject with this name or code already exists');
  }

  return await prisma.subject.create({
    data: {
      name: data.name,
      code: data.code,
      description: data.description,
    },
  });
}

export async function getAllGuardians() {
  return await prisma.guardianProfile.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
      students: {
        include: {
          student: {
            include: {
              section: { include: { class: true } },
            },
          },
        },
      },
    },
  });
}
