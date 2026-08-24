"""Shared helpers for the staff portal Leaves APIs."""

import json

import frappe
from frappe import _
from frappe.utils import cint, date_diff, formatdate


def payload(value):
    return json.loads(value) if isinstance(value, str) else (value or {})


def api_call(title, callback, fallback=None):
    """Run an API operation with consistent logging and useful client errors."""
    try:
        return callback()
    except Exception as exc:
        frappe.log_error(frappe.get_traceback(), title)
        if fallback is not None:
            return fallback
        frappe.throw(_(str(exc)))


def page_result(doctype, fields, page=1, page_size=20, search=None,
                search_fields=None, filters=None, order_by="modified desc"):
    page, page_size = max(cint(page), 1), max(cint(page_size), 1)
    filters = payload(filters)
    or_filters = []
    if search:
        or_filters = [[doctype, field, "like", f"%{search}%"] for field in (search_fields or ["name"])]
    rows = frappe.get_list(
        doctype, fields=fields, filters=filters, or_filters=or_filters,
        order_by=order_by, start=(page - 1) * page_size, page_length=page_size,
    )
    count = len(frappe.get_list(
        doctype, fields=["name"], filters=filters, or_filters=or_filters,
        limit_page_length=0,
    ))
    meta = frappe.get_meta(doctype)
    for row in rows:
        row["can_edit"] = bool(frappe.has_permission(doctype, "write", doc=row.name)) and (
            not meta.is_submittable or cint(row.get("docstatus")) == 0
        )
        row["can_delete"] = bool(frappe.has_permission(doctype, "delete", doc=row.name)) and cint(row.get("docstatus")) != 1
    return {
        "rows": rows, "count": count, "page": page, "page_size": page_size,
        "total_pages": (count + page_size - 1) // page_size,
    }


def document(doctype, name):
    doc = frappe.get_doc(doctype, name)
    doc.check_permission("read")
    result = doc.as_dict()
    result["can_edit"] = bool(doc.has_permission("write")) and (not doc.meta.is_submittable or doc.docstatus == 0)
    result["can_delete"] = bool(doc.has_permission("delete")) and doc.docstatus != 1
    return result


def _set_employee_values(doc):
    if not doc.meta.has_field("employee") or not doc.employee:
        return
    values = frappe.db.get_value(
        "Employee", doc.employee, ["employee_name", "department", "company"], as_dict=True
    ) or {}
    for field in ("employee_name", "department", "company"):
        if doc.meta.has_field(field):
            doc.set(field, values.get(field))


def save_document(doctype, data, allowed_fields, child_tables=None, name=None):
    data = payload(data)
    doc = frappe.get_doc(doctype, name) if name else frappe.new_doc(doctype)
    if name and doc.meta.is_submittable and doc.docstatus != 0:
        frappe.throw(_("Only draft documents can be edited"))
    for field in allowed_fields:
        if field in data and doc.meta.has_field(field):
            doc.set(field, data.get(field))
    for table_field, row_fields in (child_tables or {}).items():
        if table_field not in data or not doc.meta.has_field(table_field):
            continue
        doc.set(table_field, [])
        for row in data.get(table_field) or []:
            doc.append(table_field, {field: row.get(field) for field in row_fields})
    _set_employee_values(doc)
    if name:
        doc.save()
    else:
        doc.insert()
    frappe.db.commit()
    return document(doctype, doc.name)


def delete_document(doctype, name):
    doc = frappe.get_doc(doctype, name)
    if doc.docstatus == 1:
        frappe.throw(_("Cancel the document before deleting it"))
    frappe.delete_doc(doctype, name)
    frappe.db.commit()
    return {"message": _("Document deleted")}


def submit_document(doctype, name):
    doc = frappe.get_doc(doctype, name)
    doc.submit()
    frappe.db.commit()
    return document(doctype, name)


def cancel_document(doctype, name):
    doc = frappe.get_doc(doctype, name)
    doc.cancel()
    frappe.db.commit()
    return document(doctype, name)


def common_options():
    leave_periods = frappe.get_list(
        "Leave Period",
        fields=["name", "from_date", "to_date", "company", "is_active"],
        order_by="from_date desc",
        limit_page_length=500,
    )
    for period in leave_periods:
        days = date_diff(period.to_date, period.from_date) + 1
        period["label"] = _("{0} to {1} ({2} days)").format(
            formatdate(period.from_date), formatdate(period.to_date), days
        )

    return {
        "companies": frappe.get_list("Company", fields=["name"], order_by="name", limit_page_length=500),
        "departments": frappe.get_list("Department", fields=["name"], order_by="name", limit_page_length=500),
        "employees": frappe.get_list(
            "Employee", fields=["name", "employee_name", "department", "company", "holiday_list", "date_of_joining"],
            filters={"status": "Active"}, order_by="employee_name", limit_page_length=1000,
        ),
        "leave_types": frappe.get_list("Leave Type", fields=["name", "is_lwp", "is_compensatory", "allow_encashment", "max_leaves_allowed"], order_by="name", limit_page_length=500),
        "leave_periods": leave_periods,
        "leave_policies": frappe.get_list("Leave Policy", fields=["name", "title", "docstatus"], filters={"docstatus": 1}, order_by="title", limit_page_length=500),
        "holiday_lists": frappe.get_list("Holiday List", fields=["name", "holiday_list_name", "from_date", "to_date"], order_by="from_date desc", limit_page_length=500),
        "users": frappe.get_list("User", fields=["name", "full_name"], filters={"enabled": 1}, order_by="full_name", limit_page_length=1000),
        "earning_components": frappe.get_list("Salary Component", fields=["name"], filters={"type": "Earning"}, order_by="name", limit_page_length=500),
        "default_company": frappe.defaults.get_global_default("company") or "",
    }
