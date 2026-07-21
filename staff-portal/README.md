# School Staff Portal

A premium staff portal for **Frappe Education**, built for teachers and school administrators — wired directly
to a real Frappe backend over session-cookie auth and the standard Frappe REST API.

## Modules

- **Dashboard** — live KPIs, today's timetable, attendance trend, recent students, pending leave, outstanding fees
- **Students** — `Student` DocType, with a detail drawer that lazy-loads Program Enrollment + guardians
- **Student Groups** — `Student Group` DocType, roster/courses fetched on demand
- **Attendance** — bulk daily attendance against `Student Attendance`, with history
- **Assessments** — `Assessment Plan` list with bulk score entry into `Assessment Result`
- **School Term Results** — built on `Assessment Result` (see note in the page — core Education has no single "term result" DocType)
- **Course Schedule** — `Course Schedule`, grouped by date
- **Teachers** — `Instructor`, with a lazily-loaded timetable from `Course Schedule`
- **Guardians** — `Guardian`
- **Fees** — `Fee Structure` / `Fees` / `Payment Entry` (frappe/education)
- **HR** — `Employee` / `Department` / `Leave Application` / `Leave Allocation` (frappe/hrms)
- **Reports** — export cards that call whitelisted Frappe methods (see note below)
- **Settings** — `Academic Year` / `Academic Term` / `Grading Scale` / `User` / `Role`

## Getting started

```bash
npm install
npm run dev
```

By default `vite.config.js` proxies `/api` requests to `http://127.0.0.1:8000` in dev — override with
`VITE_API_BASE_URL` in a `.env` file (see `.env.example`) if your Frappe site runs elsewhere. In production,
build this app and serve it from the same origin as your Frappe site (or behind the same reverse proxy) so the
session cookie Frappe sets on login is sent automatically — no CORS configuration needed.

```bash
npm run build   # outputs to dist/
```

Sign in with a real Frappe user account — authentication is a standard session login
(`POST /api/method/login`), handled in `src/context/AuthContext.jsx`.

## How the API layer is organized

- **`src/services/frappeClient.js`** — the only file that talks to Frappe directly: `login`/`logout`,
  generic `getList`/`getDoc`/`createDoc`/`updateDoc`/`deleteDoc` against `/api/resource/<DocType>`, `getCount`,
  and `callMethod` for whitelisted server methods.
- **`src/config/doctypes.js`** — the one place to edit if your site's field names differ from the defaults here.
  Every page imports its field list from this file rather than hardcoding it.
- **`src/hooks/useDocList.js`** — a generic hook (built on the existing `useAsync`) for fetching a paginated,
  searchable, filterable DocType list. Most list pages are just this hook + a table.

## Known gaps to fill in on your site

A few modules need small custom pieces of business logic that don't exist in stock Frappe
Education/HRMS — each is called out in the relevant page/component:

- **School Term Results** — needs a report-card method combining `Assessment Result` + `Program Enrollment`.
- **Reports → Export** — each card calls a whitelisted method (e.g. `education.education.api.export_attendance_report`)
  that you'll need to implement to return a file.
- **Settings → School Information** — needs a small custom Single DocType (e.g. `School Settings`) for
  school name/address/contact details, since Education doesn't ship one.

Everywhere else (Students, Student Groups, Attendance, Assessments, Course Schedule, Teachers, Guardians, Fees,
HR, Users/Roles/Academic settings) is fully wired to real DocTypes today.
