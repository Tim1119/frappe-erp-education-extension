import json
from functools import wraps

import frappe
from frappe import _
from frappe.utils import cint


def guarded(title, fallback=None):
    """Log unexpected failures while preserving Frappe validation errors."""
    def decorate(function):
        @wraps(function)
        def wrapped(*args, **kwargs):
            try:
                return function(*args, **kwargs)
            except (frappe.ValidationError, frappe.PermissionError):
                raise
            except Exception as error:
                frappe.log_error(frappe.get_traceback(), title)
                if fallback is not None:
                    return fallback() if callable(fallback) else fallback
                frappe.throw(_("Unable to complete this Employee Lifecycle request: {0}").format(error))
        return wrapped
    return decorate


def parse_data(data):
    return json.loads(data) if isinstance(data, str) else (data or {})


def list_docs(doctype, fields, page=1, page_size=20, search=None, search_fields=None,
              filters=None, order_by="modified desc"):
    page, page_size = max(cint(page), 1), max(cint(page_size), 1)
    filters = {key: value for key, value in (filters or {}).items() if value not in (None, "")}
    or_filters = [[field, "like", f"%{search}%"] for field in (search_fields or ["name"])] if search else []
    rows = frappe.get_list(
        doctype, fields=fields, filters=filters, or_filters=or_filters,
        order_by=order_by, start=(page - 1) * page_size, page_length=page_size,
    )
    for row in rows:
        row["can_edit"] = row.get("docstatus", 0) == 0 and frappe.has_permission(doctype, "write", doc=row.name)
        row["can_delete"] = row.get("docstatus", 0) != 1 and frappe.has_permission(doctype, "delete", doc=row.name)
    count = len(frappe.get_list(doctype, filters=filters, or_filters=or_filters, pluck="name", limit_page_length=0))
    return {"rows": rows, "count": count, "page": page, "page_size": page_size,
            "total_pages": (count + page_size - 1) // page_size}


def single(doctype, name, tables=None):
    if not name:
        frappe.throw(_("Document name is required"))
    doc = frappe.get_doc(doctype, name)
    data = doc.as_dict()
    for table, fields in (tables or {}).items():
        if doc.meta.has_field(table):
            data[table] = [{field: row.get(field) for field in fields} for row in doc.get(table, [])]
    data["can_edit"] = doc.docstatus == 0 and doc.has_permission("write")
    data["can_delete"] = doc.docstatus != 1 and doc.has_permission("delete")
    return data


def apply_data(doc, data, fields, tables=None):
    data = parse_data(data)
    for field in fields:
        if field in data and doc.meta.has_field(field):
            doc.set(field, data.get(field))
    for table, child_fields in (tables or {}).items():
        if table not in data or not doc.meta.has_field(table):
            continue
        doc.set(table, [])
        for row in data.get(table) or []:
            values = {field: row.get(field) for field in child_fields if field in row}
            if any(value not in (None, "") for value in values.values()):
                doc.append(table, values)
    return doc


def create_doc(doctype, data, fields, tables=None):
    doc = apply_data(frappe.new_doc(doctype), data, fields, tables)
    doc.insert()
    frappe.db.commit()
    return doc.as_dict()


def update_doc(doctype, name, data, fields, tables=None):
    doc = frappe.get_doc(doctype, name)
    if doc.docstatus:
        frappe.throw(_("Only draft documents can be edited"))
    apply_data(doc, data, fields, tables).save()
    frappe.db.commit()
    return doc.as_dict()


def delete_doc(doctype, name):
    doc = frappe.get_doc(doctype, name)
    if doc.docstatus == 1:
        frappe.throw(_("Cancel this document before deleting it"))
    frappe.delete_doc(doctype, name)
    frappe.db.commit()
    return {"message": _("{0} deleted").format(doctype)}


def get_options(doctype, filters=None, fields=None):
    default_fields = {
        "Employee": ["name", "employee_name", "department", "company", "designation", "grade", "holiday_list"],
        "User": ["name", "full_name"],
        "Training Event": ["name", "event_name"],
    }
    default_filters = {"Employee": {"status": "Active"}, "User": {"enabled": 1}}
    effective_filters = {**default_filters.get(doctype, {}), **(filters or {})}
    order_by = {"Employee": "employee_name", "User": "full_name", "Training Event": "event_name"}.get(doctype, "name")
    return frappe.get_list(doctype, fields=fields or default_fields.get(doctype, ["name"]), filters=effective_filters, order_by=order_by, limit_page_length=500)


def employee_details(employee):
    if not employee:
        return {}
    data = frappe.db.get_value(
        "Employee", employee,
        ["employee_name", "department", "company", "designation", "grade", "holiday_list", "reports_to"],
        as_dict=True,
    ) or {}
    data["employee_grade"] = data.get("grade") or ""
    return data


def submit_doc(doctype, name):
    doc = frappe.get_doc(doctype, name)
    doc.submit()
    frappe.db.commit()
    return doc.as_dict()


def cancel_doc(doctype, name):
    doc = frappe.get_doc(doctype, name)
    doc.cancel()
    frappe.db.commit()
    return doc.as_dict()
