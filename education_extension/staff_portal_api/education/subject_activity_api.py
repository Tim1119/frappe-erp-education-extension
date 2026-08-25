import frappe
from frappe import _
from frappe.utils import cint

# Course Activity is a real, permanently-locked doctype: every field
# carries set_only_once: 1, and its only real creation path is
# Course Enrollment.add_activity() (course_enrollment.py), called with
# ignore_permissions=True whenever a student views an Article/Video --
# not a form anyone fills in by hand. This module is deliberately
# List + Profile only, no create/update, matching that reality (same
# reasoning already applied to the Fees module earlier in this project).


@frappe.whitelist()
def get_subject_activities(
    page=1,
    page_size=20,
    search=None,
    student=None,
    course=None,
    content_type=None,
):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    if student:
        filters["student"] = student
    if course:
        filters["course"] = course
    if content_type:
        filters["content_type"] = content_type

    or_filters = []
    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["student", "like", f"%{search}%"],
            ["course", "like", f"%{search}%"],
        ]

    rows = frappe.get_all(
        "Course Activity",
        fields=["name", "enrollment", "course", "student", "content_type", "content", "activity_date"],
        filters=filters,
        or_filters=or_filters,
        order_by="creation desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count("Course Activity", filters=filters)

    return {
        "rows": rows,
        "count": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size else 1,
    }


@frappe.whitelist()
def get_subject_activity(name):
    if not name:
        frappe.throw(_("Subject Activity name is required"))

    doc = frappe.get_doc("Course Activity", name)
    return doc.as_dict()


@frappe.whitelist()
def delete_subject_activity(name):
    if not name:
        frappe.throw(_("Subject Activity name is required"))

    frappe.delete_doc("Course Activity", name)
    frappe.db.commit()

    return {"message": "Subject Activity deleted"}


@frappe.whitelist()
def get_students():
    try:
        return frappe.get_list(
            "Student", fields=["name", "student_name"],
            order_by="student_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching students: {str(e)}", "Subject Activity API")
        return []


@frappe.whitelist()
def get_courses():
    try:
        return frappe.get_list(
            "Course", fields=["name", "course_name"],
            order_by="course_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching subjects: {str(e)}", "Subject Activity API")
        return []
