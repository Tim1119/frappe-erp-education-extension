import json

import frappe
from frappe import _
from frappe.utils import cint


@frappe.whitelist()
def get_academic_years(page=1, page_size=20, search=None):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}

    or_filters = []
    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["academic_year_name", "like", f"%{search}%"],
        ]

    rows = frappe.get_all(
        "Academic Year",
        fields=["name", "academic_year_name", "year_start_date", "year_end_date"],
        filters=filters,
        or_filters=or_filters,
        order_by="creation desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count("Academic Year", filters=filters)

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
def get_academic_year(name):
    if not name:
        frappe.throw(_("Academic Year name is required"))

    doc = frappe.get_doc("Academic Year", name)
    return doc.as_dict()


@frappe.whitelist()
def create_academic_year(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc({
        "doctype": "Academic Year",
        "academic_year_name": data.get("academic_year_name"),
        "year_start_date": data.get("year_start_date"),
        "year_end_date": data.get("year_end_date"),
    })

    # doc.validate() (year_start_date <= year_end_date check) runs
    # automatically on insert
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def update_academic_year(name, data):
    if not name:
        frappe.throw(_("Academic Year name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Academic Year", name)

    # academic_year_name drives the docname (autoname) -- the frontend
    # locks this field when editing. Dates remain editable.
    for field in ("year_start_date", "year_end_date"):
        if field in data:
            doc.set(field, data[field])

    doc.save()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def delete_academic_year(name):
    if not name:
        frappe.throw(_("Academic Year name is required"))

    frappe.delete_doc("Academic Year", name)
    frappe.db.commit()

    return {"message": "Academic Year deleted"}


@frappe.whitelist()
def get_connections(academic_year):
    """Connection counts shown on the Academic Year profile page, matching
    the `links` array in academic_year.json."""
    if not academic_year:
        frappe.throw(_("Academic Year name is required"))

    try:
        return {
            "student_admissions": frappe.db.count(
                "Student Admission", {"academic_year": academic_year}
            ),
            "student_applicants": frappe.db.count(
                "Student Applicant", {"academic_year": academic_year}
            ),
            "class_arms": frappe.db.count(
                "Student Group", {"academic_year": academic_year}
            ),
            "student_logs": frappe.db.count(
                "Student Log", {"academic_year": academic_year}
            ),
            "academic_terms": frappe.db.count(
                "Academic Term", {"academic_year": academic_year}
            ),
            "class_enrollments": frappe.db.count(
                "Program Enrollment", {"academic_year": academic_year}
            ),
            "assessment_plans": frappe.db.count(
                "Assessment Plan", {"academic_year": academic_year}
            ),
            "assessment_results": frappe.db.count(
                "Assessment Result", {"academic_year": academic_year}
            ),
            "fee_schedules": frappe.db.count(
                "Fee Schedule", {"academic_year": academic_year}
            ),
            "fee_structures": frappe.db.count(
                "Fee Structure", {"academic_year": academic_year}
            ),
        }
    except Exception as e:
        frappe.log_error(
            f"Error fetching connections for {academic_year}: {str(e)}",
            "Academic Year API",
        )
        return {}
