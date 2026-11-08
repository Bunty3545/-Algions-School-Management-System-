# 3–5 Minute Video Walkthrough Script - School Management System

This guide provides a professional, step-by-step recording script to create an impactful 3–5 minute video presentation of your Full-Stack School Management System for ALGIONS AI LABS PRIVATE LIMITED.

---

## 🎬 Video Recording Checklist & Setup
- **Screen Resolution**: 1080p (1920x1080) at 60 FPS or 30 FPS.
- **Recording Tools**: OBS Studio, Loom, or Windows Game Bar (`Win + Alt + R`).
- **Browser Windows**:
  - Tab 1: `http://localhost:5173` (Frontend Dashboard)
  - Tab 2: `http://localhost:5000/api-docs` (Swagger Interactive API Documentation)
  - Terminal: Split terminal showing backend tests and servers.

---

## ⏱️ Video Timeline Breakdown (Total: 4:30)

| Timestamp | Section | Visual Focus | Voiceover / Script Narration |
|---|---|---|---|
| **0:00 - 0:40** | **Project Overview & Tech Stack** | Terminal running tests + Architecture ERD | *"Hello everyone. Today I am presenting my Full-Stack School Management System built for Algions AI Labs. The application is architected with React 18, Vite, Tailwind CSS, Recharts, and Lucide icons on the frontend, backed by a Node.js Express TypeScript REST API, Prisma ORM, and PostgreSQL. Here we see 19 automated integration tests running with Jest and Supertest, covering all critical security invariants and business rules."* |
| **0:40 - 1:40** | **Admin Dashboard & Acceptance Test 5** | Admin Portal (Overview, Charts, Fees) | *"Let's sign in as the School Administrator using the 1-click persona. On the Admin Overview, we observe real-time KPI metrics, interactive Recharts graphs depicting revenue collection and student distribution, and immutable audit logs. In the Fees & Invoices tab, we can view invoices and demonstrate Acceptance Test 5: Fee Ledger Reconciliation. Total Billed reconciles with Total Paid plus Outstanding Due with zero discrepancies."* |
| **1:40 - 2:40** | **Teacher Portal & Acceptance Tests 1 & 2** | Teacher Portal (Sarah Connor) | *"Next, let's switch to Teacher Sarah Connor. In accordance with Acceptance Test 1, Sarah Connor is assigned strictly to Grade 10-A and 9-B Mathematics. Notice that she only sees her assigned classes. When she opens the daily attendance sheet for Grade 10-A, she can batch mark students as Present, Absent, or Late. Here we demonstrate Acceptance Test 2: duplicate attendance prevention. Any attempt to record duplicate attendance for the same student on the same date and session is rejected by database unique constraints, while safe update mode allows updating records seamlessly."* |
| **2:40 - 3:40** | **Guardian Portal & Acceptance Tests 3 & 4** | Guardian Portal (Robert Stark) | *"Now let's switch to Guardian Robert Stark. Under Acceptance Test 4: Guardian Privacy and Data Isolation, Robert can only access his linked children: Arya Stark and Bran Stark. The system strictly forbids him from accessing unlinked students like Bruce Wayne. In the Academic Report Card tab, we observe Acceptance Test 3: automatic grade calculation. Total marks, percentages to two decimals, letter grades, and pass/fail statuses are compiled automatically. Robert can also view fee invoices and make simulated online payments with instant ledger credit."* |
| **3:40 - 4:20** | **Interactive Swagger API Docs** | `http://localhost:5000/api-docs` | *"Taking a look at our backend API, all endpoints are fully documented with OpenAPI/Swagger. From authentication, student admissions, attendance, exams, fees, to audit logs, developers can explore parameters, schemas, and test endpoints interactively."* |
| **4:20 - 4:45** | **Conclusion & Architectural Wrap-Up** | Architecture Diagram / VS Code | *"In summary, this project delivers a secure, responsive, database-backed School Management System that meets every specification set forth by Algions AI Labs. Thank you!"* |

---

## 💡 Quick Tips for High Marks
1. Use the **1-Click Reviewer Personas** on the login screen to quickly switch between Admin, Teacher, and Guardian without having to type passwords repeatedly.
2. Highlight the **Database Compound Unique Constraint** when talking about attendance deduplication (`@@unique([studentId, date, session])`).
3. Mention the **Automated Fee Reconciliation Invariant**:
   $$\text{Total Invoiced} \equiv \text{Settled Payments} + \text{Outstanding Due}$$

