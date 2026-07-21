import frappe
from frappe.utils import cint
from frappe import _


@frappe.whitelist()
def get_class_arms(page=1, page_size=9, search=None):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    or_filters = []

    if search:
        or_filters = [
            ["student_group_name", "like", f"%{search}%"],
            ["name", "like", f"%{search}%"],
        ]

    groups = frappe.get_all(
        "Student Group",
        fields=[
            "name",
            "student_group_name",
            "academic_year",
            "academic_term",
            "program",
            "batch",
            "course",
            "student_category",
            "max_strength",
            "group_based_on",
            "disabled",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="modified desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count("Student Group", filters=filters)

    for group in groups:
        doc = frappe.get_doc("Student Group", group.name)
        group["students_count"] = len(doc.students)
        group["instructors"] = [
            {
                "instructor": i.instructor,
                "instructor_name": getattr(i, "instructor_name", None),
            }
            for i in doc.instructors
        ] if hasattr(doc, "instructors") else []

    return {
        "rows": groups,
        "count": total,
        "page": page,
        "page_size": page_size,
    }


# @frappe.whitelist()
# def get_class_arm(name):
#     if not name:
#         frappe.throw(_("Student Group name required"))

#     doc = frappe.get_doc("Student Group", name)
#     return doc.as_dict()


@frappe.whitelist()
def get_class_arm(name):
    if not name:
        frappe.throw(_("Student Group name required"))

    doc = frappe.get_doc("Student Group", name)

    data = doc.as_dict()

    students = []

    for row in doc.students:
        student = frappe.db.get_value(
            "Student",
            row.student,
            [
                "student_name",
                "image",
                "gender",
                "student_email_id",
                "student_mobile_number",
            ],
            as_dict=True
        )

        students.append({
            "student": row.student,
            "student_name": student.student_name if student else row.student_name,
            "image": student.image if student else None,
            "gender": student.gender if student else None,
            "email": student.student_email_id if student else None,
            "mobile": student.student_mobile_number if student else None,
            "group_roll_number": row.group_roll_number,
            "active": row.active,
        })

    data["students"] = students

    return data


def _apply_class_arm_fields(doc, data):
    """Shared field-mapping for create/update — keeps both in sync with
    the real Student Group DocType, including both child tables."""

    doc.student_group_name = data.get("student_group_name")
    doc.academic_year = data.get("academic_year")
    doc.academic_term = data.get("academic_term")
    doc.group_based_on = data.get("group_based_on") or "Batch"
    doc.program = data.get("program")
    doc.batch = data.get("batch")
    doc.course = data.get("course")
    doc.student_category = data.get("student_category")
    doc.max_strength = cint(data.get("max_strength") or 0)
    doc.disabled = cint(data.get("disabled") or 0)

    # Instructors (child table)
    doc.set("instructors", [])
    for row in data.get("instructors") or []:
        if not row.get("instructor"):
            continue
        doc.append("instructors", {
            "instructor": row.get("instructor"),
            "instructor_name": row.get("instructor_name"),
        })

    # Students (child table) — manual add/remove from the portal
    doc.set("students", [])
    for row in data.get("students") or []:
        if not row.get("student"):
            continue
        doc.append("students", {
            "student": row.get("student"),
            "student_name": row.get("student_name"),
            "group_roll_number": cint(row.get("group_roll_number") or 0) or None,
            "active": 1 if row.get("active", True) else 0,
        })


@frappe.whitelist()
def create_class_arm(data):
    if isinstance(data, str):
        data = frappe.parse_json(data)

    doc = frappe.new_doc("Student Group")
    _apply_class_arm_fields(doc, data)
    doc.insert()

    return doc.as_dict()


@frappe.whitelist()
def update_class_arm(name, data):
    if not name:
        frappe.throw(_("Class Arm name required"))

    if isinstance(data, str):
        data = frappe.parse_json(data)

    doc = frappe.get_doc("Student Group", name)
    _apply_class_arm_fields(doc, data)
    doc.save()

    return doc.as_dict()

import frappe


@frappe.whitelist()
def get_class_arm_options():
    return {
        "academic_years": frappe.get_all(
            "Academic Year", pluck="name", order_by="name desc"
        ),
        "academic_terms": frappe.get_all(
            "Academic Term", pluck="name", order_by="name"
        ),
        "programs": frappe.get_all(
            "Program", pluck="name", order_by="name"
        ),
        "courses": frappe.get_all(
            "Course", pluck="name", order_by="name"
        ),
        "batches": frappe.get_all(
            "Student Batch Name", pluck="name", order_by="name"
        ),
        "student_categories": frappe.get_all(
            "Student Category", pluck="name", order_by="name"
        ),
        "instructors": frappe.get_all(
            "Instructor",
            fields=["name", "instructor_name"],
            order_by="instructor_name",
        ),
        # NOTE: fine for a single-school portal; if your Student list grows large,
        # swap this for a debounced search endpoint instead of loading everyone.
        "students": frappe.get_all(
            "Student",
            filters={"enabled": 1},
            fields=["name", "student_name"],
            order_by="student_name",
            limit_page_length=1000,
        ),
    }
    
@frappe.whitelist()
def delete_class_arm(name):

    if not name:
        frappe.throw("Class Arm name is required")

    doc = frappe.get_doc(
        "Student Group",
        name
    )

    doc.delete()

    frappe.db.commit()

    return {
        "message": "Class Arm deleted"
    }