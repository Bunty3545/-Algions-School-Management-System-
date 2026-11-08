export interface GradeRuleDefinition {
  grade: string;
  minScore: number;
  maxScore: number;
  gradePoint: number;
  description?: string | null;
}

export interface SubjectMarkDetail {
  subjectName: string;
  subjectCode: string;
  maxMarks: number;
  passMarks: number;
  marksObtained: number;
  isAbsent: boolean;
  remarks?: string | null;
}

export interface CalculatedSubjectResult extends SubjectMarkDetail {
  percentage: number;
  grade: string;
  gradePoint: number;
  isPassed: boolean;
}

export interface CalculatedExamReport {
  studentId: string;
  studentName: string;
  rollNumber?: number | null;
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

export const DEFAULT_GRADING_RULES: GradeRuleDefinition[] = [
  { grade: 'A+', minScore: 90, maxScore: 100, gradePoint: 4.0, description: 'Outstanding performance' },
  { grade: 'A', minScore: 80, maxScore: 89.99, gradePoint: 3.7, description: 'Excellent performance' },
  { grade: 'B+', minScore: 70, maxScore: 79.99, gradePoint: 3.3, description: 'Very Good' },
  { grade: 'B', minScore: 60, maxScore: 69.99, gradePoint: 3.0, description: 'Good' },
  { grade: 'C', minScore: 50, maxScore: 59.99, gradePoint: 2.0, description: 'Satisfactory / Average' },
  { grade: 'D', minScore: 40, maxScore: 49.99, gradePoint: 1.0, description: 'Pass' },
  { grade: 'F', minScore: 0, maxScore: 39.99, gradePoint: 0.0, description: 'Fail / Unsatisfactory' },
];

export function calculateGrade(scorePercentage: number, rules: GradeRuleDefinition[] = DEFAULT_GRADING_RULES): { grade: string; gradePoint: number; description?: string | null } {
  const rounded = Math.round(scorePercentage * 100) / 100;
  
  // Sort rules descending by minScore
  const sorted = [...rules].sort((a, b) => b.minScore - a.minScore);
  
  for (const rule of sorted) {
    if (rounded >= rule.minScore) {
      return {
        grade: rule.grade,
        gradePoint: rule.gradePoint,
        description: rule.description,
      };
    }
  }

  // Fallback to lowest rule or F
  const lowest = sorted[sorted.length - 1];
  return {
    grade: lowest?.grade || 'F',
    gradePoint: lowest?.gradePoint || 0.0,
    description: lowest?.description || 'Failed',
  };
}

export function compileStudentReportCard(
  student: {
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
    rollNumber?: number | null;
    section: {
      name: string;
      class: { name: string };
    };
  },
  exam: {
    title: string;
    academicYear: string;
  },
  subjectMarks: SubjectMarkDetail[],
  rules: GradeRuleDefinition[] = DEFAULT_GRADING_RULES
): CalculatedExamReport {
  let totalMarksObtained = 0;
  let totalMaxMarks = 0;
  let anySubjectFailed = false;

  const subjects: CalculatedSubjectResult[] = subjectMarks.map((sm) => {
    const marks = sm.isAbsent ? 0 : sm.marksObtained;
    const percentage = sm.maxMarks > 0 ? (marks / sm.maxMarks) * 100 : 0;
    const gradeInfo = calculateGrade(percentage, rules);
    const isPassed = !sm.isAbsent && marks >= sm.passMarks;

    if (!isPassed) {
      anySubjectFailed = true;
    }

    totalMarksObtained += marks;
    totalMaxMarks += sm.maxMarks;

    return {
      ...sm,
      percentage: Math.round(percentage * 100) / 100,
      grade: gradeInfo.grade,
      gradePoint: gradeInfo.gradePoint,
      isPassed,
    };
  });

  const overallPercentage = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 10000) / 100 : 0;
  const overallGradeInfo = calculateGrade(overallPercentage, rules);
  const isPassed = !anySubjectFailed && subjects.length > 0;

  let summaryRemark = 'Promoted with Honours';
  if (!isPassed) {
    summaryRemark = 'Needs improvement in required subjects';
  } else if (overallPercentage >= 80) {
    summaryRemark = 'Distinction / Excellent Achievement';
  } else if (overallPercentage >= 60) {
    summaryRemark = 'Good academic standing';
  } else {
    summaryRemark = 'Promoted to next grade';
  }

  return {
    studentId: student.id,
    studentName: `${student.firstName} ${student.lastName}`.trim(),
    rollNumber: student.rollNumber,
    admissionNumber: student.admissionNumber,
    className: student.section.class.name,
    sectionName: student.section.name,
    examTitle: exam.title,
    academicYear: exam.academicYear,
    subjects,
    totalMarksObtained: Math.round(totalMarksObtained * 100) / 100,
    totalMaxMarks,
    overallPercentage,
    overallGrade: overallGradeInfo.grade,
    overallGradePoint: overallGradeInfo.gradePoint,
    isPassed,
    summaryRemark,
  };
}
