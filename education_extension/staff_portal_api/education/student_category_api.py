import json

import frappe
from frappe import _
from frappe.utils import cint


@frappe.whitelist()
def get_student_categories(page=1, page_size=20, search=None):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}

    or_filters = []
    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["category", "like", f"%{search}%"],
        ]

    rows = frappe.get_list(
        "Student Category",
        fields=["name", "category"],
        filters=filters,
        or_filters=or_filters,
        order_by="creation desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count("Student Category", filters=filters)

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
def get_student_category(name):
    if not name:
        frappe.throw(_("Student Category name is required"))

    doc = frappe.get_doc("Student Category", name)
    return doc.as_dict()


@frappe.whitelist()
def create_student_category(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc({
        "doctype": "Student Category",
        "category": data.get("category"),
    })

    doc.insert()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def update_student_category(name, data):
    if not name:
        frappe.throw(_("Student Category name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    # "category" drives the docname (autoname: field:category) and is the
    # doctype's only field, so there is nothing else to update -- the
    # frontend shows it locked/read-only in edit mode.
    doc = frappe.get_doc("Student Category", name)
    return doc.as_dict()


@frappe.whitelist()
def delete_student_category(name):
    if not name:
        frappe.throw(_("Student Category name is required"))

    frappe.delete_doc("Student Category", name)
    frappe.db.commit()

    return {"message": "Student Category deleted"}


@frappe.whitelist()
def get_connections(student_category):
    """Connection counts shown on the Student Category profile page."""
    if not student_category:
        frappe.throw(_("Student Category name is required"))

    try:
        return {
            "fee_structures": frappe.db.count(
                "Fee Structure", {"student_category": student_category}
            ),
            "fee_schedules": frappe.db.count(
                "Fee Schedule", {"student_category": student_category}
            ),
        }
    except Exception as e:
        frappe.log_error(
            f"Error fetching connections for {student_category}: {str(e)}",
            "Student Category API",
        )
        return {}
