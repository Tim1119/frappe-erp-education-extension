import json

import frappe
from frappe import _
from frappe.utils import cint


@frappe.whitelist()
def get_academic_terms(
    page=1,
    page_size=20,
    search=None,
    academic_year=None,
):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    if academic_year:
        filters["academic_year"] = academic_year

    or_filters = []
    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["term_name", "like", f"%{search}%"],
            ["title", "like", f"%{search}%"],
        ]

    rows = frappe.get_list(
        "Academic Term",
        fields=[
            "name",
            "title",
            "academic_year",
            "term_name",
            "term_start_date",
            "term_end_date",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="creation desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count("Academic Term", filters=filters)

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
def get_academic_term(name):
    if not name:
        frappe.throw(_("Academic Term name is required"))

    doc = frappe.get_doc("Academic Term", name)
    return doc.as_dict()


@frappe.whitelist()
def create_academic_term(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc({
        "doctype": "Academic Term",
        "academic_year": data.get("academic_year"),
        "term_name": data.get("term_name"),
        "term_start_date": data.get("term_start_date"),
        "term_end_date": data.get("term_end_date"),
    })

    # doc.validate() (duplication / date checks) runs automatically on insert
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def update_academic_term(name, data):
    if not name:
        frappe.throw(_("Academic Term name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Academic Term", name)

    # academic_year / term_name drive the docname (autoname) — changing
    # them post-creation would desync name vs title, so the frontend
    # locks those fields when editing. Dates remain editable.
    for field in ("term_start_date", "term_end_date"):
        if field in data:
            doc.set(field, data[field])

    doc.save()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def delete_academic_term(name):
    if not name:
        frappe.throw(_("Academic Term name is required"))

    frappe.delete_doc("Academic Term", name)
    frappe.db.commit()

    return {"message": "Academic Term deleted"}


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
        frappe.log_error(f"Error fetching academic years: {str(e)}", "Academic Term API")
        return []


@frappe.whitelist()
def get_academic_year_dates(academic_year):
    """Returns an Academic Year's start/end dates, used by the frontend to
    show the valid range and validate term dates before submission."""
    if not academic_year:
        return None

    return frappe.db.get_value(
        "Academic Year",
        academic_year,
        ["year_start_date", "year_end_date"],
        as_dict=True,
    )


@frappe.whitelist()
def get_connections(academic_term):
    """Connection counts shown on the Academic Term profile page."""
    if not academic_term:
        frappe.throw(_("Academic Term name is required"))

    try:
        return {
            "student_applicants": frappe.db.count(
                "Student Applicant", {"academic_term": academic_term}
            ),
            "class_arms": frappe.db.count(
                "Student Group", {"academic_term": academic_term}
            ),
            "student_logs": frappe.db.count(
                "Student Log", {"academic_term": academic_term}
            ),
            "fee_structures": frappe.db.count(
                "Fee Structure", {"academic_term": academic_term}
            ),
            "fee_schedules": frappe.db.count(
                "Fee Schedule", {"academic_term": academic_term}
            ),
            "class_enrollments": frappe.db.count(
                "Program Enrollment", {"academic_term": academic_term}
            ),
            "assessment_plans": frappe.db.count(
                "Assessment Plan", {"academic_term": academic_term}
            ),
            "assessment_results": frappe.db.count(
                "Assessment Result", {"academic_term": academic_term}
            ),
        }
    except Exception as e:
        frappe.log_error(
            f"Error fetching connections for {academic_term}: {str(e)}",
            "Academic Term API",
        )
        return {}