import json

import frappe
from frappe import _
from frappe.utils import cint


@frappe.whitelist()
def get_student_batch_names(page=1, page_size=20, search=None):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}

    or_filters = []
    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["batch_name", "like", f"%{search}%"],
        ]

    rows = frappe.get_all(
        "Student Batch Name",
        fields=["name", "batch_name"],
        filters=filters,
        or_filters=or_filters,
        order_by="creation desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count("Student Batch Name", filters=filters)

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
def get_student_batch_name(name):
    if not name:
        frappe.throw(_("Student Batch Name is required"))

    doc = frappe.get_doc("Student Batch Name", name)
    return doc.as_dict()


@frappe.whitelist()
def create_student_batch_name(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc({
        "doctype": "Student Batch Name",
        "batch_name": data.get("batch_name"),
    })

    doc.insert()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def update_student_batch_name(name, data):
    if not name:
        frappe.throw(_("Student Batch Name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    # "batch_name" drives the docname (autoname: field:batch_name) and is
    # the doctype's only field, so there is nothing else to update -- the
    # frontend shows it locked/read-only in edit mode.
    doc = frappe.get_doc("Student Batch Name", name)
    return doc.as_dict()


@frappe.whitelist()
def delete_student_batch_name(name):
    if not name:
        frappe.throw(_("Student Batch Name is required"))

    frappe.delete_doc("Student Batch Name", name)
    frappe.db.commit()

    return {"message": "Student Batch Name deleted"}
