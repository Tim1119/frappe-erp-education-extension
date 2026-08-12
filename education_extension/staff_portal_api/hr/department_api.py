import json

import frappe
from frappe import _
from frappe.utils import cint


@frappe.whitelist()
def get_departments(page=1, page_size=20, search=None, company=None, parent_department=None):
    page, page_size = cint(page), cint(page_size)
    filters = {"company": company} if company else {}
    if parent_department:
        filters["parent_department"] = parent_department
    or_filters = [["name", "like", f"%{search}%"], ["department_name", "like", f"%{search}%"]] if search else []
    rows = frappe.get_all(
        "Department", fields=["name", "department_name", "parent_department", "company", "is_group", "disabled"],
        filters=filters, or_filters=or_filters, order_by="department_name asc",
        start=(page - 1) * page_size, page_length=page_size,
    )
    for row in rows:
        row["can_edit"] = bool(row.parent_department) and frappe.has_permission("Department", "write", doc=row.name)
    total = len(frappe.get_all(
        "Department", filters=filters, or_filters=or_filters,
        pluck="name", limit_page_length=0,
    ))
    return {"rows": rows, "count": total, "page": page, "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size if page_size else 1}


@frappe.whitelist()
def get_department(name):
    if not name:
        frappe.throw(_("Department name is required"))
    doc = frappe.get_doc("Department", name)
    data = doc.as_dict()
    data["can_edit"] = bool(doc.parent_department) and doc.has_permission("write")
    return data


@frappe.whitelist()
def get_connections(department):
    if not department:
        frappe.throw(_("Department name is required"))
    try:
        return {
            "employees": frappe.db.count("Employee", {"department": department}),
            "job_openings": frappe.db.count("Job Opening", {"department": department}),
            "child_departments": frappe.db.count("Department", {"parent_department": department}),
        }
    except Exception as e:
        frappe.log_error(f"Error fetching Department connections: {str(e)}", "Department API")
        return {"employees": 0, "job_openings": 0, "child_departments": 0}


def _set_fields(doc, data):
    for fieldname in ("department_name", "parent_department", "company", "is_group", "disabled"):
        if fieldname in data:
            doc.set(fieldname, data.get(fieldname))


@frappe.whitelist()
def create_department(data):
    if isinstance(data, str):
        data = json.loads(data)
    doc = frappe.new_doc("Department")
    _set_fields(doc, data)
    doc.insert()
    frappe.db.commit()
    return doc.as_dict()


@frappe.whitelist()
def update_department(name, data):
    if isinstance(data, str):
        data = json.loads(data)
    doc = frappe.get_doc("Department", name)
    _set_fields(doc, data)
    doc.save()
    frappe.db.commit()
    return doc.as_dict()


@frappe.whitelist()
def delete_department(name):
    frappe.delete_doc("Department", name)
    frappe.db.commit()
    return {"message": "Department deleted"}


@frappe.whitelist()
def get_companies():
    try:
        return frappe.get_all("Company", fields=["name", "company_name"], order_by="company_name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching companies: {str(e)}", "Department API")
        return []


@frappe.whitelist()
def get_parent_departments():
    """Matches department.js: parent_department must be a group node."""
    try:
        return frappe.get_all(
            "Department", fields=["name", "department_name"], filters={"is_group": 1},
            order_by="department_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching parent departments: {str(e)}", "Department API")
        return []
