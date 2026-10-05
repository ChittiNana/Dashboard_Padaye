# Backend Wiring Progress

Tracks the effort to replace mock data (`src/data/mockData.js`) in the React
frontend with real calls to the Spring Boot microservices in the sibling
`backend/` folder. Source of truth for scope/design decisions is the approved
plan at `C:\Users\SaikrishnaTallapally\.claude\plans\nifty-knitting-goose.md`
(if that file is gone, this document plus the code is authoritative).

**New to this project?** Read `docs/PROJECT_CONTEXT.md` first — it explains what
the whole application is, the frontend/backend architecture, roles, and the
working conventions this effort follows. Come back here afterward for status.

## Status: All 6 planned phases DONE, plus a post-Phase-6 cleanup fix. Next up: local stack setup and verification (see Pending) — the only remaining item.

## Completed

### Backend patches (Part A of the plan)
All applied directly to the `backend/` services:
- A1 — `people-service`: `GET /api/students/me`, `GET /api/staff/me` self-lookup endpoints.
- A2 — `attendance-service`: closes the "any STUDENT/PARENT can query any studentId" gap via a Feign call back to `people-service`'s `isSelfOrLinkedParent` check.
- A3 — `academics-service`: `GET /api/results` (school-wide, TEACHER/PRINCIPAL/HEADMASTER).
- A4 — `fee-service`: added `feeRecordId` to `FeeStatusResponse`.
- A5 — `reporting-service`: `getExamResultsReport()` now returns real `allResults` (depended on A3).
- A6 — `communication-service`: added `PUT /api/notices/{id}` and `DELETE /api/notices/{id}`.
- A7 — `academics-service`: `QuestionPaper` entity/DTOs extended with a `content` field for the structured editor.

### Frontend phases
- **Phase 1 — People & Classes**: `src/api/peopleApi.js`, `src/api/classesApi.js`. `AuthContext.jsx` now sources `allUsers`/`allStudents`/`allStaff`/`myChildren` from real APIs (role-gated — see below). `DataContext.jsx` sources `classes` from `classesApi`.
- **Phase 2 — Attendance**: `src/api/attendanceApi.js`. Attendance widgets in `AttendanceManagement.jsx`, `TeacherDashboard.jsx`, `StudentDashboard.jsx`, `ParentDashboard.jsx` all real.
- **Phase 3 — Academics**: `src/api/academicsApi.js`. `exams`/`homework`/`notes`/`results` in `DataContext.jsx` are real. `ExamManagement.jsx`, `HomeworkManagement.jsx`, `NotesManagement.jsx`, `QuestionPaperManagement.jsx` (uses A7's `content` field) rewired. Fixed two hardcoded bugs: `TeacherDashboard`'s timetable no longer hardcodes class `'10A'`; `StudentDashboard`'s "today" no longer hardcodes `'Monday'`.
- **Phase 4 — Fees** (just finished this session):
  - `src/api/feeApi.js` — `getStatusForStudent(studentId)`, `listFeeRecords()`, `payFee(body)`, `updateFeeRecord(id, body)`.
  - `src/context/DataContext.jsx` — `fees` state is now `feeApi`-backed (`FEES_VISIBLE_ROLES = ['principal','accountant']`, matching the backend's `GET /api/fees/records` role gate). Old mock mutators `addFeeRecord`/`markFeePaid`/`deleteFeeRecord` replaced with `payFee(d)` and `updateFeeRecord(id, d)` — no create/delete because the backend has no such endpoints for fee records (financial-record safety, matches the plan).
  - `src/components/Management/FeeManagement.jsx` — full rewrite off the real `FeeRecordResponse` shape (`id/studentId/academicYear/totalAmount/paidAmount/dueDate/status`). "Record Payment" gated to `accountant` only (backend `POST /api/fees/pay` excludes PRINCIPAL); "Edit" (`PUT /api/fees/{id}`) gated to `accountant`+`principal`. No create form, no delete action.
  - `src/components/Parent/ParentDashboard.jsx` — `Dashboard()`'s fee-due stat now comes from `feeApi.getStatusForStudent(child.id)` instead of the mock array. `FeeStatus()` component fully rewritten: the real API returns one current-status record per student (not a per-term history list, which the backend has no endpoint for), so the UI is now a single status card (Total/Paid/Pending + status badge) with a **working** "Pay Now" flow (amount/method/reference inputs → `feeApi.payFee({ feeRecordId: feeStatus.feeRecordId, ... })`, since PARENT is authorized to call that endpoint).
  - `src/components/Principal/PrincipalDashboard.jsx` — fixed a latent bug where `Dashboard()`'s `totalPaid` stat used the old mock fields `f.paid`/`f.amount` (would have silently shown ₹0k forever against real data); now uses `f.paidAmount`.
  - Verified no fee tab/widget exists for `student` or `headmaster` roles (checked `Sidebar.jsx` nav config and grepped `StudentDashboard.jsx`) — correctly out of scope, no changes needed there.
  - ESLint run clean on all Phase 4 files (one pre-existing, unrelated warning noted below, fixed in Phase 5).
- **Phase 5 — Communication** (just finished this session):
  - `src/api/communicationApi.js` — `listNotices()`, `createNotice(body)`, `updateNotice(id, body)`, `deleteNotice(id)` (backed by A6).
  - `src/context/DataContext.jsx` — `announcements` state is now `communicationApi`-backed. Loader gates only on "any authenticated user" (no role restriction — matches `NoticeService.getVisibleNotices` doing server-side audience filtering already). `addAnnouncement`/`updateAnnouncement`/`deleteAnnouncement` call the real endpoints.
  - `src/components/Management/NoticeManagement.jsx` — full rewrite off the real `Notice` shape (`title/body/audienceRole/createdAt/postedByUserId`). Audience picker now uses the real backend `Role` enum values. Dropped the mock's `priority` field/badge (no backend column). `postedByUserId` resolved to a display name via `allUsers` (from `AuthContext`) with a graceful `'Admin'` fallback. Real async submit/edit/delete with error display matching the established `alert alert-danger` convention (confirmed from `FeeManagement.jsx`).
  - Display-widget updates (drop `priority`, drop client-side `.filter(a => a.audience === ...)` since the backend already filters, fix date field to `createdAt`, fix `postedBy` lookup): `PrincipalDashboard.jsx`, `HeadmasterDashboard.jsx`, `ParentDashboard.jsx` (both the `Dashboard()` widget and the standalone `Notices()` view), `StudentDashboard.jsx` (same two call sites), `StaffPortal.jsx` (both `Dashboard()` and `NoticesView()`), `Navbar.jsx` (notification dropdown, "unread" redefined as simple notice count since there's no read/unread concept on the backend entity).
  - `GuestHome.jsx` — removed the guest-facing "notices" tab entirely: `GET /api/notices` requires authentication, which a pre-login guest screen structurally can't have.
  - `TeacherDashboard.jsx` — verified via grep to have zero announcement-related code; no changes needed.
  - Also fixed the pre-existing `no-unused-vars` warning in `ParentDashboard.jsx` (dead `unread` variable, see below) while touching the file for this phase.
  - ESLint run clean on all 10 touched files: 0 errors, 0 warnings.
- **Phase 6 — Reporting** (just finished this session):
  - `src/api/reportingApi.js` — `getAttendanceReport()`, `getExamResultsReport()`, `getFeeCollectionReport()`, `getStaffPerformanceReport()`, `getReportCard(studentId)`, `getAnalytics()`. No `DataContext.jsx` slice — pure read-only aggregation consumed directly by dashboard components, per the plan.
  - `src/components/Principal/PrincipalDashboard.jsx`:
    - `Dashboard()`: fixed a mock leftover (`schoolInfo.totalStaff` → real `allStaff.length`); removed fabricated trend-hint strings on stat cards ("↑ 48 from last year" etc.) that had no backing data anywhere in the backend.
    - `Reports()`: full rewrite from 6 static inert cards into a working report generator. Scoped to the 4 reporting-service endpoints PRINCIPAL actually has role-access to (attendance, exam-results, fee-collection, staff-performance); dropped "Academic Performance"/"Topper's Report" cards since they had no distinct backend endpoint beyond what exam-results already covers. Click "Generate Report" → fetch → inline expanding results card with per-report-type stat breakdowns, loading/error states matching the established `alert alert-danger` convention.
    - `Analytics()`: added a real `reportingApi.getAnalytics()`-backed "School Attendance" stat card. Left the existing pass-rate/distinction/subject-avg/grade-distribution calculations untouched — those are legitimate client-side aggregations over real (Phase-3-wired) `results` context data, not mock data.
  - `src/components/Headmaster/HeadmasterDashboard.jsx`:
    - `Reports()`: full rewrite from 4 static inert cards (one of which, "Homework Report", had no backend equivalent and was dropped) into the same generate-and-view pattern as Principal's, but deliberately scoped to only the 3 endpoints HEADMASTER has role-access to (attendance, exam-results, staff-performance — excluding fee-collection and analytics, which the backend's `@PreAuthorize` denies to headmaster).
  - ESLint run clean across the whole `src` tree (not just touched files): 0 errors, 0 warnings.

## Known pre-existing issues
- ~~`src/components/Parent/ParentDashboard.jsx` line ~34: dead `unread` variable~~ — fixed in Phase 5 (removed; `messages` import still used elsewhere in the file).
- ~~`src/components/Parent/ParentDashboard.jsx` line 6: still imported `results`, `homework`, `exams` from `mockData.js`~~ — fixed post-Phase-6 (see below). None remaining.

## Post-Phase-6 cleanup: `ParentDashboard.jsx` mock-data fix
Discovered while scoping Phase 6 (not part of Phase 6 itself): `ParentDashboard.jsx` still imported `results`/`homework`/`exams` from `mockData.js` instead of real data, contradicting the Phase 3 completion note above (which correctly wired `DataContext.jsx` itself, but this component never switched over). Fixed this session:
- `results` — PARENT is not in `DataContext`'s `RESULTS_VISIBLE_ROLES` (backend `GET /api/results` is TEACHER/PRINCIPAL/HEADMASTER only), so results are fetched directly via `academicsApi.getResultsByStudent(child.id)` (`GET /api/results/student/{id}`, which PARENT *is* allowed to call) — mirrors `StudentDashboard.jsx`'s identical pattern for its own results. Added local `myResults` state + effect in both `Dashboard()` and `ExamResults()`.
- `homework` — PARENT *is* in `HOMEWORK_VISIBLE_ROLES`, so this now reads from `useData().homework`, filtered by the real `h.classId` (numeric FK) instead of the mock's `h.class` (string name). The mock's submission-status concept (`pending`/`submitted`/`graded`) has no backend field (`HomeworkResponse` has no `status`), so the "Pending HW" stat was redefined as "not yet due" (`h.dueDate >= todayISO()`) and the status badges were dropped from both the `Dashboard()` widget and `HomeworkView()`. Also dropped `assignedDate`/`assignedBy`/`grade` displays — none of those fields exist on the real DTO.
- `exams` — PARENT has **no** backend access at all to `GET /api/exams` (role-gated to STUDENT/TEACHER/PRINCIPAL/HEADMASTER). This means: (a) the exam-name/date lookup previously shown next to each result had no legitimate data source and was dropped from both `Dashboard()`'s and `ExamResults()`'s results tables (along with the `Remarks` column — no `remarks` field on the real `ResultResponse` either); (b) `AcademicCalendar()`'s entire "Upcoming Exams" card was removed outright (not remapped) since there is no way for a PARENT to legitimately fetch that data — the card now shows only the holidays table, matching the established "drop UI with no backend equivalent" convention (same reasoning as `GuestHome.jsx`'s notices-tab removal in Phase 5).
- ESLint run clean on the file and across the whole `src` tree: 0 errors, 0 warnings.

## Pending

- **Local stack setup and verification** (not started at all, in any phase): nothing in this whole effort has been runtime-tested against a live backend yet — only statically verified via ESLint. Needs, once per session: bring up Postgres via `backend/docker-compose.yml`, then `eureka-server` → `config-server` → each domain service → `api-gateway` (all via `mvnw spring-boot:run` from `backend/`), point the frontend at the gateway (`.env.development` → `REACT_APP_API_BASE_URL=http://localhost:8080`), `npm start`, and manually exercise each phase's flows end-to-end (see the plan file's per-phase "Verify" sections for exact steps, e.g. testing that a STUDENT gets 403 on another student's attendance, that fee status transitions PENDING→PARTIAL→PAID, etc).

## How to resume
1. All 6 planned phases plus the post-Phase-6 `ParentDashboard.jsx` cleanup are code-complete and ESLint-clean. The plan file (`C:\Users\SaikrishnaTallapally\.claude\plans\nifty-knitting-goose.md`) is fully executed — nothing left in its own scope.
2. The only remaining item is local stack setup and verification (see Pending) — nothing in this whole effort has been runtime-tested against a live backend. Start there: bring up the backend stack per the steps above, then work through each phase's plan-file "Verify" section against the real running app.
