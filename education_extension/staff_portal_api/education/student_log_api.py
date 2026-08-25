import json

import frappe
from frappe import _
from frappe.utils import cint


@frappe.whitelist()
def get_student_logs(
    page=1,
    page_size=20,
    search=None,
    student=None,
    academic_year=None,
    academic_term=None,
    program=None,
    type=None,
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
    if program:
        filters["program"] = program
    if type:
        filters["type"] = type

    or_filters = []
    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["student_name", "like", f"%{search}%"],
            ["log", "like", f"%{search}%"],
        ]

    rows = frappe.get_list(
        "Student Log",
        fields=[
            "name",
            "student",
            "student_name",
            "type",
            "date",
            "academic_year",
            "academic_term",
            "program",
            "student_batch",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="creation desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count("Student Log", filters=filters)

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
def get_student_log(name):
    if not name:
        frappe.throw(_("Student Log name is required"))

    doc = frappe.get_doc("Student Log", name)
    return doc.as_dict()


@frappe.whitelist()
def create_student_log(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc({
        "doctype": "Student Log",
        "student": data.get("student"),
        "type": data.get("type"),
        "date": data.get("date"),
        "academic_year": data.get("academic_year"),
        "academic_term": data.get("academic_term"),
        "program": data.get("program"),
        "student_batch": data.get("student_batch"),
        "log": data.get("log"),
    })

    doc.insert()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def update_student_log(name, data):
    if not name:
        frappe.throw(_("Student Log name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Student Log", name)

    for field in ("student", "type", "date", "academic_year", "academic_term", "program", "student_batch", "log"):
        if field in data:
            doc.set(field, data[field])

    doc.save()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def delete_student_log(name):
    if not name:
        frappe.throw(_("Student Log name is required"))

    frappe.delete_doc("Student Log", name)
    frappe.db.commit()

    return {"message": "Student Log deleted"}


@frappe.whitelist()
def get_students():
    try:
        return frappe.get_list(
            "Student",
            fields=["name", "student_name"],
            order_by="student_name",
            limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching students: {str(e)}", "Student Log API")
        return []


@frappe.whitelist()
def get_academic_years():
    try:
        return frappe.get_list(
            "Academic Year",
            fields=["name"],
            order_by="name desc",
            limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching academic years: {str(e)}", "Student Log API")
        return []


@frappe.whitelist()
def get_academic_terms(academic_year=None):
    try:
        filters = {}
        if academic_year:
            filters["academic_year"] = academic_year
        return frappe.get_list(
            "Academic Term",
            fields=["name"],
            filters=filters,
            order_by="name",
            limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching academic terms: {str(e)}", "Student Log API")
        return []


@frappe.whitelist()
def get_programs():
    try:
        return frappe.get_list(
            "Program",
            fields=["name"],
            order_by="name",
            limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching programs: {str(e)}", "Student Log API")
        return []


@frappe.whitelist()
def get_student_batches():
    try:
        return frappe.get_list(
            "Student Batch Name",
            fields=["name"],
            order_by="name",
            limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching student batches: {str(e)}", "Student Log API")
        return []
