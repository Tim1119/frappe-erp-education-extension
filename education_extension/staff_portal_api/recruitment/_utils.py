import json
from functools import wraps

import frappe
from frappe import _
from frappe.utils import cint


def guarded(title):
    def decorate(fn):
        @wraps(fn)
        def wrapped(*args, **kwargs):
            try:
                return fn(*args, **kwargs)
            except (frappe.ValidationError, frappe.PermissionError):
                raise
            except Exception as exc:
                frappe.log_error(frappe.get_traceback(), title)
                frappe.throw(_("Unable to complete this Recruitment request: {0}").format(exc))
        return wrapped
    return decorate


def parse(data):
    return json.loads(data) if isinstance(data, str) else (data or {})


def list_docs(doctype, fields, page=1, page_size=20, search=None, search_fields=None, filters=None):
    page, page_size = max(cint(page), 1), max(cint(page_size), 1)
    filters = {k: v for k, v in (filters or {}).items() if v not in (None, "")}
    or_filters = [[f, "like", f"%{search}%"] for f in (search_fields or ["name"])] if search else []
    rows = frappe.get_all(doctype, fields=fields, filters=filters, or_filters=or_filters,
        order_by="modified desc", start=(page - 1) * page_size, page_length=page_size)
    for row in rows:
        row["can_edit"] = row.get("docstatus", 0) == 0 and frappe.has_permission(doctype, "write", doc=row.name)
        row["can_delete"] = row.get("docstatus", 0) != 1 and frappe.has_permission(doctype, "delete", doc=row.name)
    count = len(frappe.get_all(doctype, filters=filters, or_filters=or_filters, pluck="name", limit_page_length=0))
    return {"rows": rows, "count": count, "page": page, "page_size": page_size,
        "total_pages": (count + page_size - 1) // page_size}


def single(doctype, name, tables=None):
    doc = frappe.get_doc(doctype, name)
    data = doc.as_dict()
    for table, fields in (tables or {}).items():
        data[table] = [{f: row.get(f) for f in fields} for row in doc.get(table, [])]
    data["can_edit"] = doc.docstatus == 0 and doc.has_permission("write")
    data["can_delete"] = doc.docstatus != 1 and doc.has_permission("delete")
    return data


def apply(doc, data, fields, tables=None):
    data = parse(data)
    for field in fields:
        if field in data and doc.meta.has_field(field):
            doc.set(field, data[field])
    for table, child_fields in (tables or {}).items():
        if table not in data or not doc.meta.has_field(table):
            continue
        doc.set(table, [])
        for row in data.get(table) or []:
            values = {f: row.get(f) for f in child_fields if f in row}
            if any(v not in (None, "") for v in values.values()):
                doc.append(table, values)
    return doc


def create_doc(doctype, data, fields, tables=None):
    data = parse(data)
    doc = apply(frappe.new_doc(doctype), data, fields, tables)
    autoname = (doc.meta.autoname or "").lower()
    if autoname == "prompt":
        if not data.get("name"):
            frappe.throw(_("Document name is required"))
        doc.name = data["name"]
    elif autoname == "naming_series:" and data.get("naming_series"):
        doc.naming_series = data["naming_series"]
    doc.insert(); frappe.db.commit()
    return doc.as_dict()


def update_doc(doctype, name, data, fields, tables=None):
    doc = frappe.get_doc(doctype, name)
    if doc.docstatus:
        frappe.throw(_("Only draft documents can be edited"))
    apply(doc, data, fields, tables).save(); frappe.db.commit()
    return doc.as_dict()


def delete_doc(doctype, name):
    doc = frappe.get_doc(doctype, name)
    if doc.docstatus == 1:
        frappe.throw(_("Cancel this document before deleting it"))
    frappe.delete_doc(doctype, name); frappe.db.commit()
    return {"message": _("{0} deleted").format(doctype)}


def submit_doc(doctype, name):
    doc = frappe.get_doc(doctype, name); doc.submit(); frappe.db.commit(); return doc.as_dict()


def cancel_doc(doctype, name):
    doc = frappe.get_doc(doctype, name); doc.cancel(); frappe.db.commit(); return doc.as_dict()


def options(doctype):
    fields = {
        "Employee": ["name", "employee_name", "department", "company", "designation"],
        "User": ["name", "full_name"],
        "Job Opening": ["name", "job_title", "designation", "company", "department"],
        "Job Applicant": ["name", "applicant_name", "email_id", "designation", "job_title"],
        "Interview": ["name", "job_applicant", "interview_round"],
    }.get(doctype, ["name"])
    filters = {"Employee": {"status": "Active"}, "User": {"enabled": 1}, "Job Opening": {"status": "Open"}}.get(doctype, {})
    order = {"Employee": "employee_name", "User": "full_name", "Job Opening": "job_title", "Job Applicant": "applicant_name"}.get(doctype, "name")
    return frappe.get_all(doctype, fields=fields, filters=filters, order_by=order, limit_page_length=500)


def employee_details(employee):
    return frappe.db.get_value("Employee", employee,
        ["employee_name", "department", "company", "designation"], as_dict=True) or {}


def linked_details(doctype, name, fields):
    meta = frappe.get_meta(doctype)
    if any(meta.get_field(field) and meta.get_field(field).fieldtype in ("Table", "Table MultiSelect") for field in fields):
        doc = frappe.get_doc(doctype, name)
        return {field: doc.get(field) for field in fields}
    return frappe.db.get_value(doctype, name, fields, as_dict=True) or {}
