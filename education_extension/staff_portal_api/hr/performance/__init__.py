"""Shared helpers for Staff Portal HR Performance APIs."""

import json

import frappe
from frappe import _
from frappe.utils import cint


def payload(value):
    return json.loads(value) if isinstance(value, str) else (value or {})


def api_call(title, callback, fallback=None):
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
    result["can_edit"] = bool(doc.has_permission("write")) and (
        not doc.meta.is_submittable or doc.docstatus == 0
    )
    result["can_delete"] = bool(doc.has_permission("delete")) and doc.docstatus != 1
    return result


def set_employee_values(doc):
    if not doc.meta.has_field("employee") or not doc.employee:
        return
    values = frappe.db.get_value(
        "Employee", doc.employee,
        ["employee_name", "department", "company", "designation"], as_dict=True,
    ) or {}
    for field in ("employee_name", "department", "company", "designation"):
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
    set_employee_values(doc)
    doc.save() if name else doc.insert()
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
    for attempt in range(2):
        try:
            doc = frappe.get_doc(doctype, name)
            # Treat a repeated request as idempotent. This can happen when a
            # slow submit is clicked twice or retried by the client.
            if doc.docstatus == 1:
                return document(doctype, name)
            doc.submit()
            frappe.db.commit()
            return document(doctype, name)
        except frappe.QueryDeadlockError:
            frappe.db.rollback()
            if attempt:
                raise


def cancel_document(doctype, name):
    doc = frappe.get_doc(doctype, name)
    doc.cancel()
    frappe.db.commit()
    return document(doctype, name)


def employee_properties():
    excluded = {
        "naming_series", "employee", "first_name", "middle_name", "last_name",
        "marital_status", "ctc", "employee_name", "status", "image", "gender",
        "date_of_birth", "date_of_joining", "lft", "rgt", "old_parent",
    }
    excluded_types = {"HTML", "Section Break", "Column Break", "Button", "Read Only", "Tab Break", "Table"}
    return [
        {"name": field.fieldname, "label": f"{field.label} ({field.fieldname})"}
        for field in frappe.get_meta("Employee").fields
        if field.fieldname not in excluded and field.fieldtype not in excluded_types
        and not field.hidden and not field.read_only
    ]


def common_options():
    return {
        "companies": frappe.get_list("Company", fields=["name"], order_by="name", limit_page_length=500),
        "departments": frappe.get_list("Department", fields=["name"], order_by="name", limit_page_length=500),
        "designations": frappe.get_list("Designation", fields=["name", "appraisal_template"], order_by="name", limit_page_length=500),
        "branches": frappe.get_list("Branch", fields=["name"], order_by="name", limit_page_length=500),
        "employees": frappe.get_list(
            "Employee", fields=["name", "employee_name", "department", "company", "designation", "branch", "user_id", "ctc", "salary_currency"],
            filters={"status": "Active"}, order_by="employee_name", limit_page_length=1000,
        ),
        "kras": frappe.get_list("KRA", fields=["name", "title", "description"], order_by="title", limit_page_length=500),
        "feedback_criteria": frappe.get_list("Employee Feedback Criteria", fields=["name", "criteria"], order_by="criteria", limit_page_length=500),
        "appraisal_templates": frappe.get_list("Appraisal Template", fields=["name", "template_title", "description"], order_by="template_title", limit_page_length=500),
        "appraisal_cycles": frappe.get_list("Appraisal Cycle", fields=["name", "cycle_name", "company", "start_date", "end_date", "status", "kra_evaluation_method"], order_by="start_date desc", limit_page_length=500),
        "appraisals": frappe.get_list("Appraisal", fields=["name", "employee", "employee_name", "appraisal_cycle", "docstatus"], filters={"docstatus": ["!=", 2]}, order_by="creation desc", limit_page_length=1000),
        "goals": frappe.get_list("Goal", fields=["name", "goal_name", "employee", "is_group", "parent_goal", "status", "kra", "appraisal_cycle"], order_by="goal_name", limit_page_length=1000),
        "doctypes": frappe.get_list("DocType", fields=["name"], filters={"istable": 0, "issingle": 0}, order_by="name", limit_page_length=2000),
        "roles": frappe.get_list("Role", fields=["name"], order_by="name", limit_page_length=500),
        "employee_properties": employee_properties(),
        "default_company": frappe.defaults.get_global_default("company") or "",
    }
