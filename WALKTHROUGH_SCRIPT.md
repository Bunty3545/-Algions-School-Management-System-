# 🎥 3–5 Minute Video Walkthrough Script
**Project**: Algions School Management System (SMS)  
**Target Video Duration**: 3 to 4 minutes  
**Tools**: Loom, OBS Studio, or Windows Game Bar (`Win + G`)

---

## ⏱️ Video Timeline & Screen Actions

### [0:00 – 0:45] Intro & Automated Test Verification
- **Screen**: VS Code Terminal.
- **Voiceover**:
  > *"Hello, my name is [Your Name], and this is my submission for the Algions AI Labs Full-Stack Web Development assessment: the School Management System.*
  >
  > *Before jumping into the UI, let's verify our automated test suite. I'll run `npm test`."*
- **Action**: Run `npm test`.
- **Screen**: Show all 18 Jest tests passing with 100% green status.
- **Voiceover**:
  > *"As you can see, all 18 automated integration tests covering the 5 core acceptance criteria, transaction boundaries, deduplication, and negative security edge cases pass cleanly in under 7 seconds."*

---

### [0:45 – 1:45] Teacher Journey: Scope Restriction & Attendance Deduplication
- **Screen**: Browser at `http://localhost:5173`.
- **Action**: In the top reviewer bar, click **Teacher (Sarah Connor)**.
- **Voiceover**:
  > *"First, let's look at Acceptance Test 1 and 2 from the perspective of teacher Sarah Connor.*
  >
  > *Sarah is assigned specifically to Grade 10-A and 9-B Mathematics. Our backend middleware enforces that she can only access attendance sheets and marks for these allocated classes. Any attempt to access an unassigned section like Grade 10-B is rejected with a 403 Forbidden.*
  >
  > *Now let's demonstrate Acceptance Test 2: Attendance Deduplication. Here is the Grade 10-A daily sheet. I can toggle students between Present, Absent, and Late, or click 'Mark All Present'. When I click 'Submit Attendance', the request is processed in an atomic database transaction. If duplicate entries are submitted without permission, the database composite constraint `[studentId, date, session]` rejects them. With update mode enabled, it safely updates existing records without creating redundant database rows."*

---

### [1:45 – 2:45] Guardian Journey: Privacy Isolation, Report Cards & Fee Settlement
- **Screen**: Browser.
- **Action**: In the top reviewer bar, click **Guardian (Robert Stark)**.
- **Voiceover**:
  > *"Next, let's switch to Guardian Robert Stark to demonstrate Acceptance Test 3, 4, and 5.*
  >
  > *Notice that Robert Stark has access exclusively to his linked children: Arya Stark and Bran Stark. Server-side middleware verifies the guardianship relationship in the database; attempting to query another student, such as Bruce Wayne, is strictly blocked.*
  >
  > *Under the Academic Report Card tab, we see Acceptance Test 3: Arya's calculated exam report. The system evaluates marks against our configurable grading scale rules: Math 92, Science 85, English 88, resulting in 265 out of 300, an 88.33% average, an overall Grade 'A', GPA 3.7, and a Passed status.*
  >
  > *Now under the Fee Ledger tab, we see Acceptance Test 5. Arya has a STEM Laboratory invoice with $200 outstanding. Let's click 'Pay Online (Simulated)'. I will pay $100 as a partial payment. Immediately, the transaction updates the invoice, generates a unique receipt number, updates the remaining balance to $100, and ensures the fee ledger balances mathematically."*

---

### [2:45 – 3:45] Admin View: Fee Reconciliation, Swagger API Docs & Audit Trail
- **Screen**: Browser.
- **Action**: Click **Admin (Dr. Vance)** in the top reviewer bar.
- **Voiceover**:
  > *"Finally, let's switch to the Administrator view to see the operational staff dashboard.*
  >
  > *Here on the Executive Dashboard, we have real-time KPI metrics, attendance rates, and our Automated Fee Ledger Integrity banner. Notice that total billed, settled payments, and outstanding balances reconcile with zero discrepancies.*
  >
  > *Reviewers can also inspect our interactive OpenAPI documentation at `/api-docs` powered by Swagger UI, listing all endpoints, schemas, and security definitions.*
  >
  > *Every action we just performed—logging in, recording attendance, and settling fees—is recorded in our immutable Audit Trail with timestamps, user IDs, and entity payloads."*

---

### [3:45 – 4:00] Conclusion
- **Voiceover**:
  > *"The codebase is structured as a maintainable modular monolith with clear separation of UI, controllers, domain services, and persistence. Thank you for reviewing my assessment, and I look forward to the live technical walkthrough and live debugging task."*
