# School Staff Portal — Project Conventions

This file is read automatically by Claude Code at the start of every
session. It exists so every new module (Settings, Attendance, Assessment,
etc.) follows the same patterns already established across Students,
Teachers, Guardians, Classes, Class Arms, Subjects, Topics, Articles,
Videos, Quizzes, Classrooms, Fee Category/Structure/Schedule, Student
Applicants, Student Admissions, and Academic Term — instead of reinventing
conventions each time.

**Read this file fully before generating or modifying any module.**

---

## 0. What this project is

A custom React staff portal for a Frappe Education-based school management
system, replacing the default Frappe Desk UI for staff/admin use. It talks
to the backend exclusively through whitelisted RPC methods
(`/api/method/...`) — never the Desk UI, never raw `/api/resource/...`
CRUD for anything with custom logic.

**Critical constraint: no Frappe/ERPNext/Desk branding anywhere in
user-visible text.** The person using this portal should never see the
words "Frappe," "ERPNext," or "Desk" in any label, placeholder, empty-state
message, or toast. Grep for these before considering any page done:

```bash
grep -rn -i "frappe\|erpnext\|\bdesk\b" src/pages/ --include="*.jsx" \
  | grep -v "frappeClient\|X-Frappe-CSRF-Token\|frappe.client\.\|/\* .*Frappe.*\*/"
```

Internal code (service file names, HTTP headers, backend RPC method paths,
code comments) is fine — only *user-visible* text is off-limits.

---

## 1. Directory structure

```
education_extension/education_extension/
  staff_portal_api/
    <module>_api.py            <- one file per module, all @frappe.whitelist()

staff-portal/src/
  App.jsx                       <- route tree (admin + teacher + placeholders)
  main.jsx                       <- ThemeProvider -> AuthProvider -> BrowserRouter -> App
  index.css                     <- Tailwind + shadcn tokens + legacy bridge tokens
  config/
    navigation.js                <- ADMIN_NAV / TEACHER_NAV sidebar trees
    themes.js                    <- 16 color presets + applyPreset()
    translations.js              <- Frappe term -> school term display map
  context/
    AuthContext.jsx               <- role detection (admin/teacher), school branding
    ThemeContext.jsx              <- mode (light/dark) + color preset, localStorage
  hooks/index.js                 <- useAsync, useDebounce, usePagination, useBreadcrumbs
  services/
    api.js                        <- low-level POST /api/method/<path> wrapper
    frappeClient.js                <- generic REST helpers (getList/getCount/etc.)
    <module>Service.js             <- one per module, thin wrappers around api()
  components/
    ui/                            <- shadcn primitives (button, input, select, etc.)
    shared/
      PageHeader.jsx, Toolbar.jsx, Pager.jsx, ConfirmDialog.jsx,
      EmptyState.jsx, StatusBadge.jsx, RowActionsMenu.jsx, Modal.jsx,
      SearchableSelect.jsx, OriginalPrimitives.jsx (legacy bridge)
    layout/
      AppShell.jsx, Sidebar.jsx, Navbar.jsx, PageBreadcrumbs.jsx, ThemePicker.jsx
    charts/TrendCard.jsx
  pages/
    admin/<module>/
      <Module>Page.jsx            <- list
      <Module>FormPage.jsx        <- create/edit
      <Module>ProfilePage.jsx     <- detail
      components/
        <Module>Form.jsx           <- complex forms live here, imported by FormPage
        <Module>Details.jsx        <- complex detail views live here
    teacher/                       <- scoped versions for teacher role (WIP)
    placeholder/PlaceholderPage.jsx <- "Coming Soon" for unbuilt modules
    dashboard/Dashboard.jsx
    auth/Login.jsx
```

A brand-new module always needs **all four** of these to actually appear
in the app:
1. `staff_portal_api/<module>_api.py` (backend)
2. `services/<module>Service.js` (frontend)
3. The three page files under `pages/admin/<module>/`
4. Wiring in **both** `App.jsx` (imports + routes) **and** `config/navigation.js`
   (sidebar link) — a module with routes but no sidebar link, or a sidebar
   link pointing at a route that doesn't exist, is a common mistake.

---

## 2. Backend API pattern (`staff_portal_api/<module>_api.py`)

Every list endpoint follows this exact shape:

```python
@frappe.whitelist()
def get_<items>(page=1, page_size=20, search=None, <other filters>=None):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    if <filter_value>:
        filters["<field>"] = <filter_value>

    or_filters = []
    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["<searchable_field>", "like", f"%{search}%"],
        ]

    rows = frappe.get_all(
        "<DocType Name>",
        fields=[...],
        filters=filters,
        or_filters=or_filters,
        order_by="creation desc",   # ALWAYS creation desc for lists -- newest
                                     # first, matching every other module.
                                     # Do NOT sort by a domain date field
                                     # (e.g. start_date) unless explicitly
                                     # asked -- see the Academic Term bug
                                     # where sorting by term_start_date
                                     # made new records land mid-list
                                     # instead of at the top.
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count("<DocType Name>", filters=filters)

    return {
        "rows": rows,
        "count": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size else 1,
    }
```

Standard CRUD companions: `get_<item>(name)`, `create_<item>(data)`,
`update_<item>(name, data)`, `delete_<item>(name)` -- `data` arrives as a
JSON string from the frontend, parse with `json.loads(data)` if
`isinstance(data, str)`. Always `frappe.db.commit()` after insert/save/delete.

**Fields that drive `autoname`** (e.g. Academic Term's `academic_year` +
`term_name`) must NOT be changeable via `update_*` -- only accept the
fields that don't affect the docname. The frontend form should show them
as locked/read-only in edit mode (see `AcademicTermFormPage.jsx` for the
pattern). Check the doctype's `autoname` value in its JSON before writing
the update function.

**Do not duplicate backend validation logic in the API layer.** If the
Python controller's `validate()` method already checks something (date
ranges, duplication, etc.), just let the exception propagate -- the
frontend's `getErrorMessage()` (see section 6) surfaces it correctly. Only
add client-side pre-checks for very common, easily-explained mistakes
(see the Academic Term year-bounds example) to save a round trip -- never
as a replacement for the real validation.

For Connections/dashboard-style link counts on detail pages, add a
`get_connections(<name>)` function returning a flat dict of counts via
`frappe.db.count(<ChildDoctype>, {<link_field>: <name>})` -- see
`academic_term_api.py`'s `get_connections()` for the reference shape.

---

## 2.5. Mapping a DocType JSON field to a frontend input

For every field in the DocType JSON's `fields` array (skipping layout
types -- Section Break, Column Break, Tab Break, HTML, Button, Heading):

| `fieldtype` | Frontend input |
|---|---|
| `Data`, `Small Text` | `<Input>` |
| `Text`, `Long Text`, `Text Editor` | `<textarea>` (see `.select`/`.input` compat classes or a plain styled textarea) |
| `Int`, `Float`, `Currency` | `<Input type="number">` |
| `Date` | `<Input type="date">` |
| `Datetime` | `<Input type="datetime-local">` |
| `Check` | a checkbox or a Yes/No `<Select>`, matching how similar boolean fields are handled elsewhere in the app (e.g. `enabled`, `disabled`) |
| `Select` | `<Select>` populated from the field's `options` string (newline-separated) -- see section 5 if any option value needs a school-facing display label different from the stored value |
| `Link` | either a `<Select>` (if the linked list is short/static, e.g. Academic Year) or `SearchableSelect` (if the linked doctype is large/searchable, e.g. Student, Guardian, Course) -- follow whichever existing module already links to that same target doctype for consistency |
| `Table` / `Table MultiSelect` | see section "Child tables" immediately below -- **do not render as a single input** |

**`reqd: 1` in the JSON must become a required field in the form** --
`required` attribute on the input, a red asterisk next to the `<Label>`
(matching the `<span className="text-destructive">*</span>` pattern used
throughout every existing form), and included in whatever client-side
"fill in the blanks" check the form does before submit.

### Client-side validation requires the `.py` controller file, not just the JSON

**The JSON schema alone is not enough to write good client-side
validation.** It tells you which fields exist and which are `reqd` -- it
does NOT tell you the business rules (date ordering, cross-field
dependencies, duplication checks) that live entirely in the DocType's
Python controller (`<doctype_name>.py`, specifically its `validate()`
method and whatever helper methods it calls).

**Always request or read the controller `.py` file before writing any
client-side pre-check beyond basic required-field validation.** This is
exactly how the Academic Year date-bounds hint got built for Academic
Term: the JSON alone would never have revealed that `term_start_date`
must fall within the linked Academic Year's own date range -- that rule
only exists inside `academic_term.py`'s `validate_term_against_year()`
method. Reading the controller is what let the frontend mirror that
specific rule as a friendly pre-submit check (see
`AcademicTermFormPage.jsx`'s `yearBounds` logic) instead of only
discovering it after a confusing server error.

If a controller file isn't available/provided for a module, it's fine to
still build the form -- just stick to `reqd`-field checks and skip
inventing business-rule validation you can't actually see.

### Child tables (`fieldtype: "Table"` / `"Table MultiSelect"`)

A `Table` field must never render as a plain input -- it needs an
add/remove-row UI. Follow the exact pattern already used in:
- `ClassForm.jsx`'s subjects table (simple child rows with a searchable
  select per row + a "required" checkbox column)
- `StudentApplicantForm.jsx`'s guardians table (child rows linking to
  another doctype, auto-filling a display field on selection)
- `ClassArmForm.jsx`'s students/instructors tables (multiple child tables
  on one form)

Structure to replicate:
```jsx
function addRow() {
  setForm((p) => ({ ...p, <table_fieldname>: [...p.<table_fieldname>, { ...EMPTY_ROW }] }));
}
function removeRow(index) {
  setForm((p) => ({ ...p, <table_fieldname>: p.<table_fieldname>.filter((_, i) => i !== index) }));
}
function updateRow(index, field, value) {
  const rows = [...form.<table_fieldname>];
  rows[index][field] = value;
  setForm((p) => ({ ...p, <table_fieldname>: rows }));
}
```
rendered as a `<Table>` with one column per **real** (non-layout) field
of the *child* doctype (named in the parent field's `options`), plus a
trailing delete-icon column, and an "Add Row" button below.

**To know which columns a child table needs, you must look at the child
doctype's own JSON** (`options` on the `Table` field names the child
DocType -- its schema lives at
`apps/<app>/<app>/doctype/<child_doctype_slug>/<child_doctype_slug>.json`
in the standard Frappe layout). `scripts/check_fields.py` does this
resolution automatically and will flag any child-doctype field that
never got referenced -- but you still need the child doctype's JSON
provided or discoverable to build the columns correctly in the first
place; don't guess child table columns from the parent JSON alone, since
the parent only tells you the child *doctype name*, not its fields.

---

## 3. Frontend service pattern (`services/<module>Service.js`)

```javascript
import api from "./api";

const METHOD = "education_extension.staff_portal_api.<module>_api";

export function get<Items>(params) {
  return api(`${METHOD}.get_<items>`, params);
}
export function get<Item>(name) {
  return api(`${METHOD}.get_<item>`, { name });
}
export function create<Item>(data) {
  return api(`${METHOD}.create_<item>`, { data });
}
export function update<Item>(name, data) {
  return api(`${METHOD}.update_<item>`, { name, data });
}
export function delete<Item>(name) {
  return api(`${METHOD}.delete_<item>`, { name });
}
```

Nothing fancier than this -- no axios, no separate client instances.

---

## 4. Frontend page patterns

### List page (`<Module>Page.jsx`)
`PageHeader` (title + "Add X" button) -> `Toolbar` (search + filter
selects) -> `Card` wrapping a shadcn `Table` -> `Pager` -> `ConfirmDialog`
for delete confirmation.

**Row actions MUST use `RowActionsMenu`** (`@/components/shared/RowActionsMenu`),
never a hand-rolled dropdown. `RowActionsMenu` is built on Radix's
`DropdownMenu`, which renders through a React Portal to `document.body` --
this is required, not a style preference. A manually-positioned
`position: absolute` dropdown gets clipped by the table's
`overflow-x: auto` wrapper (this exact bug existed in 16 pages before
being fixed -- don't reintroduce it).

```jsx
<TableCell onClick={(e) => e.stopPropagation()}>
  <RowActionsMenu
    onView={() => navigate(`/dashboard/<module>/${encodeURIComponent(row.name)}`)}
    onEdit={() => navigate(`/dashboard/<module>/${encodeURIComponent(row.name)}/edit`)}
    onDelete={() => setDeleteTarget(row)}
  />
</TableCell>
```

**Always `encodeURIComponent()` the docname when building a URL, always
`decodeURIComponent()` when reading it back out of `useParams()`.** Some
Frappe docnames contain literal `/` characters (e.g. an academic-year
suffix like "Primary 2B 2025/2026"). Skipping this causes a 404 because
react-router treats the un-encoded slash as an extra path segment. This
bit us once already in `ClassArmProfilePage.jsx` -- its Edit button used
the raw `id` from `useParams()` directly instead of re-encoding it.

### Form page (`<Module>FormPage.jsx`)
Handles both create and edit via `const isEdit = Boolean(id)`. Loads
existing data in a `useEffect` keyed on the decoded name. On submit, calls
`create*` or `update*` accordingly, then navigates back to the list.
Complex forms (child tables, image upload, searchable selects) live in a
separate `components/<Module>Form.jsx` and get imported -- don't inline a
500-line form directly in the page file.

### Profile/detail page (`<Module>ProfilePage.jsx`)
**Must have Edit + Delete buttons** in the `PageHeader`'s `button` slot,
styled with the real shadcn `<Button>` component (not the `.btn` compat
CSS classes) -- two profile pages (Students, Class Arms) were missing this
entirely and had to be retrofitted. Use this exact shape:

```jsx
<PageHeader
  eyebrow="<Group>"
  title={item.<display_field> || item.name}
  button={
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={() => navigate(`/dashboard/<module>/${encodeURIComponent(name)}/edit`)}>
        <Pencil className="mr-2 h-4 w-4" /> Edit
      </Button>
      <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}>
        <Trash2 className="mr-2 h-4 w-4" /> Delete
      </Button>
    </div>
  }
/>
```

If the doctype has a `links` array in its JSON (Frappe's own
"Connections" dashboard config), add a matching Connections `Card` on the
profile page, grouped the same way the JSON groups them, each item a
clickable count-badge linking to the filtered list. See
`AcademicTermProfilePage.jsx` for the reference implementation.

---

## 5. Terminology translation -- Program->Class, Course->Subject, etc.

The school renamed these Frappe concepts. Apply the renamed label to
**user-visible text only** -- never to doctype names in API calls, field
names, JS variable names, or literal values of fixed Frappe select-field
options.

| Frappe term | School term |
|---|---|
| Program | Class |
| Course | Subject |
| Instructor | Teacher |
| Room | Classroom |
| Student Group | Class Arm |

**The dangerous case:** if a Frappe select field has a fixed set of
option *values* that get saved to the DB (e.g. Student Group's
`group_based_on` field, whose real stored values are literally `"Batch"`,
`"Course"`, `"Activity"`) -- do NOT rename the value itself, that breaks
saving/loading against the backend. Instead decouple display from value:

```jsx
const GROUP_BASED_ON = ["Batch", "Course", "Activity"]; // real backend values -- do not touch
const GROUP_BASED_ON_LABELS = { Batch: "Batch", Course: "Subject", Activity: "Activity" };
...
<option key={x} value={x}>{GROUP_BASED_ON_LABELS[x]}</option>
```

Before considering a module's terminology "done," run a broad sweep -- not
just an obvious-pattern grep. Past passes missed lowercase/casual
occurrences like `"No program selected"` and `"Add courses from the ...
Frappe Desk."` because the search was too narrow. Use:

```bash
grep -rnoE '"[^"]{0,80}\b(Program|Course|Instructor|Room)s?\b[^"]{0,80}"' \
  src/pages/admin/<module>/ --include="*.jsx" \
  | grep -viE 'program_|course_|instructor_|room_|getProgram|getCourse|getInstructor|getRoom|doctype|program=|course=|instructor=|room='
```
Then manually classify each hit: backend doctype identifier (leave alone)
vs. actual display text (translate).

---

## 6. Error handling

`utils/errors.js`'s `getErrorMessage()` is the single place error messages
get extracted and cleaned -- every `catch` block should call it, never
read `err.message` directly for a toast.

Two non-obvious things it does that must not be "simplified" away:
1. **Strips HTML tags.** Frappe sometimes embeds literal markup in error
   text meant for its own Desk UI (e.g. `The Term cannot start before the
   Academic Year <strong>2026/2027</strong>`). `react-hot-toast` renders
   plain text, so without stripping, users see literal `<strong>` tags.
2. **A 417 HTTP status from Frappe is NOT always a CSRF failure** -- it's
   the generic status for any `frappe.throw()`'d exception, including
   ordinary business validation errors. `services/api.js` extracts the
   real message from `_server_messages` / `exception` / `message` FIRST,
   and only falls back to a generic "session expired" message if nothing
   else explains it and the text actually mentions CSRF/session.

---

## 7. Theming -- two layers of CSS variables, do not conflate them

`index.css` + `config/themes.js` maintain **two separate layers** of CSS
custom properties, and mixing them up breaks things silently:

**Layer 1 -- shadcn tokens** (`--primary`, `--background`, `--card`,
`--border`, `--input`, `--ring`, `--muted`, `--accent`, etc.): stored as
**raw HSL triples** (e.g. `"220 13% 91%"`, no `hsl()` wrapper), because
Tailwind's own utility classes wrap them internally
(`border-color: hsl(var(--border))`). **Never reference these directly in
an inline JS style without wrapping in `hsl(...)` yourself** -- e.g.
`border: "1px solid var(--border)"` is invalid CSS and silently renders no
border at all. Always write `hsl(var(--border))` in inline styles. This
exact bug shipped in 20 files/67 places before being caught -- grep for it
before shipping any new inline style:

```bash
grep -rn 'var(--border)\|var(--input)\|var(--ring)\|var(--muted)\|var(--accent)\|var(--background)\|var(--card)\|var(--popover)' \
  src/pages/admin/<module>/ --include="*.jsx" | grep -v 'hsl(var('
```
Anything printed by that command is a bug -- wrap it.

**Layer 2 -- legacy bridge tokens** (`--brand`, `--brand-soft`, `--ink`,
`--ink-2/3/4`, `--surface`, `--surface-2/3/4`, `--success`,
`--success-soft`, `--warning`, `--warning-soft`, `--danger`,
`--danger-soft`, `--info`, `--info-soft`, `--purple`, `--purple-soft`):
these exist purely for the many ORIGINAL page components (ported from the
pre-shadcn design) that reference them directly, e.g.
`color: "var(--success)"`. `applyPreset()` in `themes.js` sets these as
**fully-resolved `hsl(...)` color strings**, so they're always safe to use
raw in inline styles -- no extra wrapping needed for these specific names.

**Semantic colors are fixed regardless of the chosen accent palette.**
Success is always green, danger always red, warning always amber, info
always blue -- only `--brand`/`--surface`/`--ink` follow the user's chosen
accent+hue. This is intentional: an "Approved" badge must stay
recognizably green even if the user picked a red accent theme.

If a new module's page uses any CSS variable not in either layer above,
add it properly to `applyPreset()` in `themes.js` (both light and dark
branches) rather than defining it ad-hoc in a component -- that's how the
`--border` bug happened, and how a future one would happen again.

---

## 8. Sidebar / navigation

Two nav trees in `config/navigation.js`: `ADMIN_NAV` and `TEACHER_NAV`.
Structure is nested collapsibles: top-level (Dashboard, Education) ->
group (Student & Instructor, Masters, Fees, etc.) -> leaf link. A new
module's leaf entry:

```javascript
{ key: "<module>", label: "<Display Name>", icon: <LucideIcon>, path: "/dashboard/<module>" }
```

placed inside the appropriate group array. Teachers see a deliberately
reduced subset -- check `TEACHER_NAV` to decide if the new module belongs
there at all (most Settings/Admin-only modules should NOT appear in
`TEACHER_NAV`).

---

## 9. Role scoping (admin vs teacher)

- **Admin** = has the `"Education Manager"` Frappe role.
- **Teacher** = has an `Employee` record (`user_id` = current session
  user) linked to an `Instructor` record.
- Determined once via `portal_api.py`'s `get_portal_context()`, consumed
  through `useAuth()` -> `isAdmin` / `isTeacher`.
- Teacher-scoped pages live under `pages/teacher/` (separate from
  `pages/admin/`) specifically so teacher-specific data filtering can
  change later without risk to the admin pages -- do not conditionally
  branch a single admin page component on `isAdmin` for anything beyond
  simple UI hide/show; build a separate teacher page if the underlying
  data query needs to differ.

---

## 10. Verification checklist before considering a module "done"

Run all of these -- they each caught a real bug during this project's
build-out, they are not hypothetical:

```bash
# 1. Field completeness (see scripts/check_fields.py)
python3 scripts/check_fields.py <doctype.json> src/pages/admin/<module>/*.jsx src/pages/admin/<module>/components/*.jsx

# 2. No Frappe/ERPNext/Desk mentions in user-visible text
grep -rn -i "frappe\|erpnext\|\bdesk\b" src/pages/admin/<module>/ --include="*.jsx" \
  | grep -v "frappeClient\|X-Frappe-CSRF-Token\|frappe\.client\."

# 3. No stray Frappe terminology in display text
grep -rnoE '"[^"]{0,80}\b(Program|Course|Instructor|Room)s?\b[^"]{0,80}"' \
  src/pages/admin/<module>/ --include="*.jsx" \
  | grep -viE 'program_|course_|instructor_|room_|doctype|program=|course=|instructor=|room='

# 4. No raw (unwrapped) shadcn CSS vars in inline styles
grep -rn 'var(--border)\|var(--input)\|var(--ring)\|var(--muted)\|var(--accent)\|var(--background)\|var(--card)\|var(--popover)' \
  src/pages/admin/<module>/ --include="*.jsx" | grep -v 'hsl(var('

# 5. No hand-rolled row-action dropdowns (must use RowActionsMenu)
grep -rn 'rowmenu\|menuId' src/pages/admin/<module>/ --include="*.jsx"

# 6. Every docname used in a URL is encoded
grep -rn 'navigate(`/dashboard/<module>/\${[a-zA-Z_.]*}`' src/pages/admin/<module>/ --include="*.jsx" \
  | grep -v 'encodeURIComponent'

# 7. All imports resolve (adjust the loop to your @/ alias root)
grep -rohn 'from "@/[^"]*"' src/pages/admin/<module>/ --include="*.jsx" \
  | sed 's/.*from "@\///;s/"//' | sort -u | while read imp; do
    [ -f "src/${imp}.jsx" ] || [ -f "src/${imp}.js" ] || [ -f "src/${imp}/index.js" ] \
      || echo "MISSING: @/$imp"
  done

# 8. Brace/paren balance sanity check on every touched file
for f in src/pages/admin/<module>/*.jsx src/pages/admin/<module>/components/*.jsx; do
  ob=$(grep -o '{' "$f" | wc -l); cb=$(grep -o '}' "$f" | wc -l)
  op=$(grep -o '(' "$f" | wc -l); cp=$(grep -o ')' "$f" | wc -l)
  [ "$ob" = "$cb" ] && [ "$op" = "$cp" ] || echo "MISMATCH: $f"
done

# 9. Every reqd:1 field in the JSON is actually marked required in the form
#    (manual check -- open the doctype JSON and the FormPage/Form component
#    side by side; for each field with "reqd": 1, confirm `required` +
#    the red-asterisk Label pattern is present)

# 10. Every Table/Table MultiSelect field in the JSON has a matching
#     add/remove-row UI in the form (not a plain input) -- and was built
#     using the CHILD doctype's own JSON for its columns, not guessed
#     from the parent JSON alone
grep -n '"fieldtype": "Table' <doctype.json>
```

None of these replace actually loading the page in a browser and clicking
through create/edit/delete/view once -- they only catch the mechanical
mistakes that don't require a human to notice.
