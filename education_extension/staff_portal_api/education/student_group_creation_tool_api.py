import json

import frappe
from frappe import _
from frappe.utils import cint

# Real Frappe "Tool" doctype (issingle: 1, hide_toolbar: 1, confirmed from
# the real student_group_creation_tool.json), same as Subject Scheduling
# Tool / Student Attendance Tool / Assessment Result Tool. Its real client
# script (student_group_creation_tool.js) calls frm.disable_save() -- the
# Single's own stored field values are never meant to persist across uses,
# only its two @frappe.whitelist() INSTANCE methods matter:
# get_courses() and create_student_groups() (both on the Document
# subclass itself, not a shared education.education.api module). Desk
# calls these via frappe.call({method, doc: frm.doc}) which reconstructs
# a fresh in-memory doc from whatever is currently on the form and calls
# the method on THAT -- so, exactly like Subject Scheduling Tool's own
# course_scheduling_tool_api.py, we load the real Single via
# frappe.get_doc("Student Group Creation Tool") and .update() it in
# memory (never re-saving the Single itself) rather than persisting
# anything.


@frappe.whitelist()
def get_courses(program, academic_year, academic_term=None, separate_groups=0):
    """Thin wrapper around the real, unmodified Document.get_courses().

    Real behavior, traced from student_group_creation_tool.py: for every
    real Student Batch Name, adds one candidate "Batch" group. For every
    row in the selected Program's own Program Course child table, adds
    one candidate "Course" group -- or, if Separate Groups is checked,
    the itertools.product() of every Course x every Batch (one row per
    combination) instead of one row per Course. Each candidate's
    student_group_name is pre-computed with the exact same
    Program/Course/Batch/Term-or-Year slash-joined format the real
    method builds, matching what will actually become the created
    Student Group's docname (autoname: field:student_group_name)."""
    doc = frappe.get_doc("Student Group Creation Tool")
    doc.update({
        "program": program,
        "academic_year": academic_year,
        "academic_term": academic_term,
        "separate_groups": cint(separate_groups),
    })
    return doc.get_courses()


@frappe.whitelist()
def create_student_groups(data):
    """Thin wrapper around the real, unmodified
    Document.create_student_groups() -- reused directly, not
    reimplemented.

    Real behavior worth knowing, traced from the actual source: loops
    every row of the "courses" child table, validates student_group_name/
    course/batch are set per that row's group_based_on (frappe.throw()s
    with the row's idx if not -- the SAME real per-record validation
    Class Arm's own module already surfaces), then builds a brand-new
    "Student Group" doc per row (program/course/batch/max_strength/
    academic_term/academic_year copied across), fetches its real roster
    via the doctype's own get_students(), and .save()s it. Every .save()
    runs Class Arm's OWN real validate() chain in full (validate_mandatory_
    fields/validate_strength/validate_students/validate_and_set_child_
    table_fields/validate_duplicate_student) -- not reimplemented or
    bypassed here. Student Group's autoname is "field:student_group_name",
    so a duplicate student_group_name (either against an existing real
    Class Arm or another row in this same batch) fails with Frappe's own
    standard DuplicateEntryError on that row's .save().

    Atomicity: there is no try/except anywhere in this loop and no
    explicit frappe.db.commit() inside the real method itself (unlike
    Student Attendance Tool's mark_attendance()) -- so if ANY row's
    .save() raises (a validation failure above, or a duplicate name),
    the exception propagates uncaught out of this whitelisted call.
    Frappe's own request lifecycle (frappe/app.py: rollback=True by
    default, sync_database()/commit only runs in the try's else clause)
    then rolls back the WHOLE request, undoing every earlier row's
    already-completed .save() in the same call too. This is genuinely
    atomic (all-or-nothing) across the whole batch -- the same
    conclusion as Student Attendance Tool and Assessment Result Tool's
    submit action, but via the same implicit request-level mechanism as
    the latter (no explicit commit call needed), not the explicit
    trailing commit the former uses. We add one explicit
    frappe.db.commit() below only because this is a standalone
    @frappe.whitelist() endpoint call from the staff portal rather than
    a normal Desk form save, matching the exact same real precedent
    already established for schedule_course() in
    subject_scheduling_tool_api.py.

    Real known app bug, NOT fixed here since it's core app code (same
    treatment as the "Academic User"/"Academics User" role typo and the
    mark_assessment_result() None.update() crash documented elsewhere in
    this project): create_student_groups() calls the real get_students()
    positionally as get_students(academic_year, group_based_on,
    academic_term, program, batch, course) -- but get_students()'s own
    signature is (academic_year, group_based_on, academic_term=None,
    program=None, batch=None, student_category=None, course=None). The
    6th positional argument lands in student_category, not course. For
    every "Course"-based group this silently filters Program Enrollment
    by student_category=<course name>, which never matches any real
    enrollment record, so get_students() returns an empty roster (a
    frappe.msgprint("No students found"), not an error) for every
    Course-based group -- "Batch"-based groups are unaffected since
    batch is still passed into the correct slot. Newly created
    Course-based Class Arms will therefore have 0 students even though
    the group itself is created successfully; this is surfaced in the
    results below (per-row student counts) rather than hidden.

    create_student_groups() itself returns None (only a frappe.msgprint()
    with a count) -- there is no real "what got created" return value to
    relay as-is. Since Student Group's autoname is exactly
    field:student_group_name, each row's student_group_name IS the real
    new docname once .save() succeeds, so the created-groups list
    returned below is read back from the same doc.courses rows that were
    just used to create them (plus a fresh per-group student count via
    frappe.db.count()) -- not a guess, not reimplemented business logic,
    just reporting the deterministic outcome of the real call that just
    ran successfully."""
    if isinstance(data, str):
        data = json.loads(data)

    courses = data.get("courses") or []

    doc = frappe.get_doc("Student Group Creation Tool")
    doc.update({
        "program": data.get("program"),
        "academic_year": data.get("academic_year"),
        "academic_term": data.get("academic_term"),
        "courses": courses,
    })

    doc.create_student_groups()
    frappe.db.commit()

    created = []
    for row in doc.courses:
        created.append({
            "student_group_name": row.student_group_name,
            "group_based_on": row.group_based_on,
            "course": row.course,
            "batch": row.batch,
            "student_count": frappe.db.count("Student Group Student", {"parent": row.student_group_name}),
        })

    return {"count": len(created), "created": created}


@frappe.whitelist()
def get_programs():
    try:
        return frappe.get_list("Program", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching programs: {str(e)}", "Student Group Creation Tool API")
        return []


@frappe.whitelist()
def get_academic_years():
    try:
        return frappe.get_list(
            "Academic Year", fields=["name", "academic_year_name"],
            order_by="year_start_date desc", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching academic years: {str(e)}", "Student Group Creation Tool API")
        return []


@frappe.whitelist()
def get_academic_terms(academic_year=None):
    """Mirrors the real client script's onload set_query on academic_term:
    filters: { academic_year: frm.doc.academic_year }."""
    try:
        filters = {}
        if academic_year:
            filters["academic_year"] = academic_year
        return frappe.get_list(
            "Academic Term", fields=["name", "title"],
            filters=filters, order_by="term_start_date desc", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching academic terms: {str(e)}", "Student Group Creation Tool API")
        return []


@frappe.whitelist()
def get_student_batch_names():
    try:
        return frappe.get_list(
            "Student Batch Name", fields=["name"],
            order_by="name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching student batches: {str(e)}", "Student Group Creation Tool API")
        return []


@frappe.whitelist()
def get_program_courses(program):
    """Same real source Document.get_courses() itself reads --
    frappe.db.sql("select course, course_name from tabProgram Course
    where parent=%s", (program,)) -- exposed here as a lookup so a
    manually-added or manually-edited row can pick a real Course scoped
    to the selected Program, not reimplementing any validation."""
    if not program:
        return []
    try:
        return frappe.db.sql(
            """select course, course_name from `tabProgram Course` where parent=%s""",
            (program,), as_dict=1,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching program subjects: {str(e)}", "Student Group Creation Tool API")
        return []
