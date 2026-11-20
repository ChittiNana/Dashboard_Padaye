# UI Bug Fix & Feature Request Batch — Progress

Tracks a batch of 19 UI issues reported against the live app (bugs + feature requests), from a
one-line wiring fix up to a from-scratch online-exam engine. Source of truth for scope/design
decisions is the approved plan at
`C:\Users\SaikrishnaTallapally\.claude\plans\buzzing-prancing-beacon.md` (if that file is gone,
this document plus the code is authoritative).

**New to this effort?** Read `docs/PROJECT_CONTEXT.md` first (overall app/architecture), then
`docs/PROGRESS.md` (the prior "mock data → real backend" effort, now superseded in spirit by the
localStorage mock-fallback layer — see below). Come back here for this batch's status.

## Working model (applies to every item below)

The backend isn't actually running for this effort. Every fix/feature is built as if the real
backend endpoint already exists: frontend calls the real API first via a `*Api.js` module, falls
back to the localStorage mock store (`src/data/mockStore.js` + `src/api/mockFallback.js`) on
failure — the same pattern already established by the "Add a localStorage-backed mock data
layer" commit. Where a backend endpoint/field doesn't exist yet, the frontend call is written
anyway (it will fail against a live backend today and silently use the mock fallback), and the
exact requirement is recorded in the sibling backend repo's
`backend/docs/FRONTEND_REQUESTED_CHANGES.md` — no Java code is changed as part of this batch.

## Status: ALL 19 ITEMS DONE (Phases 0–5). `npm run build` and a full `npx eslint src` pass are
both clean. The app was smoke-tested via `npm start` (compiles, serves on :3000, no console
errors at boot) and then stopped — no further manual click-through verification has been done in
a real browser (no browser-automation tool was available in this session; the user explicitly
chose compile/serve verification only, not a full click-through). **Recommended next step for
whoever picks this up: manually click through each flow below once, in a real browser, especially
the two biggest/newest ones (timetable approval workflow, online exams) before considering this
batch fully verified.**

## Phase 1 — Pure bug fixes (no backend requirement) — DONE
| # | Issue | Status | Where |
|---|---|---|---|
| 1 | New Headmaster not showing in Staff tab | Done | `AuthContext.jsx` `registerUser` now also inserts a `staff`/`students` record and optimistically updates `allStaff`/`allStudents`; `peopleApi.createStaff` added (new, backend TODO logged); `peopleApi.createStudent` already existed, now actually called |
| 19 | New Teacher/Student not showing in Staff/Student tabs | Done | Same fix as #1 |
| 13 | Uploaded notes don't appear in "my uploads" | Done | `NotesManagement.jsx` — `addNote` call now sets `uploadedByStaffId` |
| 14 | New assignments don't appear in "my uploads" | Done | `HomeworkManagement.jsx` — `addHomework` call now sets `createdByStaffId` |
| 8 | Teacher "Take Attendance" button is a dead stub | Done | `TeacherDashboard.jsx` `MyClasses` wires the button to the `attendance` tab, pre-selecting that class; `AttendanceManagement`/`MarkAttendance` accept `initialClassId` |
| 9 | Teacher "View Students" button is a dead stub | Done | `TeacherDashboard.jsx` — new `RosterModal` shows `allStudents` filtered by class |
| 15 | Messages badge hardcoded (not real unread count) | Done | `Sidebar.jsx` now computes a real unread count from `messages` for the `messages` nav item, every role |

**Backend TODO logged this phase**: `peopleApi.createStaff` → `POST /api/staff` doesn't exist yet
server-side (DTO `CreateStaffRequest` exists, no controller endpoint uses it) — see
`backend/docs/FRONTEND_REQUESTED_CHANGES.md`.

## Phase 2 — Frontend-only UI builds (no backend requirement) — DONE
| # | Issue | Status | Where |
|---|---|---|---|
| 2 | Teacher messages: snippet-only, no sent/received distinction | Done | `TeacherDashboard.jsx` — new `MessageRow` (click to expand full body), chat-style alignment/color + "Sent"/"Received" badge replaces the `"→ "` prefix, in both `MessagesView` and the `Dashboard()` widget |
| 12 | No interactive calendar for any role | Done | New reusable `src/components/Shared/EventCalendar.jsx` (month grid, click a day to see that day's events, past or future) — mounted alongside the existing flat list in every role's holiday/calendar view: `HolidayManagement.jsx` (Principal/Headmaster), `ParentDashboard.jsx`'s `AcademicCalendar`, `TeacherDashboard.jsx`'s `HolidayView`, `StudentDashboard.jsx`'s `HolidayList`, `GuestHome.jsx`, `StaffPortal.jsx`'s `HolidaysView` |

## Phase 3 — Needs a backend requirement, frontend simulates now — DONE
| # | Issue | Status | Where |
|---|---|---|---|
| 16 | Teacher subject/specialization not shown | Done | `AuthContext.jsx` (`loadPeople` self-patch now carries `subject`), `TeacherDashboard.jsx` header, `PrincipalDashboard.jsx`'s `StaffManagement` table, `Registration.jsx` (new conditional "Teaching Details" section for role TEACHER) |
| 4 | No payment history view | Done | New mock `payments` table + `applyPayFee` now also inserts a payment row + `derivePaymentHistory`; `feeApi.getPaymentHistory`; "History" panel in `FeeManagement.jsx`, "Payment History" card in `ParentDashboard.jsx`'s `FeeStatus` |
| 7 | No fee-per-class/section setup | Done | `feeAmount` field added to `classes` (mock seed + `addClass`/`updateClass`), form field + "Class Fee" card in `ClassManagement.jsx`, referenced as a column in `FeeManagement.jsx`. **Scope boundary**: no auto-generation of a new `FeeRecord` from this — backend has no create-fee-record endpoint at all |
| 11 | Timetable builder UI | Done | New `TimetableManagement.jsx` (`TimetableEditor` for Headmaster) — replaces the old read-only `TimetableView` in `HeadmasterDashboard.jsx` |
| 18 | Headmaster drafts timetable, Principal approves | Done | Same file's `TimetableApprovals` (Principal) — new mock `status` field (`draft`/`pending_approval`/`approved`) on `timetableSlots`, new Principal nav tab "Timetable Approvals". Student/Teacher read views (`deriveClassTimetable`/`deriveTeacherTimetable`) now filter to `approved` only — no changes needed in those components, the filter lives in the shared derive helpers |

**Backend TODO logged this phase**: `people-service` (Staff.subject, Staff/Student.address),
`fee-service` (payment-history endpoint — cheap, schema already there; SchoolClass.feeAmount),
`class-timetable-service` (status/submittedAt/approvedBy fields on TimetableSlot; PUT/DELETE on
a slot; submit/approve/reject endpoints; pending-approval list endpoint) — see
`backend/docs/FRONTEND_REQUESTED_CHANGES.md`.

## Phase 4 — Design-decision items, new mock tables — DONE
| # | Issue | Status | Where |
|---|---|---|---|
| 6 | Notify parent re: pending fees | Done | New mock `notifications` table + `applyCreateNotification`/`deriveNotificationsForUser`, `src/api/notificationsApi.js`, "Notify Parent" action in `FeeManagement.jsx`, `Navbar.jsx`'s notification dropdown now merges personal notifications with notices |
| 5 | Group notifications to custom role subsets | Done | `NoticeManagement.jsx` — single `audienceRole` select replaced with a multi-select checkbox list, stored as `audienceRoles: string[]` (empty = everyone, same convention as before); mock seed notices migrated to the new shape |
| 3 | Richer Student/Staff profiles + auto parent-account creation | Done | `Registration.jsx` — added phone/address (all roles), a full "Student Details" section (class/section, DOB, gender, guardian) and an "Also create a Parent login" toggle that registers the parent first then links it via `parentUserId` on the same submit |

**Bug found and fixed while building #3**: the Phase 1 `registerUser` fix inserted new `staff`/
`students` records with a freshly-generated mock id instead of reusing the new `users` record's
id — this matches the seed data's convention (`students[].id === users[].id`) that
`AuthContext.loadPeople`'s self-lookup (`getById('students', user.id)`) depends on. Without this,
a newly registered person's own next login would silently fail to load their own
staffId/classId/etc. Fixed by passing `id: user.id` explicitly into the `insertRecord` calls.

**Backend TODO logged this phase**: `people-service` (Staff/Student.address,
`POST /api/parents/{id}/link`), `communication-service` (Notification write path,
`Notice.audienceRole` → `audienceRoles` list) — see `backend/docs/FRONTEND_REQUESTED_CHANGES.md`.

## Phase 5 — Online Exams (largest item) — DONE
| # | Issue | Status | Where |
|---|---|---|---|
| 10 | Online exams: create, assign, take, auto-grade, results everywhere | Done | New mock table `examAttempts` + `applyStartAttempt`/`applySubmitAttempt` (the actual grading engine) in `mockStore.js`; `academicsApi.js` gained `startExamAttempt`/`submitExamAttempt`/`getMyAttempt`; `QuestionPaperManagement.jsx`'s `PaperEditor` gained a Delivery Mode toggle (Worksheet/Online) + open/close datetime fields, restricted to the 4 auto-gradable question types when Online, requires `examId` when Online; new student-facing `src/components/Exams/TakeExam.jsx` (list assigned online exams → answer per question type → submit → immediate score); new Sidebar "Take Exam" entry under Student's Exams section. **No new Results UI was built anywhere** — auto-graded submissions insert into the same `results` table via the same shape manual entry uses, so they show up automatically in every role's existing (already correctly-scoped) Results view. |
| 17 | Teacher can only generate results for their own subject | Done | `QuestionPaperManagement.jsx`'s `PaperEditor` locks the Subject field to `currentUser.subject` for TEACHER role (ties to #16) |

**Scope boundary (flagged in the plan, holding)**: online delivery supports only MCQ, True/False,
Fill in the Blanks, and Match the Following (Shuffled) — plain `MatchFollowing` and free-text
`Short`/`Long` remain worksheet/print-only, since auto-grading those needs a human reviewer step
that wasn't built.

**Security gap found and documented (not fixed — backend-only)**: `GET /api/results/student/{id}`
has no server-side ownership check today; only frontend discipline prevents a student/parent from
querying another student's results. Documented using the exact precedent the original effort
already set in attendance-service (patch A2).

**Backend TODO logged this phase**: `academics-service` (new `ExamAttempt` entity + 3 endpoints,
subject-ownership hardening on result/paper creation, result-ownership hardening) — see
`backend/docs/FRONTEND_REQUESTED_CHANGES.md`.

## Follow-up (beyond the original 19 items): configurable Subjects/Classes
Requested after the batch above shipped: remove hardcoded "static setup" data (Subjects was
duplicated across 5 files with no single source of truth) in favor of a config file + real-API-
first pattern, consistent with everything else in this app.
- New `src/config/schoolConfig.js` — hand-editable `defaultSubjects` and `defaultClasses`, used
  only as the one-time mock-store seed.
- New `src/api/configApi.js` (`listSubjects`/`createSubject`/`deleteSubject`) + a `subjects` slice
  in `DataContext.jsx` (visible to any signed-in role, no role gate — it's just dropdown data).
- New Principal-only `src/components/Management/SubjectManagement.jsx` screen (add/delete
  subjects at runtime) — new Sidebar nav entry "Subjects" under Principal's Management section.
- All 5 previously-hardcoded `SUBJECTS` arrays (`NotesManagement.jsx`, `HomeworkManagement.jsx`,
  `ExamManagement.jsx`, `QuestionPaperManagement.jsx`, `Registration.jsx`) now read from
  `useData().subjects` instead — also fixed a small pre-existing inconsistency where
  `QuestionPaperManagement.jsx`'s list had "Hindi" and the other four didn't.
- Classes/Sections did **not** get a parallel new API — they already have a full real CRUD path
  (`classesApi.js` + `ClassManagement.jsx`); only the mock seed's hardcoded array moved into the
  same config file, since that's genuinely just a one-time seed value, not a second source of truth.
- Backend TODO logged: new `Subject` entity + 3 endpoints (see
  `backend/docs/FRONTEND_REQUESTED_CHANGES.md`).
- Verified via `npx eslint src` (clean) and `npm run build` (compiles) — same as every other
  phase; no new browser click-through was done for this follow-up either.

## Follow-up #2: school identity config + 2 bugs found while testing the above
Reported after trying the Subjects/Classes config feature:
1. **School name/address/etc. should be configurable too** — moved `schoolInfo` (name, address,
   phone, email, website, affiliation, motto, principalName, + pre-login marketing totals) out of
   the dead `mockData.js` file into `defaultSchoolInfo` in `src/config/schoolConfig.js`, with the
   same real-API-first (`configApi.getSchoolInfo`) / local-fallback pattern as Subjects. New
   `schoolInfo` slice in `DataContext.jsx` (no auth gate — needed on the pre-login Login/Guest
   screens too). All 5 consumers (`Login.jsx`, `GuestHome.jsx`, `StaffPortal.jsx`,
   `QuestionPaperManagement.jsx`'s print header, `PrincipalDashboard.jsx`) now read it from there.
   `src/data/mockData.js` — the original, fully-superseded hardcoded dataset — had zero remaining
   imports anywhere once this moved, so the whole file was deleted (still in git history if ever
   needed).
2. **Bug: "floating boxes at the top of every Dashboard don't respond to clicks"** — root cause:
   `index.css`'s `.stat-card:hover` lift/shadow effect applied globally to every stat card in the
   app, but only 2 stat-cards anywhere (the report-type pickers in Principal/Headmaster's
   Reports() screens) are actually clickable. Fixed by scoping the hover effect to a new
   `.clickable` modifier class, applied only to those 2 (which also gained a real `onClick` they
   were missing — previously only the inner "Generate Report" button worked, not the whole card).
   Every other stat-card in the app (there are many, across every role's main Dashboard) now
   correctly looks non-interactive.
3. **Bug: "I configured 10 classes but only see 7"** — root cause: the mock data layer persists
   to `localStorage` for 24h (`MOCK_STORE_TTL_MS`) and had no concept of "the config file
   changed" — editing `schoolConfig.js` had no effect until the cache happened to expire.
   Fixed in `mockStore.js`: a `CONFIG_FINGERPRINT` (the config content itself) is now stored
   alongside the cached seed; on load, a mismatch forces an immediate reseed regardless of the
   24h TTL. This was a real architectural gap in the "configuration, read before load" promise,
   not a one-off — it will self-heal on next load for any future config edit too, no manual
   `localStorage.clear()` needed.
- Verified via `npx eslint src` (clean) and `npm start` (compiles, serves, stopped/restarted
  cleanly). No new browser click-through was done.

## Follow-up #3: email auto-fill from configured school name
`Registration.jsx` is the only form in the app with an email field (2 of them — the main user
being registered, and the optional linked parent account). Both now auto-fill as the matching
Username field is typed: `schoolEmailDomain(schoolInfo.name)` (new helper in
`schoolConfig.js`) derives a domain from the school name's first word (e.g. "Meridian
International School" → "meridian.com"; the current default "Greenwood Public School" →
"greenwood.com"), and `username` → `username@domain` populates the Email field live. Editing
Email directly stops the auto-fill for that field (tracked per-field via `emailAuto`/
`parentEmailAuto` state) so a manual override is never clobbered; resets back to auto-fill mode
when the form is cleared/reopened. Verified via `npx eslint src` (clean) and `npm run build`
(compiles). No new browser click-through was done.

## Follow-up #4: School Settings screen + Add Fee Record action
Reported: (1) school identity details (name/address/principal name/etc.) were only editable by
hand-opening `schoolConfig.js` — unlike Subjects/Classes, there was no actual admin screen; (2)
asked how Accountant records a newly-received fee payment — confirmed the existing "Record
Payment" button already covers paying against an *existing* fee record, but there was no way to
create a brand-new one for a student who doesn't have one yet (e.g. a new admission) — a gap
that was previously a deliberate "financial-record safety" decision, now explicitly confirmed as
needed and built:
- **School Settings** (new, Principal-only, new Sidebar entry): `src/components/Management/SchoolSettings.jsx`
  — edits every `schoolInfo` field through a form instead of hand-editing the config file.
  Persisted via a new `updateSchoolInfo` mutator in `DataContext.jsx` → `configApi.updateSchoolInfo`
  (real-API-first) → mock fallback `applyUpdateSchoolInfo` in `mockStore.js`, which now stores
  `schoolInfo` as a singleton inside the mock store (seeded from `defaultSchoolInfo`) so edits
  persist across reloads instead of always re-reading the static config default.
- **Add Fee Record** (new, Accountant/Principal, in `FeeManagement.jsx`): a "+ Add Fee Record"
  button opens a form (student picker excludes students who already have a record for the chosen
  academic year; total amount pre-fills from the student's class fee amount configured in Class
  Management). New `addFeeRecord` mutator in `DataContext.jsx` → `feeApi.createFeeRecord` → mock
  `insertRecord('fees', ...)`.
- Backend TODO logged: `PUT /api/config/school`, `POST /api/fees/records` — see
  `backend/docs/FRONTEND_REQUESTED_CHANGES.md`.
- Verified via `npx eslint src` (clean) and `npm run build` (compiles). No new browser
  click-through was done.

## Follow-up #5: configurable ID format, Fee Record bug fix, bulk student roster from an editable file
Three asks in one message:
1. **Teacher/Student IDs should be a configurable prefix + increasing number.** Added
   `defaultIdFormat` to `schoolConfig.js` (`staffPrefix`/`studentPrefix`/pad length/start number —
   defaults `EMP`/`ADM`, 4-digit padding, starting at 100). New `nextStaffCode()`/
   `nextAdmissionNumber()` in `mockStore.js` maintain a persisted incrementing counter; wired into
   `AuthContext.jsx`'s `registerUser`, replacing the old `EMP${last-6-digits-of-a-random-id}` /
   `ADM${year}${last-4-digits}` generation. Only affects *newly* registered people — existing
   seeded demo accounts keep their original codes.
2. **Bug: "Add Fee Record" showed no student / no amount.** Root cause: `AuthContext.jsx`'s
   `allStudents` was only loaded for `principal`/`headmaster`/`teacher` — `accountant` (who is
   exactly who uses this feature) always got an empty array, so the student picker had nothing to
   show and the class-fee amount lookup had nothing to look up. Added `'accountant'` to that role
   list. (This also means the main Fee Records table now shows real student names/avatars for
   Accountant too, instead of a `Student #6` fallback — same root cause, same fix.)
3. **Bulk student roster loaded from an editable file, not hardcoded in the app.** 1000 students
   (100 per grade, grades 1–10) split across sections A/B in a varied ratio per grade (50/50 up
   to 65/35 — see `scripts/generateStudentsCsv.js` for the exact per-grade split and to regenerate
   with different numbers). Lives at `public/students.csv` — a plain CSV, opens directly in
   Excel, no app code to touch to change it. `src/data/mockStore.js`'s new
   `preloadBulkStudentsFromCsv()` fetches and parses it, mapping each row's grade+section to the
   matching class (from the same `defaultClasses` config) and inserting matching `users`+`students`
   rows (username = lowercased admission number, password `student123` for all — a shared demo
   default, not meant to be realistic auth). Bulk rows live in a reserved id range (1000+) so they
   never collide with the small original demo roster or with anyone registered through the app
   (who always get non-numeric ids) — on every app boot the bulk range is fully replaced from
   whatever the CSV currently says, so **edit the CSV, save, refresh the browser** to see changes,
   same pattern as every other config file in this project. This preload is awaited once in
   `src/index.js` *before* the app renders, specifically so no component ever sees a half-loaded
   roster that then changes under it.
   - **Known limitation**: no `parentUserId` is set for bulk-generated students (guardian
     name/phone are plain text columns, not linked parent accounts) — scoped out to keep this
     bounded; flagged in case linked parent logins for the bulk roster are wanted later.
- Verified via `npx eslint src` (clean), `npm run build` (compiles), and `npm start` (compiles,
  serves `/` and `/students.csv` both confirmed via `curl`, server stopped/restarted cleanly). No
  new browser click-through was done.

## Follow-up #6: fixed a crash — "Cannot read properties of undefined (reading 'toLocaleString')" in GuestHome
Root cause was systemic, not GuestHome-specific: `mockStore.js`'s localStorage cache is only
invalidated when `defaultSubjects`/`defaultClasses` content changes (`CONFIG_FINGERPRINT`) — it
never accounted for `buildSeed()`'s *shape* changing (a whole new table/field being added across
several of this session's earlier edits — `schoolInfo`, `counters`, etc.). A browser that had
already cached a store from before one of those additions kept that stale shape for up to 24h,
so `schoolInfo` came back as `undefined` and every reader crashed on it (`GuestHome` was just the
first one hit). Fixed two ways:
1. Added a `SCHEMA_VERSION` constant to `mockStore.js` (bumped now) included in the fingerprint,
   plus `defaultSchoolInfo`/`defaultIdFormat` (previously missing from it too) — so both a schema
   shape change *and* an edit to either of those config objects now force an immediate reseed,
   not just Subjects/Classes edits. **This needs bumping by hand whenever `buildSeed()`'s shape
   changes again** — flagged with a comment at the constant.
2. Defense in depth: `deriveSchoolInfo()`/`applyUpdateSchoolInfo()` now merge with
   `defaultSchoolInfo` first, so even if a future shape change forgets to bump
   `SCHEMA_VERSION`, missing fields degrade to defaults instead of crashing every reader.
- Verified via `npx eslint src` (clean), `npm run build` (compiles), `npm start` (serves,
  restarted). The fix forces a one-time reseed on next load for anyone with a stale cached store
  — no manual `localStorage.clear()` needed.

## Follow-up #7: login screen icons + gender/profile-photo on registration & login preview
Two of three asks in this message were clear and built; the third ("Remote Portal Access Guide")
was ambiguous enough to ask about rather than guess — see the question posed back to the user.
1. **Login screen stat icons.** The Students/Staff/Classes numbers on the login screen had no
   icons at all (the only icon on the whole page was the school's own brand icon at the top) —
   added matching icons (👩‍🎓/👔/🏫, same convention `GuestHome.jsx` already uses) via a new
   `.login-stat-icon` CSS class.
2. **Gender + profile photo, collected at registration, defaulted by gender, previewed at
   login.** New shared `src/utils/avatar.js` (`genderAvatarEmoji`, `fileToDataUrl`) and
   `src/components/Shared/ProfileAvatar.jsx` (renders an uploaded photo if present, else a
   gender-matched emoji default, inside the same circular `.avatar` styling used everywhere
   else). `Registration.jsx`: Gender moved out of the Student-only section into the common Basic
   Information section (now asked for every role, not just students) and the same for the
   optional linked-parent sub-form; added a Profile Photo file upload + live preview to both.
   `registerUser` in `AuthContext.jsx` now stores `gender`/`profileImage` directly on the `users`
   record. `Login.jsx` looks up the typed username against the mock `users` table (mock-only by
   design — purely cosmetic, no real endpoint to invent for "look up a photo before
   authenticating") and shows that person's `ProfileAvatar` once it matches. Seeded demo
   users and the 1000-row bulk CSV roster both got `gender` added too, so the feature is visible
   immediately without registering a new test account first (bulk roster has no photos, so it
   always shows the gender-default emoji — expected).
- Verified via `npx eslint src` (clean), `npm run build` (compiles), `npm start` (serves,
  restarted). No new browser click-through was done.

## Verification done this session
- `npx eslint src` (whole project): clean, 0 errors/warnings, after every phase and again at the end.
- `npm run build`: compiles successfully.
- `npm start`: compiles successfully, serves on `:3000`, server stopped cleanly afterward.
- **Not done**: manual click-through in a real browser (no browser-automation tool was available
  in-session; user explicitly scoped verification to compile/serve checks only for this pass).

## How to resume
All 19 items are code-complete, ESLint-clean, and build-clean. Nothing in this batch's own scope
is left to do. If you're picking this up next:
1. **Do the manual click-through verification that wasn't done this session** (see "Verification
   done this session" above) — a real browser, every seeded role, working through each item's
   flow. This is the single most valuable next step; everything so far is only compile/lint-level
   checked, not behavior-verified by eyes-on-screen.
2. If bugs turn up during that pass, the plan file
   (`C:\Users\SaikrishnaTallapally\.claude\plans\buzzing-prancing-beacon.md`) has full design
   detail per item (exact field names, mock table shapes, scope boundaries that were deliberately
   drawn) to help tell "working as designed" apart from "actually broken."
3. `backend/docs/FRONTEND_REQUESTED_CHANGES.md` is the complete, final integration checklist for
   whoever picks up real backend work — every entry in it maps to a specific item/phase here.
