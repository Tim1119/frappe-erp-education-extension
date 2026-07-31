import json

import frappe
from frappe import _
from frappe.utils import cint

STATUS_OPTIONS = ["Present", "Absent", "Leave"]


@frappe.whitelist()
def get_student_attendance_list(
    page=1,
    page_size=20,
    search=None,
    student=None,
    student_group=None,
    course_schedule=None,
    status=None,
    leave_application=None,
):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    if student:
        filters["student"] = student
    if student_group:
        filters["student_group"] = student_group
    if course_schedule:
        filters["course_schedule"] = course_schedule
    if status:
        filters["status"] = status
    if leave_application:
        filters["leave_application"] = leave_application

    or_filters = []
    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["student_name", "like", f"%{search}%"],
        ]

    rows = frappe.get_all(
        "Student Attendance",
        fields=[
            "name",
            "student",
            "student_name",
            "student_group",
            "course_schedule",
            "date",
            "status",
            "docstatus",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="creation desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count("Student Attendance", filters=filters)

    return {
        "rows": rows,
        "count": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size else 1,
    }


@frappe.whitelist()
def get_student_attendance(name):
    if not name:
        frappe.throw(_("Student Attendance name is required"))

    doc = frappe.get_doc("Student Attendance", name)
    return doc.as_dict()


@frappe.whitelist()
def create_student_attendance(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc({
        "doctype": "Student Attendance",
        "student": data.get("student"),
        "course_schedule": data.get("course_schedule"),
        "student_group": data.get("student_group"),
        "date": data.get("date"),
        "status": data.get("status") or "Present",
    })
    # When course_schedule is set, the controller's set_date()/
    # set_student_group() unconditionally overwrite date/student_group from
    # the Course Schedule record on every save -- whatever is sent for
    # those two is only meaningful when course_schedule is empty. Not
    # duplicated here; the frontend locks those fields as a read-only
    # preview whenever course_schedule is chosen.

    # doc.validate() runs automatically on insert: requires student_group
    # OR course_schedule, confirms the student actually belongs to the
    # resolved Student Group (get_student_group_students(), the same real
    # function the roster picker below reuses), blocks a duplicate record
    # (per student+course_schedule if set, else per student+student_group+
    # date), and blocks marking attendance on a holiday -- all live-query
    # checks, not duplicated here; errors surface via getErrorMessage().
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def update_student_attendance(name, data):
    if not name:
        frappe.throw(_("Student Attendance name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Student Attendance", name)

    # status is the ONLY allow_on_submit field on this doctype (checked
    # the real JSON) -- once submitted, Frappe itself rejects any actual
    # change to the other fields below, so this can pass all of them
    # through unconditionally without special-casing submitted vs draft.
    for field in ("student", "course_schedule", "student_group", "date", "status"):
        if field in data:
            doc.set(field, data[field])

    doc.save()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def delete_student_attendance(name):
    if not name:
        frappe.throw(_("Student Attendance name is required"))

    doc = frappe.get_doc("Student Attendance", name)

    if doc.docstatus == 1:
        frappe.throw(_("Cannot delete a submitted document. Please cancel it first."))

    doc.delete()
    frappe.db.commit()

    return {"message": "Student Attendance deleted"}


@frappe.whitelist()
def submit_student_attendance(name):
    if not name:
        frappe.throw(_("Student Attendance name is required"))

    doc = frappe.get_doc("Student Attendance", name)

    if doc.docstatus == 1:
        frappe.throw(_("Document is already submitted"))
    if doc.docstatus == 2:
        frappe.throw(_("Cannot submit a cancelled document"))

    doc.submit()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def cancel_student_attendance(name):
    if not name:
        frappe.throw(_("Student Attendance name is required"))

    doc = frappe.get_doc("Student Attendance", name)

    if doc.docstatus == 2:
        frappe.throw(_("Document is already cancelled"))
    if doc.docstatus == 0:
        frappe.throw(_("Cannot cancel a draft document"))

    doc.cancel()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def get_course_schedules():
    try:
        return frappe.get_all(
            "Course Schedule", fields=["name", "title"],
            order_by="creation desc", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching subject schedules: {str(e)}", "Student Attendance API")
        return []


@frappe.whitelist()
def get_course_schedule_details(course_schedule):
    """Mirrors the controller's set_date()/set_student_group(): the
    Course Schedule's own schedule_date/student_group are what will
    unconditionally get written onto this record on save."""
    if not course_schedule:
        return None
    return frappe.db.get_value(
        "Course Schedule", course_schedule,
        ["student_group", "schedule_date", "course"], as_dict=True,
    )


@frappe.whitelist()
def get_student_groups():
    try:
        return frappe.get_all(
            "Student Group", fields=["name", "student_group_name"],
            order_by="student_group_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching class arms: {str(e)}", "Student Attendance API")
        return []


@frappe.whitelist()
def get_program_for_student_group(student_group):
    """Mirrors link_nvfk's fetch_from: student_group.program (labeled
    "Program" in the real JSON despite the auto-generated fieldname)."""
    if not student_group:
        return None
    return frappe.db.get_value("Student Group", student_group, "program")


@frappe.whitelist()
def get_students_for_class_arm(student_group):
    """The Student picker must only offer students actually enrolled in
    the resolved Class Arm -- the exact real roster
    validate_student()/get_student_group_students() itself checks
    against on save. Reuses the real, already-whitelisted
    education.education.api.get_student_group_students() directly,
    same mechanism already reused for Assessment Result's Student
    picker (not rebuilt a third time)."""
    if not student_group:
        return []

    from education.education.api import get_student_group_students

    try:
        rows = get_student_group_students(student_group)
        # get_student_group_students() returns {student, student_name} --
        # real Student Group Student fieldnames. SearchableSelect keys
        # off `.name` for both its React list key and onChange's value.
        return [
            {"name": row.get("student"), "student_name": row.get("student_name")}
            for row in rows
        ]
    except Exception as e:
        frappe.log_error(f"Error fetching class arm roster: {str(e)}", "Student Attendance API")
        return []
