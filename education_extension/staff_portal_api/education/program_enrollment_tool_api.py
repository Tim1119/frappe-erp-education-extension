import json

import frappe
from frappe import _

# Real Frappe "Tool" doctype (issingle: 1, hide_toolbar: 1, confirmed from
# the real program_enrollment_tool.json). School-facing name is "Class
# Enrollment Tool" per translations.js's real configured TERM_MAP entry
# ("Program Enrollment Tool" -> "Class Enrollment Tool"). Real client
# script calls frm.disable_save() -- same never-persisted Single pattern
# as every prior Tool this session. Its two real @frappe.whitelist()
# INSTANCE methods (get_students(), enroll_students()) are reused
# directly below via frappe.get_doc("Program Enrollment Tool") + .update()
# (loads the real Single, never re-saves it), exactly the same real
# precedent already used for Student Group Creation Tool and Subject
# Scheduling Tool.
#
# Real mechanism, genuinely different depending on get_students_from:
#   - "Student Applicant": finds Approved Student Applicants for the
#     selected Program/Academic Year(/Term) and enrolls each directly
#     into THAT SAME Program/Academic Year/Term -- this is first-time
#     enrollment of newly-approved applicants.
#   - "Program Enrollment" (school-facing: "Class Enrollment"): finds
#     STUDENTS with an existing, active Program Enrollment matching the
#     selected (source) Program/Academic Year/Term/Batch, and creates a
#     NEW Program Enrollment for each under a *separate* target
#     Program/Academic Year/Term/Batch (new_program/new_academic_year/
#     new_academic_term/new_student_batch) -- this is promoting
#     continuing students into their next Class/Academic Year.


@frappe.whitelist()
def get_students(get_students_from, program, academic_year, academic_term=None, student_batch=None):
    """Thin wrapper around the real, unmodified Document.get_students().

    Real behavior, traced from program_enrollment_tool.py:
      - "Student Applicant" mode: Student Applicant rows where
        application_status == "Approved" and program/academic_year(/
        academic_term) match, returned as {student_applicant,
        student_name}.
      - "Program Enrollment" mode: existing Program Enrollment rows for
        that program/academic_year(/academic_term)(/student_batch),
        returned as {student, student_name, student_batch_name,
        student_category} -- rows for any Student that is currently
        disabled are filtered out.
    Raises (via frappe.throw, not caught here) if the required filter
    fields are missing, or if nothing matches -- both real, unmodified
    behaviors that should surface to the user as-is."""
    doc = frappe.get_doc("Program Enrollment Tool")
    doc.update({
        "get_students_from": get_students_from,
        "program": program,
        "academic_year": academic_year,
        "academic_term": academic_term,
        "student_batch": student_batch,
    })
    return doc.get_students()


@frappe.whitelist()
def enroll_students(data):
    """Thin wrapper around the real, unmodified Document.enroll_students()
    -- reused directly, not reimplemented.

    Real behavior, traced from the actual source: loops the (reviewed/
    selected) "students" child rows. For a row with `student` set
    (Program Enrollment-sourced), builds a brand-new "Program Enrollment"
    doc (program/academic_year/academic_term = the real NEW target
    fields; student_batch_name = the row's own batch if it has one, else
    the target new_student_batch) and .save()s it. For a row with
    `student_applicant` set instead, calls the real, already-whitelisted
    education.education.api.enroll_student(student_applicant) -- which
    itself creates a brand-new real "Student" record via get_mapped_doc
    AND a first Program Enrollment .save() -- then overwrites that
    Program Enrollment's academic_year/academic_term with THIS tool's
    own (source) academic_year/academic_term fields (not the "new_*"
    ones -- there is no separate target in Student Applicant mode) and
    student_batch_name, and .save()s it again. Every .save() on a
    "Program Enrollment" runs its own real validate() in full --
    validate_duplication() (throws "Student is already enrolled." for
    an existing non-cancelled enrollment with the same student/program/
    academic_year/academic_term) and the SAME real required-Subjects
    auto-population (self.extend("courses", self.get_courses())) already
    relied on by the standalone Class Enrollment module -- neither is
    reimplemented or bypassed here. Program Enrollment is_submittable --
    every enrollment created this way lands as a DRAFT (docstatus 0);
    make_fee_records()/create_course_enrollments() only run from
    on_submit(), which this Tool never calls, matching the standalone
    Class Enrollment module's own create-then-submit-separately flow.

    Atomicity: no try/except anywhere in the real loop and no explicit
    frappe.db.commit() inside the real method itself -- so a single
    row's validate() failure (most likely validate_duplication()) raises
    uncaught and, via Frappe's own request-level rollback (rollback=True
    by default; commit only runs in the try's else clause in
    frappe/app.py), reverts EVERY row's already-completed .save() in the
    same call too. This is genuinely all-or-nothing across the whole
    selected batch -- there is no partial-success path in the real code
    (unlike Subject Scheduling Tool's own per-date OverlapError
    tolerance), so on failure nothing in this batch is enrolled, not
    "everything except the failing row." We add one explicit
    frappe.db.commit() below for the same reason as every prior Tool's
    API wrapper: this is a standalone whitelisted call, not a normal
    Desk form save cycle.

    Real known app gap, NOT fixed here since it's core app code (same
    treatment as the get_students() positional-argument bug already
    documented in student_group_creation_tool_api.py): the "Student
    Applicant" mode query has no guard against an Approved applicant
    that was already converted by a previous run of this same Tool --
    validate_duplication() cannot catch it either, since enroll_student()
    creates a genuinely NEW Student record every time via get_mapped_doc,
    so a second run against the same still-Approved applicant creates a
    second Student + Program Enrollment rather than being rejected as a
    duplicate. We do not filter this out client-side (that would be
    inventing a restriction the real tool doesn't have); the frontend
    only clears its own selection table after a successful run so a
    second click can't immediately repeat the same batch by accident.

    enroll_students() itself returns nothing (only a frappe.msgprint with
    a count) and never writes the resulting Program Enrollment name back
    onto its own child rows, so the "created" list below is read back by
    matching each selected row's real Student against the real target
    program/academic_year/academic_term it should now be enrolled under
    -- reporting the deterministic outcome of the call that just
    succeeded, not reimplementing or guessing it."""
    if isinstance(data, str):
        data = json.loads(data)

    students = data.get("students") or []

    doc = frappe.get_doc("Program Enrollment Tool")
    doc.update({
        "get_students_from": data.get("get_students_from"),
        "program": data.get("program"),
        "student_batch": data.get("student_batch"),
        "academic_year": data.get("academic_year"),
        "academic_term": data.get("academic_term"),
        "enrollment_date": data.get("enrollment_date"),
        "new_program": data.get("new_program"),
        "new_student_batch": data.get("new_student_batch"),
        "new_academic_year": data.get("new_academic_year"),
        "new_academic_term": data.get("new_academic_term"),
        "students": students,
    })

    doc.enroll_students()
    frappe.db.commit()

    is_promotion = doc.get_students_from == "Program Enrollment"
    target_program = doc.new_program if is_promotion else doc.program
    target_academic_year = doc.new_academic_year if is_promotion else doc.academic_year
    target_academic_term = doc.new_academic_term if is_promotion else doc.academic_term

    created = []
    for row in doc.students:
        student = row.student
        if not student and row.student_applicant:
            student = frappe.db.get_value(
                "Student", {"student_applicant": row.student_applicant}, "name",
                order_by="creation desc",
            )
        if not student:
            continue
        enrollment_name = frappe.db.get_value(
            "Program Enrollment",
            {
                "student": student,
                "program": target_program,
                "academic_year": target_academic_year,
                "academic_term": target_academic_term or "",
                "docstatus": 0,
            },
            "name",
            order_by="creation desc",
        )
        created.append({
            "student": student,
            "student_name": row.student_name,
            "program_enrollment": enrollment_name,
        })

    return {"count": len(created), "created": created}


@frappe.whitelist()
def get_academic_term_reqd():
    """Mirrors the real onload()/setup(): frm.toggle_reqd('academic_term',
    true) when Education Settings' academic_term_reqd is checked."""
    return frappe.db.get_single_value("Education Settings", "academic_term_reqd")


@frappe.whitelist()
def get_period_start_date(academic_term=None, academic_year=None):
    """Mirrors the real client script's refresh() add_fetch target for
    enrollment_date: frm.doc.academic_term ? new_academic_term.
    term_start_date : new_academic_year.year_start_date."""
    if academic_term:
        return frappe.db.get_value("Academic Term", academic_term, "term_start_date")
    if academic_year:
        return frappe.db.get_value("Academic Year", academic_year, "year_start_date")
    return None


@frappe.whitelist()
def get_programs():
    try:
        return frappe.get_list("Program", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching programs: {str(e)}", "Class Enrollment Tool API")
        return []


@frappe.whitelist()
def get_academic_years():
    try:
        return frappe.get_list(
            "Academic Year", fields=["name"], order_by="year_start_date desc", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching academic years: {str(e)}", "Class Enrollment Tool API")
        return []


@frappe.whitelist()
def get_academic_terms(academic_year=None):
    try:
        filters = {}
        if academic_year:
            filters["academic_year"] = academic_year
        return frappe.get_list(
            "Academic Term", fields=["name", "title"],
            filters=filters, order_by="term_start_date desc", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching academic terms: {str(e)}", "Class Enrollment Tool API")
        return []


@frappe.whitelist()
def get_student_batch_names():
    try:
        return frappe.get_list(
            "Student Batch Name", fields=["name"], order_by="name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching student batches: {str(e)}", "Class Enrollment Tool API")
        return []
