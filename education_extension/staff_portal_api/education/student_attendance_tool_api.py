import frappe
from frappe import _


@frappe.whitelist()
def get_student_group_details(student_group):
    """Real fetch_from targets on the Tool doc: academic_year,
    academic_term (both derived from student_group -- only meaningful in
    Student Group mode; Course Schedule mode never populates the Tool's
    own student_group field, so these stay blank there)."""
    if not student_group:
        return None
    return frappe.db.get_value(
        "Student Group", student_group,
        ["academic_year", "academic_term"], as_dict=True,
    )


@frappe.whitelist()
def get_academic_year_bounds(academic_year):
    """Mirrors the real, ACTIVE date-bounds check inside
    education.education.api.mark_attendance() (not the commented-out
    validate_date() in student_attendance.py) -- only fires when
    student_group is set, i.e. Student Group mode; Course Schedule mode
    sends no student_group to mark_attendance() so this check never
    applies there."""
    if not academic_year:
        return {}
    try:
        return frappe.db.get_value(
            "Academic Year", academic_year,
            ["year_start_date", "year_end_date"], as_dict=True,
        ) or {}
    except Exception as e:
        frappe.log_error(f"Error fetching academic year bounds: {str(e)}", "Student Attendance Tool API")
        return {}


@frappe.whitelist()
def get_course_schedule_details(course_schedule):
    """Real fetch targets when based_on == Course Schedule: student_group
    (resolves the roster + academic_year/term preview) and schedule_date
    (the real date Student Attendance's own set_date() will derive
    regardless of what mark_attendance() is sent)."""
    if not course_schedule:
        return None
    return frappe.db.get_value(
        "Course Schedule", course_schedule,
        ["student_group", "schedule_date", "course"], as_dict=True,
    )


@frappe.whitelist()
def get_student_attendance_records(based_on, date=None, student_group=None, course_schedule=None):
    """Thin wrapper around the real, already-whitelisted
    student_attendance_tool.get_student_attendance_records() -- reused
    directly, not reimplemented. Real behavior: resolves the roster via
    Student Group Student (parent=student_group, active=1, ordered by
    group_roll_number -- including that field, which the generic
    get_student_group_students() helper used elsewhere in this app does
    NOT return), then pre-fills each student's status from any existing
    Student Attendance record for this course_schedule (or
    student_group+date with no course_schedule)."""
    from education.education.doctype.student_attendance_tool.student_attendance_tool import (
        get_student_attendance_records as real_get_student_attendance_records,
    )

    try:
        return real_get_student_attendance_records(
            based_on, date=date, student_group=student_group, course_schedule=course_schedule,
        ) or []
    except Exception as e:
        frappe.log_error(f"Error fetching roster: {str(e)}", "Student Attendance Tool API")
        return []


@frappe.whitelist()
def mark_attendance(students_present, students_absent, student_group=None, course_schedule=None, date=None):
    """Thin wrapper around the real, already-whitelisted
    education.education.api.mark_attendance() -- reused directly, not
    reimplemented.

    Real behavior worth knowing, traced from the actual source:
    make_attendance_records() calls frappe.get_doc({"doctype": "Student
    Attendance", ...}) with no "name" key -- in real Frappe this ALWAYS
    constructs a brand-new in-memory document, never a DB lookup, so
    despite the function's own "Creates/Update Attendance Record"
    docstring, it is create-only in practice; the "if not
    student_attendance: frappe.new_doc(...)" fallback is dead code that
    can never execute. Each record is then .save()'d and .submit()'d
    immediately (submitted straight away, no draft stage).

    There is exactly ONE frappe.db.commit(), after BOTH the present and
    absent loops finish, and no per-student try/except anywhere in this
    call chain. So if Student Attendance's own real validate() rejects
    ANY student (duplicate for that date/course_schedule, holiday, wrong
    group, outside Academic Year bounds), the whole request raises before
    that commit is ever reached -- Frappe's own request-level rollback
    (frappe/app.py: rollback=True by default, sync_database()/commit only
    runs in the try's else clause, finally calls db.rollback() otherwise)
    then reverts every .save()/.submit() already done earlier in the SAME
    request. This is genuinely atomic (all-or-nothing), not
    partial-success-tolerant -- unlike Subject Scheduling Tool's own
    per-date OverlapError-only catch, there is no exception handling
    at all here, so ANY single student's validation failure aborts
    marking for the entire class."""
    from education.education.api import mark_attendance as real_mark_attendance

    return real_mark_attendance(
        students_present=students_present,
        students_absent=students_absent,
        course_schedule=course_schedule,
        student_group=student_group,
        date=date,
    )


@frappe.whitelist()
def get_student_groups(group_based_on=None):
    """Mirrors the real client script's set_query on student_group:
    filters: { group_based_on: doc.group_based_on, disabled: 0 }."""
    try:
        filters = {"disabled": 0}
        if group_based_on:
            filters["group_based_on"] = group_based_on
        return frappe.get_list(
            "Student Group", fields=["name", "student_group_name"],
            filters=filters, order_by="student_group_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching class arms: {str(e)}", "Student Attendance Tool API")
        return []


@frappe.whitelist()
def get_course_schedules():
    try:
        return frappe.get_list(
            "Course Schedule", fields=["name", "title"],
            order_by="creation desc", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching subject schedules: {str(e)}", "Student Attendance Tool API")
        return []
