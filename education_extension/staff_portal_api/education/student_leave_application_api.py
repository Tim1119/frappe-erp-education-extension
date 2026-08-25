import json

import frappe
from frappe import _
from frappe.utils import cint


@frappe.whitelist()
def get_student_leave_applications(
    page=1,
    page_size=20,
    search=None,
    student=None,
    student_group=None,
    from_date=None,
):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    if student:
        filters["student"] = student
    if student_group:
        filters["student_group"] = student_group
    if from_date:
        filters["from_date"] = from_date

    or_filters = []
    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["student_name", "like", f"%{search}%"],
        ]

    rows = frappe.get_list(
        "Student Leave Application",
        fields=[
            "name",
            "student",
            "student_name",
            "from_date",
            "to_date",
            "total_leave_days",
            "attendance_based_on",
            "student_group",
            "course_schedule",
            "docstatus",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="creation desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count("Student Leave Application", filters=filters)

    return {
        "rows": rows,
        "count": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size else 1,
    }


@frappe.whitelist()
def get_student_leave_application(name):
    if not name:
        frappe.throw(_("Student Leave Application name is required"))

    doc = frappe.get_doc("Student Leave Application", name)
    return doc.as_dict()


@frappe.whitelist()
def create_student_leave_application(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc({
        "doctype": "Student Leave Application",
        "student": data.get("student"),
        "from_date": data.get("from_date"),
        "to_date": data.get("to_date"),
        "attendance_based_on": data.get("attendance_based_on") or "Student Group",
        "student_group": data.get("student_group"),
        "course_schedule": data.get("course_schedule"),
        "mark_as_present": data.get("mark_as_present") or 0,
        "reason": data.get("reason"),
    })

    # doc.validate() runs automatically on insert: recomputes
    # total_leave_days for real (calendar days in range minus the school's
    # Holiday List days -- a live query, not duplicated here beyond the
    # raw calendar-day preview shown client-side), blocks overlapping
    # leave applications for the same student (live query), and checks
    # from_date <= to_date. Errors surface via getErrorMessage().
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def update_student_leave_application(name, data):
    if not name:
        frappe.throw(_("Student Leave Application name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Student Leave Application", name)

    for field in (
        "student", "from_date", "to_date", "attendance_based_on",
        "student_group", "course_schedule", "mark_as_present", "reason",
    ):
        if field in data:
            doc.set(field, data[field])

    # No field on this doctype is allow_on_submit (checked the real JSON --
    # none carry that flag), so once submitted every field is locked by
    # Frappe itself; the frontend blocks reaching this form at all for a
    # submitted record (see StudentLeaveApplicationFormPage.jsx's redirect
    # guard).
    doc.save()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def delete_student_leave_application(name):
    if not name:
        frappe.throw(_("Student Leave Application name is required"))

    doc = frappe.get_doc("Student Leave Application", name)

    if doc.docstatus == 1:
        frappe.throw(_("Cannot delete a submitted document. Please cancel it first."))

    doc.delete()
    frappe.db.commit()

    return {"message": "Student Leave Application deleted"}


@frappe.whitelist()
def submit_student_leave_application(name):
    """Submitting IS the real approval action on this doctype -- there is
    no separate status field or approve/reject method. on_submit() calls
    update_attendance(), which creates/updates a real Student Attendance
    record (status "Leave", or "Present" if mark_as_present is checked)
    for every non-holiday day in the range, linking each one back via its
    own leave_application field."""
    if not name:
        frappe.throw(_("Student Leave Application name is required"))

    doc = frappe.get_doc("Student Leave Application", name)

    if doc.docstatus == 1:
        frappe.throw(_("Document is already submitted"))
    if doc.docstatus == 2:
        frappe.throw(_("Cannot submit a cancelled document"))

    doc.submit()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def cancel_student_leave_application(name):
    """on_cancel() calls cancel_attendance(), which cancels every Student
    Attendance record created/updated by the matching submit above (any
    non-cancelled attendance for this student within the date range)."""
    if not name:
        frappe.throw(_("Student Leave Application name is required"))

    doc = frappe.get_doc("Student Leave Application", name)

    if doc.docstatus == 2:
        frappe.throw(_("Document is already cancelled"))
    if doc.docstatus == 0:
        frappe.throw(_("Cannot cancel a draft document"))

    doc.cancel()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def get_connections(leave_application):
    """Mirrors student_leave_application_dashboard.py's get_data():
    fieldname 'leave_application', transactions -> Student Attendance."""
    if not leave_application:
        frappe.throw(_("Student Leave Application name is required"))

    return {
        "student_attendance": frappe.db.count(
            "Student Attendance", {"leave_application": leave_application}
        ),
    }


@frappe.whitelist()
def get_students():
    try:
        return frappe.get_list(
            "Student", fields=["name", "student_name"],
            order_by="student_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching students: {str(e)}", "Student Leave Application API")
        return []


@frappe.whitelist()
def get_class_arms():
    """Unfiltered flat list for the list page's Toolbar filter -- distinct
    from get_student_groups_for_student() below, which is scoped to a
    single student for the create/edit form's real set_query mirror."""
    try:
        return frappe.get_list(
            "Student Group", fields=["name", "student_group_name"],
            order_by="student_group_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching class arms: {str(e)}", "Student Leave Application API")
        return []


@frappe.whitelist()
def get_student_groups_for_student(student):
    """Mirrors the real client script exactly: on student change, Desk
    calls this doctype's own already-whitelisted get_student_groups()
    (Student Group Student rows for this student) and uses the result to
    filter BOTH student_group and course_schedule options. Reused
    directly, not reimplemented."""
    if not student:
        return []

    from education.education.doctype.student_leave_application.student_leave_application import (
        get_student_groups,
    )

    try:
        group_names = get_student_groups(student) or []
        if not group_names:
            return []
        return frappe.get_list(
            "Student Group",
            fields=["name", "student_group_name"],
            filters={"name": ("in", group_names)},
            order_by="student_group_name",
        )
    except Exception as e:
        frappe.log_error(f"Error fetching class arms for student: {str(e)}", "Student Leave Application API")
        return []


@frappe.whitelist()
def get_course_schedules_for_student(student):
    """Mirrors the real client script's course_schedule set_query:
    filters: { student_group: ['in', <this student's groups>] } -- the
    same real get_student_groups() result used for the class arm picker
    above, applied to Course Schedule instead."""
    if not student:
        return []

    from education.education.doctype.student_leave_application.student_leave_application import (
        get_student_groups,
    )

    try:
        group_names = get_student_groups(student) or []
        if not group_names:
            return []
        return frappe.get_list(
            "Course Schedule",
            fields=["name", "title", "student_group"],
            filters={"student_group": ("in", group_names)},
            order_by="creation desc",
        )
    except Exception as e:
        frappe.log_error(f"Error fetching subject schedules for student: {str(e)}", "Student Leave Application API")
        return []
