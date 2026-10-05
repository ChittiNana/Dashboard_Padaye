# Dashboard Padaye — Project Context (read this first)

This file exists so a new Claude Code session (or any developer) with **zero prior
conversation history** can understand what this project is, how it's structured, and how to
safely continue work on it. Pair this with `docs/PROGRESS.md`, which tracks exactly what's
done/pending for the current effort (replacing mock data with real backend calls).

If both files exist, read them in this order: `PROJECT_CONTEXT.md` (this file, "what is this and
how does it work") → `PROGRESS.md` ("what's the current task's status").

## What this is

"Dashboard Padaye" is a school management system: a React frontend (this repo) talking to a Java
Spring Boot microservices backend (sibling folder `../backend` relative to this repo, i.e.
`C:\Users\SaikrishnaTallapally\Personal\Codemie\Dashboard_Padaye\backend`). It covers the full
lifecycle of running a school — people/roles, classes/timetables, attendance, academics
(homework/notes/exams/question papers/results), fees, communication (notices/messages), and
cross-service reporting.

There are two git repos side by side under `Dashboard_Padaye/`:
- `Dashboard_Padaye/` (this repo) — the React frontend. Branch `feature/v02`.
- `backend/` — the Spring Boot microservices. Check its own git status/branch separately; it is
  a **separate repository**, not a subfolder of this one.

## Frontend architecture (this repo)

- React 19 + Create React App (`react-scripts`), plain JS/JSX (no TypeScript), `react-router-dom`.
- `package.json` name is `school-mgmt`. Standard CRA scripts: `npm start`, `npm run build`, `npm test`.
- Entry point `src/App.js`. Two React contexts drive almost everything:
  - `src/context/AuthContext.jsx` — current user, JWT handling, and role-scoped directory data
    (`allUsers`, `allStudents`, `allStaff`, `myChildren`). `currentUser.role` is always
    lowercase-normalized (backend roles are UPPERCASE enums — see below).
  - `src/context/DataContext.jsx` — domain data (`classes`, `exams`, `homework`, `notes`,
    `results`, `fees`, `announcements`, `holidays`, ...) plus the mutator functions
    (`addClass`, `payFee`, `addAnnouncement`, etc.) that components call. Each data slice follows
    the same pattern: a `*_VISIBLE_ROLES` array, a `useCallback` loader gated on
    `currentUser.role`, fired via `useEffect`, storing `[]` on a non-matching role or a failed
    fetch. **Reuse this pattern for any new slice.**
- `src/api/` — one thin module per backend service (`peopleApi.js`, `classesApi.js`,
  `attendanceApi.js`, `academicsApi.js`, `feeApi.js`, `usersApi.js`, `authApi.js`, ...), each just
  a set of one-or-two-line functions calling `apiFetch` from `src/api/client.js`. **Never call
  `fetch` directly from a component** — always go through an `*Api.js` module.
  - `client.js`'s `apiFetch(path, { method, body, skipAuth, retry })` is the single choke point:
    JSON-encodes `body` automatically, does one silent refresh+retry on a 401, and throws
    `ApiError` (`.message`/`.status`/`.body`) or `AuthError` on failure.
  - `tokenStorage.js` exposes `decodeToken()` → `{ userId, username, roles, exp }` from the JWT.
- `src/data/mockData.js` — the **original**, fully-mocked dataset the app shipped with. This is
  being phased out slice by slice (see `PROGRESS.md`) as each domain gets wired to a real
  backend service. Treat any component still importing directly from `mockData.js` as **not yet
  migrated** — that is the signal for "what's left to do," more reliable than any prose summary.
- `src/components/` — organized by role-specific dashboard (`Principal/`, `Headmaster/`,
  `Teacher/`, `Student/`, `Parent/`, `Staff/`, `Guest/`), plus shared admin screens under
  `Management/` (`ClassManagement`, `AttendanceManagement`, `ExamManagement`, `FeeManagement`,
  `HomeworkManagement`, `NotesManagement`, `NoticeManagement`, `HolidayManagement`) and layout
  chrome under `Layout/` (`Navbar`, `Sidebar`, `Layout`). Each role's dashboard is a single file
  exporting a root component that switches on an `activeTab` prop to render one of several
  internal view functions (e.g. `PrincipalDashboard.jsx` has `Dashboard`, `StaffManagement`,
  `AllStudents`, `Reports`, `Analytics`, `Messages` all in one file, selected via a `views` map at
  the bottom). This is the established convention — don't split them into separate files unless
  asked.
- Established coding pattern for any async list+mutate screen (see `Registration.jsx` as the
  original reference, or the now-migrated `FeeManagement.jsx`/`ExamManagement.jsx` for a second
  example): `useState([])` + `listLoading`/`listError` + a `useCallback` loader fired from
  `useEffect`, and a submit path with `submitting`/`submitError`/`successMsg` local state.

## Roles

Backend enum (`backend/common-security/.../Role.java`): `IT_MANAGER, PRINCIPAL, HEADMASTER,
TEACHER, STUDENT, PARENT, ACCOUNTANT, SUPPORT_STAFF`. `IT_MANAGER` is a narrow bootstrap-only role
(creates the first `PRINCIPAL` account, not a normal school user) and has **no dashboard in this
frontend** — don't add one unless explicitly asked. The frontend works with the lowercase form of
the rest: `principal, headmaster, teacher, student, parent, accountant, support_staff`.
`STAFF_ROLES` (in `AuthContext.jsx`) = `['teacher','principal','headmaster','accountant','support_staff']`.

Not every role sees every feature — nav visibility is defined per-role in
`src/components/Layout/Sidebar.jsx`, and **that file, not intuition, is the source of truth** for
which roles have which tabs (e.g. fees: `principal`/`accountant`/`parent` only — `student` and
`headmaster` have no fees tab at all). Always check `Sidebar.jsx` before assuming a role needs a
given widget.

## Backend architecture (`../backend`)

Java 21, Spring Boot 3.3.4, Spring Cloud 2023.0.3. Classic microservices-behind-a-gateway shape:

| Service | Port | DB | Responsibility |
|---|---|---|---|
| `eureka-server` | 8761 | — | Service discovery |
| `config-server` | 8888 | — | Centralized config |
| `api-gateway` | 8080 | — | Single entry point, JWT validation, routing |
| `auth-service` | 8081 | `auth_db` | Login, registration, JWT issuance, user management |
| `people-service` | 8082 | `people_db` | Student/staff directories, parent↔student links |
| `class-timetable-service` | 8083 | `class_db` | Classes and weekly timetables |
| `attendance-service` | 8084 | `attendance_db` | Attendance marking/reporting |
| `academics-service` | 8085 | `academics_db` | Homework, notes, exams, question papers, results |
| `fee-service` | 8086 | `fee_db` | Fee records and payments |
| `communication-service` | 8087 | `communication_db` | Notices, messages, notifications |
| `reporting-service` | 8088 | `reporting_db` (cache only) | Cross-service analytics via Eureka + Feign |

`common-security` is a shared library (JWT provider/filter, exception handling, the `Role` enum)
used by every service — not independently runnable. The frontend only ever talks to
`api-gateway` (port 8080); it never calls a domain service directly.

Full setup/run instructions (Docker Postgres, env vars, the `IT_MANAGER` bootstrap flow) are in
`backend/README.md` — read that before trying to run the stack locally, don't re-derive it.

Architecture reference doc (diagrams, original design): `docs/architecture/Dashboard_Padaye_Architecture_Plan.docx`
and `docs/architecture/diagram.png` in this repo.

## The current effort: mock data → real backend wiring

When this document was written, the frontend had already been fully wired for auth
(login/register/refresh) and `/api/users` CRUD, but every other domain (people directory,
classes/timetable, attendance, academics, fees, communication, reporting) still read from
`src/data/mockData.js` despite the corresponding backend services already existing and running.

An approved plan (originally at `C:\Users\SaikrishnaTallapally\.claude\plans\nifty-knitting-goose.md`
— **that path is a Claude Code plan-mode artifact outside this repo and may not survive between
sessions/machines; if it's gone, this file + `PROGRESS.md` + the code are the fallback source of
truth**) broke this into:

- **Part A** — 7 small backend patches (A1–A7) needed to unblock clean frontend wiring (e.g.
  adding self-lookup endpoints, closing an authorization gap, adding a missing DTO field). All
  7 are done.
- **Part B** — 6 frontend phases, done roughly in dependency order: People/Classes → Attendance
  → Academics → Fees → Communication → Reporting, each phase touching: one new `src/api/*Api.js`
  module → the relevant `DataContext.jsx` slice → the components that consumed the mock data for
  that domain.
- A final **local stack setup and verification** pass (bring up the whole backend + frontend
  together and manually exercise every phase's flows) — not started as of this writing.

**See `docs/PROGRESS.md` for exactly which phases/patches are done, what's pending, and the
concrete next steps.** Don't duplicate that tracking here — this file is for orientation, that
file is for status.

## Working conventions established during this effort (apply to any remaining phase)

- No backend service in this system has a generic DELETE for most entities. Where the entity has
  a status/active-like field (e.g. `Class.active`), route a frontend "delete" action through a
  PUT that flips it instead of adding a real delete. Where no such field exists and the entity is
  low-risk (exams, homework, notes, holidays), a real `DELETE /{id}` may be added opportunistically.
  **Never** add delete for financial records (fee records) — hide the affordance in the UI instead,
  matching what the backend intentionally does not expose.
- Match frontend role-gating exactly to the backend's `@PreAuthorize` annotations for that
  endpoint — don't infer permissions from what "seems reasonable" in the UI. When in doubt, read
  the actual `*Controller.java` in `backend/<service>/.../controller/` before writing the gate.
  These have repeatedly turned out to be asymmetric in non-obvious ways (e.g. fee-service's
  "pay" endpoint allows PARENT+ACCOUNTANT but not PRINCIPAL, while "edit" allows ACCOUNTANT+PRINCIPAL
  but not PARENT).
- When a mock field has no backend equivalent (e.g. `Notice.priority` doesn't exist on the real
  entity), drop the UI control for it rather than keeping a form field that silently doesn't
  persist.
- When the real API's shape doesn't map 1:1 onto the mock's shape (e.g. fee-service returns one
  current status record per student, not a per-term history list the old mock UI displayed),
  redesign the view around what the real API actually returns rather than forcing the old mock UI
  shape onto it.
- `mockData.js` itself is left untouched/un-pruned as each domain migrates off it (dead exports
  accumulate there intentionally) — don't spend time cleaning it up mid-phase; that's a final
  cosmetic pass at the very end of all 6 phases, if ever requested.
