import json

import frappe
from frappe import _
from frappe.utils import cint

# Real doctype: "School Term Result" (education_extension app). NOT a
# Single/Tool -- no issingle, no is_submittable, no hide_toolbar in its
# own real JSON (confirmed fresh, not carried over from the earlier,
# wrongly-scoped build this replaces). autoname is expression-based:
# format:RSLT-({student})-{academic_year}-{academic_term}-{####}. Real
# permissions: exactly ONE role, "System Manager" (create/delete/email/
# export/print/read/report/write/share) -- notably NOT "Education
# Manager" (this app's own portal-Admin marker per CLAUDE.md section 9)
# and NOT "Academics User" either. A portal Admin who doesn't separately
# hold System Manager could still be denied here -- not something we can
# fix from this file, just flagged. Module stays admin-only / off
# TEACHER_NAV.
#
# Real before_insert() computation, traced fully: on insert only (NOT on
# a later update -- validate() is a no-op `pass`), school_term_result.py
# calls school_term_result_utils.populate_student_result(self), which:
#   - pulls the student's gender/admission id, the Academic Term's own
#     start/end dates, and (if unset) defaults Date of Result Issue to
#     today
#   - resolves Program via the student's SUBMITTED Program Enrollment for
#     the selected Academic Year, and Class Arm via Student Group Student
#     (first match for that student+year) -- counting class/arm sizes off
#     Program Enrollment / Student Group Student respectively
#   - computes attendance (times school opened/present/absent, percentage)
#     from Student Attendance rows within the Term's own date range
#   - pulls every Assessment Result (+ its Assessment Result Detail rows)
#     for this student/academic_year/assessment_group, throwing "No
#     Assessment Results found for student <x>. Cannot create result." if
#     none exist -- populates the "subjects" (Subject Result) and
#     "assessment_components" (Assessment Score) child tables from them
#   - determines the two PREVIOUS terms' scores by STRING-PARSING the
#     Assessment Group's own name for "first/second/third" (or roman-
#     numeral/ordinal variants) plus a "(YYYY/YYYY)" suffix, then looks up
#     any existing School Term Result matching that guessed previous
#     Assessment Group name -- a real, fragile, name-parsing mechanism,
#     not a structured link
#   - computes per-subject class high/low/average and the student's own
#     subject position via a plain per-subject SQL query scoped to the
#     Class Arm
#   - computes total_marks_obtained/total_max_marks/term_average, then
#     overall_grade via School Settings' own overall_grading_scale (or a
#     hardcoded 80/70/60/50 fallback if that's not configured)
#   - computes class_arm_position (within the Class Arm) and class_position
#     (across the whole Program) via per-student SUM(total_score) ranking
#
# Real Connections: NONE, confirmed both directions -- School Term
# Result's own JSON has "links": [] and no other doctype anywhere in
# either app ships a _dashboard.py referencing "School Term Result" as a
# target. No Connections card is built on the profile page for this
# reason, not by oversight.
#
# Related but explicitly OUT OF SCOPE for this module: a fourth, adjacent
# doctype "Term Result Recalculation" exists (education_extension app) --
# a separate bulk tool that RE-runs this same computation against
# ALREADY-CREATED School Term Result records (e.g. to refresh positions/
# grades after later Assessment Results come in), rather than creating
# new ones. Not built here; flagged as a possible future module.


@frappe.whitelist()
def get_school_term_results(
    page=1, page_size=20, search=None,
    student=None, academic_year=None, academic_term=None, assessment_group=None, student_group=None,
):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    if student:
        filters["student"] = student
    if academic_year:
        filters["academic_year"] = academic_year
    if academic_term:
        filters["academic_term"] = academic_term
    if assessment_group:
        filters["assessment_group"] = assessment_group
    if student_group:
        filters["student_group"] = student_group

    or_filters = []
    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["student_admission_id", "like", f"%{search}%"],
        ]

    rows = frappe.get_list(
        "School Term Result",
        fields=[
            "name", "student", "student_admission_id", "assessment_group",
            "academic_year", "academic_term", "student_group", "program",
            "term_average", "overall_grade", "class_position", "class_arm_position",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="creation desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    # student_name is NOT a real field on School Term Result itself (only
    # student_admission_id is) -- resolved here via a batched lookup
    # against the real Student doctype's own student_name field instead
    # of a per-row query.
    student_names = list({r.student for r in rows if r.student})
    if student_names:
        student_rows = frappe.get_list(
            "Student", filters={"name": ["in", student_names]}, fields=["name", "student_name"],
        )
        name_by_student = {s.name: s.student_name for s in student_rows}
        for r in rows:
            r["student_name"] = name_by_student.get(r.student)

    total = frappe.db.count("School Term Result", filters=filters)

    return {
        "rows": rows,
        "count": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size else 1,
    }


@frappe.whitelist()
def get_school_term_result(name):
    doc = frappe.get_doc("School Term Result", name).as_dict()
    # student_name is NOT a real field on School Term Result itself (same
    # gap already fixed for the list) -- resolved via the same real
    # Student.student_name lookup used in get_school_term_results().
    doc["student_name"] = frappe.db.get_value("Student", doc.get("student"), "student_name")
    return doc


@frappe.whitelist()
def create_school_term_result(data):
    """Only the real reqd fields (student/assessment_group/academic_year/
    academic_term) plus the optional date_of_result_issue are ever sent on
    create -- every other field (subjects, attendance, positions, overall
    grade, ...) is computed entirely by the doctype's own real
    before_insert() hook the moment .insert() runs, exactly as it would be
    via a normal Desk "New School Term Result" form. Not reimplemented or
    pre-filled here."""
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.new_doc("School Term Result")
    doc.student = data.get("student")
    doc.assessment_group = data.get("assessment_group")
    doc.academic_year = data.get("academic_year")
    doc.academic_term = data.get("academic_term")
    doc.date_of_result_issue = data.get("date_of_result_issue")
    doc.insert()
    frappe.db.commit()
    return doc.as_dict()


@frappe.whitelist()
def update_school_term_result(name, data):
    """Every real, non-read_only field can be updated post-creation --
    before_insert() never re-runs on save (only fires on insert), and
    validate() is a real no-op (`pass`), so nothing re-locks or
    re-computes these after the fact. Matches the doctype's own real
    behavior exactly, not an invented restriction."""
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("School Term Result", name)
    doc.update({
        "date_of_result_issue": data.get("date_of_result_issue"),
        "comments__notes": data.get("comments__notes"),
        "class_teacher_comment": data.get("class_teacher_comment"),
        "head_teacher_comment": data.get("head_teacher_comment"),
        # Holiday-aware attendance fields
        "holiday_list_used": data.get("holiday_list_used"),
        "total_workdays": data.get("total_workdays"),
        "weekday_holidays_count": data.get("weekday_holidays_count"),
        "weekday_holiday_details": data.get("weekday_holiday_details"),
        # Student attendance fields
        "number_of_times_school_opened": data.get("number_of_times_school_opened"),
        "number_of_times_present": data.get("number_of_times_present"),
        "number_of_times_absent": data.get("number_of_times_absent"),
        "number_of_times_on_leave": data.get("number_of_times_on_leave"),
        "attendance_percentage": data.get("attendance_percentage"),
        "total_marks_obtained": data.get("total_marks_obtained"),
        "total_max_marks": data.get("total_max_marks"),
        "overall_grade": data.get("overall_grade"),
        "class_position": data.get("class_position"),
        "class_arm_position": data.get("class_arm_position"),
        "term_average": data.get("term_average"),
        "handwriting": data.get("handwriting"),
        "games": data.get("games"),
        "handling_tools": data.get("handling_tools"),
        "musical_skills": data.get("musical_skills"),
        "verbal_fluency": data.get("verbal_fluency"),
        "sport": data.get("sport"),
        "drawing_and_painting": data.get("drawing_and_painting"),
        "punctuality": data.get("punctuality"),
        "politeness": data.get("politeness"),
        "cooperation_with_others": data.get("cooperation_with_others"),
        "helping_others": data.get("helping_others"),
        "health": data.get("health"),
        "attitude_to_school_work": data.get("attitude_to_school_work"),
        "speaking__handwriting": data.get("speaking__handwriting"),
        "neatness": data.get("neatness"),
        "honesty": data.get("honesty"),
        "leadership": data.get("leadership"),
        "emotional_stability": data.get("emotional_stability"),
        "attentiveness": data.get("attentiveness"),
        "perseverance": data.get("perseverance"),
        "subjects": data.get("subjects") or [],
        "assessment_components": data.get("assessment_components") or [],
    })
    doc.save()
    frappe.db.commit()
    return doc.as_dict()


@frappe.whitelist()
def delete_school_term_result(name):
    frappe.delete_doc("School Term Result", name)
    frappe.db.commit()


@frappe.whitelist()
def get_school_print_format():
    """Thin passthrough to the real, already-whitelisted
    education_extension.student_portal_api.get_school_print_format() --
    the SAME function the Student Portal's own real Report.vue calls for
    this exact doctype's print button. Reused directly, not reimplemented.

    Real, load-bearing bug in that function, NOT fixed here (core app
    code): it reads frappe.db.get_single_value("Education Settings",
    "primary_print_format" / "secondary_print_format") -- but neither
    field exists anywhere in Education Settings' own real JSON. Frappe's
    Single storage is a plain key/value table, so this doesn't raise; it
    silently returns None for both, and the function falls back to
    "Standard" every time. The school's ACTUAL configured choice --
    School Settings' own real primary_school_print_format /
    secondary_school_print_format fields (already editable via this
    portal's own School Settings page) -- is never consulted by this
    function at all. In practice, every School Term Result currently
    prints with Frappe's generic "Standard" format regardless of what's
    configured in School Settings, in this portal exactly as in the two
    existing Vue frontends."""
    from education_extension.student_portal_api import get_school_print_format as real_get_school_print_format

    return real_get_school_print_format()


@frappe.whitelist()
def get_students():
    try:
        return frappe.get_list(
            "Student", fields=["name", "student_name"],
            order_by="student_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching students: {str(e)}", "School Term Result API")
        return []


@frappe.whitelist()
def get_assessment_groups():
    """Leaf nodes only (is_group=0) -- Assessment Group is a Tree
    doctype; only leaf nodes are ever referenced by real Assessment
    Result / School Term Result rows."""
    try:
        return frappe.get_list(
            "Assessment Group", filters={"is_group": 0},
            fields=["name", "assessment_group_name"], order_by="name",
        )
    except Exception as e:
        frappe.log_error(f"Error fetching assessment groups: {str(e)}", "School Term Result API")
        return []


@frappe.whitelist()
def get_academic_years():
    try:
        return frappe.get_list(
            "Academic Year", fields=["name"], order_by="year_start_date desc", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching academic years: {str(e)}", "School Term Result API")
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
        frappe.log_error(f"Error fetching academic terms: {str(e)}", "School Term Result API")
        return []


@frappe.whitelist()
def get_student_groups():
    try:
        return frappe.get_list(
            "Student Group", fields=["name", "student_group_name"],
            order_by="student_group_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching class arms: {str(e)}", "School Term Result API")
        return []


@frappe.whitelist()
def get_courses():
    try:
        return frappe.get_list("Course", fields=["name", "course_name"], order_by="course_name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching subjects: {str(e)}", "School Term Result API")
        return []


@frappe.whitelist()
def get_assessment_criteria():
    try:
        return frappe.get_list(
            "Assessment Criteria", fields=["name"], order_by="name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching assessment criteria: {str(e)}", "School Term Result API")
        return []