import json

import frappe
from frappe import _
from frappe.utils import cint


@frappe.whitelist()
def get_subject_enrollments(
    page=1,
    page_size=20,
    search=None,
    student=None,
    course=None,
    program_enrollment=None,
):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    if student:
        filters["student"] = student
    if course:
        filters["course"] = course
    if program_enrollment:
        filters["program_enrollment"] = program_enrollment

    or_filters = []
    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["student_name", "like", f"%{search}%"],
            ["course", "like", f"%{search}%"],
        ]

    rows = frappe.get_list(
        "Course Enrollment",
        fields=[
            "name",
            "student",
            "student_name",
            "course",
            "program",
            "program_enrollment",
            "enrollment_date",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="creation desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count("Course Enrollment", filters=filters)

    return {
        "rows": rows,
        "count": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (
            (total + page_size - 1) // page_size
            if page_size else 1
        ),
    }


@frappe.whitelist()
def get_subject_enrollment(name):
    if not name:
        frappe.throw(_("Subject Enrollment name is required"))

    doc = frappe.get_doc("Course Enrollment", name)
    return doc.as_dict()


@frappe.whitelist()
def create_subject_enrollment(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc({
        "doctype": "Course Enrollment",
        "student": data.get("student"),
        "course": data.get("course"),
        "program_enrollment": data.get("program_enrollment"),
        "enrollment_date": data.get("enrollment_date"),
    })

    # doc.validate() (duplicate student+course+program_enrollment check)
    # runs automatically on insert
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def update_subject_enrollment(name, data):
    if not name:
        frappe.throw(_("Subject Enrollment name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    # student, course, program_enrollment, and enrollment_date are all
    # set_only_once: 1 on the real doctype -- every field that isn't a
    # read-only fetch is locked after creation, so there is nothing to
    # update. The frontend shows all of them locked in edit mode.
    doc = frappe.get_doc("Course Enrollment", name)
    return doc.as_dict()


@frappe.whitelist()
def delete_subject_enrollment(name):
    if not name:
        frappe.throw(_("Subject Enrollment name is required"))

    frappe.delete_doc("Course Enrollment", name)
    frappe.db.commit()

    return {"message": "Subject Enrollment deleted"}


@frappe.whitelist()
def get_students():
    try:
        return frappe.get_list(
            "Student", fields=["name", "student_name"],
            order_by="student_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching students: {str(e)}", "Subject Enrollment API")
        return []


@frappe.whitelist()
def get_courses():
    try:
        return frappe.get_list(
            "Course", fields=["name", "course_name"],
            order_by="course_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching courses: {str(e)}", "Subject Enrollment API")
        return []


@frappe.whitelist()
def get_program_enrollments():
    try:
        return frappe.get_list(
            "Program Enrollment", fields=["name", "student_name", "program"],
            order_by="creation desc", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching class enrollments: {str(e)}", "Subject Enrollment API")
        return []
