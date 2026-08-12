import json

import frappe
from frappe import _
from frappe.utils import cint


@frappe.whitelist()
def get_class_enrollments(
    page=1,
    page_size=20,
    search=None,
    student=None,
    program=None,
    academic_year=None,
    academic_term=None,
):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    if student:
        filters["student"] = student
    if program:
        filters["program"] = program
    if academic_year:
        filters["academic_year"] = academic_year
    if academic_term:
        filters["academic_term"] = academic_term

    or_filters = []
    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["student_name", "like", f"%{search}%"],
        ]

    rows = frappe.get_all(
        "Program Enrollment",
        fields=[
            "name",
            "student",
            "student_name",
            "program",
            "academic_year",
            "academic_term",
            "enrollment_date",
            "image",
            "docstatus",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="creation desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count("Program Enrollment", filters=filters)

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
def get_class_enrollment(name):
    if not name:
        frappe.throw(_("Class Enrollment name is required"))

    doc = frappe.get_doc("Program Enrollment", name)
    result = doc.as_dict()

    for child_table in ("courses", "fees"):
        if result.get(child_table):
            if not isinstance(result[child_table], list):
                try:
                    result[child_table] = frappe.parse_json(result[child_table])
                except Exception:
                    result[child_table] = []
        else:
            result[child_table] = []

    return result


@frappe.whitelist()
def create_class_enrollment(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc({
        "doctype": "Program Enrollment",
        "student": data.get("student"),
        "program": data.get("program"),
        "academic_year": data.get("academic_year"),
        "academic_term": data.get("academic_term"),
        "enrollment_date": data.get("enrollment_date"),
        "student_category": data.get("student_category"),
        "student_batch_name": data.get("student_batch_name"),
        "school_house": data.get("school_house"),
        "boarding_student": data.get("boarding_student", 0),
        "image": data.get("image"),
    })

    for row in data.get("courses", []):
        if row.get("course"):
            doc.append("courses", {"course": row.get("course")})

    for row in data.get("fees", []):
        if row.get("fee_schedule"):
            doc.append("fees", {"fee_schedule": row.get("fee_schedule")})

    # doc.validate() runs automatically on insert:
    #  - duplicate enrollment check (same student/program/academic_year/
    #    academic_term with an active docstatus)
    #  - if no courses were added above, auto-fills "courses" from the
    #    Class's own required Subjects (Program Course, required=1)
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def update_class_enrollment(name, data):
    if not name:
        frappe.throw(_("Class Enrollment name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Program Enrollment", name)

    for field in (
        "student", "program", "academic_year", "academic_term",
        "enrollment_date", "student_category", "student_batch_name",
        "school_house", "boarding_student", "image",
    ):
        if field in data:
            doc.set(field, data[field])

    if "courses" in data:
        doc.set("courses", [])
        for row in data.get("courses", []):
            if row.get("course"):
                doc.append("courses", {"course": row.get("course")})

    if "fees" in data:
        doc.set("fees", [])
        for row in data.get("fees", []):
            if row.get("fee_schedule"):
                doc.append("fees", {"fee_schedule": row.get("fee_schedule")})

    # Frappe itself enforces which fields remain editable once submitted
    # (only those marked allow_on_submit in the doctype -- student_batch_name,
    # school_house, courses); attempting to change anything else on a
    # submitted doc raises a clear error surfaced via getErrorMessage().
    doc.save()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def delete_class_enrollment(name):
    if not name:
        frappe.throw(_("Class Enrollment name is required"))

    doc = frappe.get_doc("Program Enrollment", name)

    if doc.docstatus == 1:
        frappe.throw(_("Cannot delete a submitted document. Please cancel it first."))

    doc.delete()
    frappe.db.commit()

    return {"message": "Class Enrollment deleted"}


@frappe.whitelist()
def submit_class_enrollment(name):
    if not name:
        frappe.throw(_("Class Enrollment name is required"))

    doc = frappe.get_doc("Program Enrollment", name)

    if doc.docstatus == 1:
        frappe.throw(_("Document is already submitted"))
    if doc.docstatus == 2:
        frappe.throw(_("Cannot submit a cancelled document"))

    doc.submit()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def cancel_class_enrollment(name):
    if not name:
        frappe.throw(_("Class Enrollment name is required"))

    doc = frappe.get_doc("Program Enrollment", name)

    if doc.docstatus == 2:
        frappe.throw(_("Document is already cancelled"))
    if doc.docstatus == 0:
        frappe.throw(_("Cannot cancel a draft document"))

    doc.cancel()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def get_connections(class_enrollment):
    """Connection counts shown on the Class Enrollment profile page,
    matching program_enrollment.json's own "links" array exactly."""
    if not class_enrollment:
        frappe.throw(_("Class Enrollment name is required"))

    try:
        return {
            "course_enrollments": frappe.db.count(
                "Course Enrollment", {"program_enrollment": class_enrollment}
            ),
        }
    except Exception as e:
        frappe.log_error(
            f"Error fetching connections for {class_enrollment}: {str(e)}",
            "Class Enrollment API",
        )
        return {}


@frappe.whitelist()
def get_students():
    try:
        return frappe.get_all(
            "Student", fields=["name", "student_name"],
            order_by="student_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching students: {str(e)}", "Class Enrollment API")
        return []


@frappe.whitelist()
def get_programs():
    try:
        return frappe.get_all("Program", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching programs: {str(e)}", "Class Enrollment API")
        return []


@frappe.whitelist()
def get_academic_years():
    try:
        return frappe.get_all(
            "Academic Year", fields=["name"], order_by="name desc", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching academic years: {str(e)}", "Class Enrollment API")
        return []


@frappe.whitelist()
def get_academic_terms(academic_year=None):
    try:
        filters = {}
        if academic_year:
            filters["academic_year"] = academic_year
        return frappe.get_all(
            "Academic Term", fields=["name"], filters=filters,
            order_by="name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching academic terms: {str(e)}", "Class Enrollment API")
        return []


@frappe.whitelist()
def get_student_categories():
    try:
        return frappe.get_all("Student Category", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching student categories: {str(e)}", "Class Enrollment API")
        return []


@frappe.whitelist()
def get_student_batches():
    try:
        return frappe.get_all("Student Batch Name", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching student batches: {str(e)}", "Class Enrollment API")
        return []


@frappe.whitelist()
def get_school_houses():
    try:
        return frappe.get_all("School House", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching school houses: {str(e)}", "Class Enrollment API")
        return []


@frappe.whitelist()
def get_fee_schedules():
    try:
        return frappe.get_all(
            "Fee Schedule",
            fields=["name", "academic_term", "student_category", "due_date", "total_amount"],
            order_by="name desc",
            limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching fee schedules: {str(e)}", "Class Enrollment API")
        return []


@frappe.whitelist()
def get_courses_for_program(program=None):
    """Subjects available for the selected Class -- mirrors the real
    controller logic in program_enrollment.py's get_courses()/
    get_program_courses(), which both read the Class's own Program
    Course child table rather than the global Course list."""
    if not program:
        return []
    try:
        return frappe.get_all(
            "Program Course",
            filters={"parent": program},
            fields=["course", "course_name", "required"],
            order_by="idx",
        )
    except Exception as e:
        frappe.log_error(f"Error fetching courses for program: {str(e)}", "Class Enrollment API")
        return []
