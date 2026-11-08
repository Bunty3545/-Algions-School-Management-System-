# Algions Assessment Submission Form Details

Use the pre-filled responses below to complete your individualized submission form for **ALGIONS AI LABS PRIVATE LIMITED**:

---

### 1. Candidate Identification
- **Full Name**: [Candidate Name]
- **Registration Number**: [Candidate Registration Number]
- **University Email**: [Candidate University Email]

---

### 2. Assignment Confirmation
- **Internship Role**: Full-Stack Web Development
- **Assigned Project Title**: School Management System

---

### 3. Code and Version
- **Repository URL**: `https://github.com/Bunty3545/-Algions-School-Management-System-.git`
- **Primary Branch**: `main`
- **Reviewer Access**: Public repository (`https://github.com/Bunty3545/-Algions-School-Management-System-`)

---

### 4. Demonstration
- **Demonstration Video**: Included directly in repository:
  - **Direct Video Stream / Download**: [school-management-system-demo.webm](https://github.com/Bunty3545/-Algions-School-Management-System-/raw/main/demo-video/school-management-system-demo.webm)
  - **Local Path**: `demo-video/school-management-system-demo.webm` (File Size: ~9.2 MB)
- **Demo Mode Declaration**: **Local-Only High-Fidelity Demo with Zero External Friction**
  - *Declaration*: "The application runs locally with zero external configuration via `npm run setup && npm test && npm run dev`. An automated embedded PostgreSQL engine with pre-seeded synthetic data and an instant 1-click reviewer persona switcher eliminates external hosting credentials and payment API dependencies. Production deployment manifests for Render, Vercel, and Docker Compose are also included."
- **Live Web Demo URL (if deployed)**: `N/A (Local-Only Demo Declared; Docker Compose & Render blueprints included in repo)`

---

### 5. Documentation
- **Technical Report**: `TECHNICAL_REPORT.md` (Included in repository root)
- **Architecture & ER Diagram**: Included in `README.md` and `TECHNICAL_REPORT.md` (Rendered via Mermaid)
- **API Documentation**: Interactive Swagger UI at `http://localhost:5000/api-docs` (OpenAPI 3.0 specification in `backend/src/docs/swagger.json`)

---

### 6. Technology Stack & Limitations
- **Technology Stack**:
  - **Backend**: Node.js v22, Express.js, TypeScript, Prisma ORM, PostgreSQL, Zod validation, JWT, bcryptjs, Swagger UI
  - **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Recharts, Axios
  - **Testing**: Jest, Supertest, ts-jest (19/19 acceptance & security tests passing)
- **Setup Notes**:
  - `npm run setup` — Installs monorepo dependencies, generates Prisma client, runs schema sync, and seeds synthetic demo data.
  - `npm test` — Executes the 19 automated tests covering all 5 acceptance criteria.
  - `npm run dev` — Concurrently starts backend on `http://localhost:5000` and frontend on `http://localhost:5173`.
- **Known Assumptions & Incomplete Features**:
  1. *Payment Gateway*: Per assessment instructions, payments are simulated; real payment gateway credentials (e.g. Stripe, Razorpay) are not used. The system generates realistic simulated receipts and reconciles balances.
  2. *PostgreSQL Relational Engine*: Configured with an embedded PostgreSQL 18 engine locally for zero-friction reviewer reproducibility without requiring pre-installed Postgres services. Production-ready configurations for Render, Docker Compose, and external managed Postgres are included.
  3. *SMS/Email Delivery*: Notifications are persisted to the immutable audit trail rather than dispatched via paid third-party SMS providers.

---

### 7. AI & Attribution
- **AI Tools Used**: Antigravity Assistant (Google DeepMind)
- **Purpose of Use**: Architectural scaffolding, test suite generation, TypeScript typing validation, and documentation structuring.
- **Attributions**:
  - Prisma ORM (`@prisma/client`, `prisma`)
  - Tailwind CSS for modern responsive styling
  - Lucide React for accessible UI icons
  - Swagger UI Express for OpenAPI documentation

---

### 8. Declarations
- [x] **Originality**: I confirm that the project architecture, data models, business logic, and test suites represent my own engineering understanding and I am prepared to modify any component during the live debugging task.
- [x] **Live Walkthrough**: I am prepared to attend the 15-minute technical walkthrough and complete the 10-minute live code modification task.
- [x] **Privacy & Secrets**: No real secrets, passwords, payment tokens, or sensitive personal data are committed. Only dummy demo credentials and `.env.example` placeholders are provided.
- [x] **Link Integrity**: All links provided in this submission have been verified and are publicly accessible.

---

### 9. Test & Demo Account Instructions
Reviewers can use the **1-Click Reviewer Persona Switcher** in the top navigation bar or enter the credentials below:

| Role | Email | Password | Persona & Test Scope |
|---|---|---|---|
| **Admin** | `admin@school.demo` | `Password@123` | Dr. Arthur Vance. Universal operations, classes, teachers, ledger reconciliation, audit logs. |
| **Teacher** | `teacher@school.demo` | `Password@123` | Sarah Connor. Assigned to Grade 10-A and 9-B Mathematics. Attendance recording & marks entry. |
| **Teacher** | `teacher.science@school.edu` | `Password@123` | Dr. Bruce Banner. Assigned to Grade 10-A Science & Chemistry. |
| **Guardian** | `guardian@school.demo` | `Password@123` | Robert Stark. Parent of Arya Stark (10-A) & Bran Stark (9-B). Privacy-isolated from Bruce Wayne. |
| **Student** | `student.arya@school.edu` | `Password@123` | Arya Stark. Personal grade reports, attendance records, fee status. |
