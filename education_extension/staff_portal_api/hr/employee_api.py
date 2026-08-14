import json

import frappe
from frappe import _
from frappe.utils import cint


LAYOUT_TYPES = {"Section Break", "Column Break", "Tab Break", "HTML", "Button"}
LABEL_OVERRIDES = {
    "prefered_contact_email": "Preferred Contact Email",
    "prefered_email": "Preferred Email",
    "valid_upto": "Valid Until",
    "date_of_retirement": "Date of Retirement",
    "reports_to": "Reports To",
}
# Structurally workflow-internal fields (recruitment pipeline linkage,
# internal-transfer bookkeeping, newsletter opt-out) that don't belong on a
# direct employee create/edit form regardless of how much data exists yet --
# unlike most other 0%-filled fields on this doctype, these aren't "not used
# yet by a small team," they're populated by other workflows entirely.
EXCLUDE_FIELDS = {"job_applicant", "unsubscribed", "held_on", "new_workplace"}


def _field_dict(field):
    data = {key: field.get(key) for key in (
        "fieldname", "fieldtype", "label", "options", "reqd", "read_only",
        "hidden", "depends_on", "mandatory_depends_on", "default", "description",
        "collapsible", "in_list_view", "set_only_once",
    )}
    data["label"] = LABEL_OVERRIDES.get(data["fieldname"], data["label"])
    return data


@frappe.whitelist()
def get_employee_meta():
    try:
        meta = frappe.get_meta("Employee")
        child_tables = {}
        for field in meta.fields:
            if field.fieldtype == "Table" and field.options:
                child_meta = frappe.get_meta(field.options)
                child_tables[field.fieldname] = {
                    "doctype": field.options,
                    "fields": [_field_dict(child) for child in child_meta.fields if not child.hidden],
                }
        return {"name": meta.name, "fields": [_field_dict(field) for field in meta.fields if field.fieldname not in EXCLUDE_FIELDS], "child_tables": child_tables}
    except Exception as e:
        frappe.log_error(f"Error fetching Employee metadata: {str(e)}", "Employee API")
        return {"name": "Employee", "fields": [], "child_tables": {}}


@frappe.whitelist()
def get_employees(page=1, page_size=20, search=None, company=None, department=None,
                  designation=None, branch=None, status=None, grade=None):
    page, page_size = cint(page), cint(page_size)
    filters = {}
    for field, value in (("company", company), ("department", department),
                         ("designation", designation), ("branch", branch), ("status", status)):
        if value:
            filters[field] = value
    if grade:
        filters["grade"] = grade
    or_filters = []
    if search:
        or_filters = [["name", "like", f"%{search}%"], ["employee_name", "like", f"%{search}%"],
                      ["employee_number", "like", f"%{search}%"]]
    rows = frappe.get_all(
        "Employee", fields=["name", "employee_name", "employee_number", "image", "company",
                            "department", "designation", "branch", "status", "date_of_joining"],
        filters=filters, or_filters=or_filters, order_by="modified desc",
        start=(page - 1) * page_size, page_length=page_size,
    )
    for row in rows:
        row["can_edit"] = frappe.has_permission("Employee", "write", doc=row.name)
    total = len(frappe.get_all("Employee", filters=filters, or_filters=or_filters,
                               pluck="name", limit_page_length=0))
    return {"rows": rows, "count": total, "page": page, "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size if page_size else 1}


@frappe.whitelist()
def get_employee(name):
    if not name:
        frappe.throw(_("Employee name is required"))
    doc = frappe.get_doc("Employee", name)
    data = doc.as_dict()
    data["can_edit"] = doc.has_permission("write")
    return data


def _apply_data(doc, data):
    meta = frappe.get_meta("Employee")
    for field in meta.fields:
        if field.fieldname not in data or field.hidden or field.fieldtype in LAYOUT_TYPES:
            continue
        if field.fieldtype == "Table":
            doc.set(field.fieldname, [])
            child_meta = frappe.get_meta(field.options)
            valid_child_fields = {child.fieldname for child in child_meta.fields
                                  if not child.hidden and child.fieldtype not in LAYOUT_TYPES}
            for row in data.get(field.fieldname, []) or []:
                doc.append(field.fieldname, {key: value for key, value in row.items()
                                             if key in valid_child_fields})
        elif not field.read_only:
            doc.set(field.fieldname, data.get(field.fieldname))


@frappe.whitelist()
def create_employee(data):
    if isinstance(data, str):
        data = json.loads(data)
    doc = frappe.new_doc("Employee")
    _apply_data(doc, data)
    doc.insert()
    frappe.db.commit()
    return doc.as_dict()


@frappe.whitelist()
def update_employee(name, data):
    if isinstance(data, str):
        data = json.loads(data)
    doc = frappe.get_doc("Employee", name)
    _apply_data(doc, data)
    doc.save()
    frappe.db.commit()
    return doc.as_dict()


@frappe.whitelist()
def delete_employee(name):
    frappe.delete_doc("Employee", name)
    frappe.db.commit()
    return {"message": "Employee deleted"}


def _link_rows(doctype, filters=None):
    meta = frappe.get_meta(doctype)
    title = meta.title_field if meta.title_field and meta.has_field(meta.title_field) else None
    fields = ["name"] + ([title] if title and title != "name" else [])
    rows = frappe.get_all(doctype, fields=fields, filters=filters or {}, order_by=title or "name", limit_page_length=500)
    for row in rows:
        row["display_name"] = row.get(title) if title else row.name
    return rows


def _employee_link_doctypes():
    doctypes = set()
    meta = frappe.get_meta("Employee")
    for field in meta.fields:
        if field.fieldtype == "Link" and field.options:
            doctypes.add(field.options)
        if field.fieldtype == "Table" and field.options:
            for child in frappe.get_meta(field.options).fields:
                if child.fieldtype == "Link" and child.options:
                    doctypes.add(child.options)
    return doctypes


@frappe.whitelist()
def get_link_options(doctype):
    try:
        if doctype not in _employee_link_doctypes():
            frappe.throw(_("Invalid Employee link type"))
        return _link_rows(doctype)
    except Exception as e:
        frappe.log_error(f"Error fetching {doctype} options: {str(e)}", "Employee API")
        return []


@frappe.whitelist()
def get_departments(company):
    try:
        return _link_rows("Department", {"company": company}) if company else []
    except Exception as e:
        frappe.log_error(f"Error fetching Employee departments: {str(e)}", "Employee API")
        return []


@frappe.whitelist()
def get_reports_to(employee=None):
    try:
        filters = {"status": "Active"}
        if employee:
            filters["name"] = ["!=", employee]
        return _link_rows("Employee", filters)
    except Exception as e:
        frappe.log_error(f"Error fetching reporting employees: {str(e)}", "Employee API")
        return []


@frappe.whitelist()
def get_users():
    try:
        return _link_rows("User", {"enabled": 1})
    except Exception as e:
        frappe.log_error(f"Error fetching Employee users: {str(e)}", "Employee API")
        return []


@frappe.whitelist()
def get_payroll_cost_centers(company):
    try:
        return _link_rows("Cost Center", {"company": company, "is_group": 0}) if company else []
    except Exception as e:
        frappe.log_error(f"Error fetching payroll cost centers: {str(e)}", "Employee API")
        return []


@frappe.whitelist()
def get_connections(employee):
    try:
        links = {
            "attendance": ("Attendance", "employee"), "leave_applications": ("Leave Application", "employee"),
            "expense_claims": ("Expense Claim", "employee"), "employee_advances": ("Employee Advance", "employee"),
        }
        return {key: frappe.db.count(doctype, {field: employee}) for key, (doctype, field) in links.items()}
    except Exception as e:
        frappe.log_error(f"Error fetching Employee connections: {str(e)}", "Employee API")
        return {}
