# Swagger / OpenAPI Documentation Guide

The Algions School Management System backend exposes an interactive OpenAPI (Swagger 3.0) dashboard available at:
```
http://localhost:5000/api-docs
```

## Available API Endpoint Groups

### 1. Authentication (`/api/auth` or `/api/v1/auth`)
- `POST /api/auth/login`: Authenticates user credentials with bcrypt and returns a signed JWT bearer token.
- `GET /api/auth/me`: Validates JWT token and returns current user profile with role-specific IDs (TeacherProfileId, GuardianProfileId, StudentProfileId).
- `POST /api/auth/logout`: Invalidates client session.

### 2. Academic & Classes (`/api/academic`, `/api/classes`, `/api/sections`, `/api/subjects`, `/api/teachers`, `/api/students`)
- `GET /api/classes`: Returns all academic classes with section counts and enrolled student counts.
- `POST /api/classes`: [Admin only] Creates a new academic class.
- `POST /api/sections`: [Admin only] Creates a new class section.
- `GET /api/subjects`: Returns all configured subjects and descriptions.
- `GET /api/teachers`: Returns teaching faculty directory and specializations.
- `GET /api/academic/my-allocations`: Returns assigned classes & subjects for the authenticated teacher.
- `POST /api/academic/assign-teacher`: [Admin only] Binds a teacher to a section and subject.
- `GET /api/students`: Lists enrolled students with optional section and search filters.
- `GET /api/students/:studentId`: Returns complete profile for a student including guardians and fee status.
- `POST /api/students`: [Admin only] Admits a new student and optionally registers their guardian.
- `PUT /api/students/:studentId`: [Admin only] Updates student personal or enrollment details.
- `DELETE /api/students/:studentId`: [Admin only] Soft/hard removes student record with audit log.

### 3. Attendance (`/api/attendance`)
- `POST /api/attendance/record`: [Teacher/Admin] Records batch attendance for an assigned section with date, session, and deduplication guard.
- `GET /api/attendance/section/:sectionId`: [Teacher/Admin] Returns daily attendance sheet for an assigned section.
- `GET /api/attendance/student/:studentId`: [Guardian/Student/Admin] Returns attendance history and percentage for a student.

### 4. Examinations & Results (`/api/exams`, `/api/results`)
- `GET /api/exams`: Lists scheduled and published examinations.
- `POST /api/exams`: [Admin only] Creates a new examination term.
- `GET /api/exams/:examId/schedules`: Returns subject exam schedules with maxMarks and passMarks.
- `POST /api/exams/schedules`: [Admin only] Schedules a subject exam for a class section.
- `GET /api/exams/schedules/:scheduleId/sheet`: [Teacher/Admin] Returns marks grading sheet for an assigned exam.
- `POST /api/exams/marks`: [Teacher/Admin] Enters student marks with validation rejecting marks $> \text{maxMarks}$.
- `GET /api/exams/:examId/report-card/:studentId`: [Guardian/Student/Admin] Generates compiled academic report card with weighted percentage and letter grade.

### 5. Fees & Payments (`/api/fees`, `/api/payments`)
- `GET /api/fees/invoices`: [Admin only] Returns all fee invoices and statuses.
- `POST /api/fees/invoices`: [Admin only] Issues a new student fee invoice.
- `POST /api/fees/pay`: [Guardian/Student/Admin] Records simulated online fee installment and recalculates balance due.
- `GET /api/fees/student/:studentId`: [Guardian/Student/Admin] Returns student invoice history and outstanding balance.
- `GET /api/fees/reconciliation`: [Admin only] Returns system-wide audit verifying $\text{Total Billed} = \text{Total Paid} + \text{Total Outstanding}$ with zero discrepancies.

### 6. Audit & Analytics (`/api/audit-logs`, `/api/reports`, `/api/dashboard`)
- `GET /api/audit-logs`: [Admin only] Chronological audit log of all system security events, admissions, payments, and grade entries.
- `GET /api/dashboard`: Aggregated dashboard metrics tailored to current user role.

