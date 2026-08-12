import frappe
from frappe import _
from frappe.utils import cint

# Quiz Activity is architecturally identical to Course Activity: every
# field is set_only_once, and its only real creation path is
# Course Enrollment.add_quiz_activity() (course_enrollment.py:52),
# called from education.education.utils's whitelisted quiz-submission
# endpoint -- gated by the same has_super_access() check that excludes
# every staff role (Administrator/Instructor/Education Manager/System
# Manager, plus a real-but-typo'd "Academic User" entry that never
# matches the real "Academics User" role) before it ever reaches a real
# student session. Confirmed independently against THIS doctype's own
# JSON (no doctype-level read_only, but Instructor's permission row has
# no create/write/delete -- same shape as Course Activity), not assumed
# from architectural similarity alone. List + Profile only, no
# create/update.


@frappe.whitelist()
def get_quiz_activities(
    page=1,
    page_size=20,
    search=None,
    student=None,
    course=None,
    quiz=None,
    status=None,
):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    if student:
        filters["student"] = student
    if course:
        filters["course"] = course
    if quiz:
        filters["quiz"] = quiz
    if status:
        filters["status"] = status

    or_filters = []
    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["student", "like", f"%{search}%"],
            ["quiz", "like", f"%{search}%"],
        ]

    rows = frappe.get_all(
        "Quiz Activity",
        fields=[
            "name", "enrollment", "student", "course", "quiz",
            "status", "score", "time_taken", "activity_date",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="creation desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count("Quiz Activity", filters=filters)

    return {
        "rows": rows,
        "count": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size else 1,
    }


@frappe.whitelist()
def get_quiz_activity(name):
    if not name:
        frappe.throw(_("Quiz Activity name is required"))

    doc = frappe.get_doc("Quiz Activity", name)
    return doc.as_dict()


@frappe.whitelist()
def delete_quiz_activity(name):
    if not name:
        frappe.throw(_("Quiz Activity name is required"))

    frappe.delete_doc("Quiz Activity", name)
    frappe.db.commit()

    return {"message": "Quiz Activity deleted"}


@frappe.whitelist()
def get_students():
    try:
        return frappe.get_all(
            "Student", fields=["name", "student_name"],
            order_by="student_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching students: {str(e)}", "Quiz Activity API")
        return []


@frappe.whitelist()
def get_courses():
    try:
        return frappe.get_all(
            "Course", fields=["name", "course_name"],
            order_by="course_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching subjects: {str(e)}", "Quiz Activity API")
        return []


@frappe.whitelist()
def get_quizzes():
    try:
        return frappe.get_all(
            "Quiz", fields=["name", "title"],
            order_by="title", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching quizzes: {str(e)}", "Quiz Activity API")
        return []
