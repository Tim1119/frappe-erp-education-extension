import json

import frappe
from frappe import _
from frappe.utils import cint


@frappe.whitelist()
def get_employee_grades(page=1, page_size=20, search=None, salary_structure=None):
    page, page_size = cint(page), cint(page_size)
    filters = {"default_salary_structure": salary_structure} if salary_structure else {}
    or_filters = [["name", "like", f"%{search}%"]] if search else []
    rows = frappe.get_all(
        "Employee Grade", fields=["name", "default_salary_structure", "currency", "default_base_pay"],
        filters=filters, or_filters=or_filters, order_by="modified desc",
        start=(page - 1) * page_size, page_length=page_size,
    )
    for row in rows:
        row["can_edit"] = frappe.has_permission("Employee Grade", "write", doc=row.name)
    total = len(frappe.get_all("Employee Grade", filters=filters, or_filters=or_filters,
                               pluck="name", limit_page_length=0))
    return {"rows": rows, "count": total, "page": page, "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size if page_size else 1}


@frappe.whitelist()
def get_employee_grade(name):
    if not name:
        frappe.throw(_("Employee Grade name is required"))
    doc = frappe.get_doc("Employee Grade", name)
    data = doc.as_dict()
    data["can_edit"] = doc.has_permission("write")
    return data


def _set_fields(doc, data):
    if "default_salary_structure" in data:
        doc.default_salary_structure = data.get("default_salary_structure")
        doc.currency = frappe.db.get_value("Salary Structure", doc.default_salary_structure, "currency") if doc.default_salary_structure else None
    if "default_base_pay" in data:
        doc.default_base_pay = data.get("default_base_pay") or 0


@frappe.whitelist()
def create_employee_grade(data):
    if isinstance(data, str):
        data = json.loads(data)
    doc = frappe.new_doc("Employee Grade")
    doc.name = data.get("name")
    _set_fields(doc, data)
    doc.insert()
    frappe.db.commit()
    return doc.as_dict()


@frappe.whitelist()
def update_employee_grade(name, data):
    if isinstance(data, str):
        data = json.loads(data)
    doc = frappe.get_doc("Employee Grade", name)
    _set_fields(doc, data)
    doc.save()
    frappe.db.commit()
    return doc.as_dict()


@frappe.whitelist()
def delete_employee_grade(name):
    frappe.delete_doc("Employee Grade", name)
    frappe.db.commit()
    return {"message": "Employee Grade deleted"}


@frappe.whitelist()
def get_salary_structures():
    """Matches employee_grade.js: submitted and active Salary Structures only."""
    try:
        return frappe.get_all(
            "Salary Structure", fields=["name", "currency"],
            filters={"docstatus": 1, "is_active": "Yes"}, order_by="name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching Employee Grade salary structures: {str(e)}", "Employee Grade API")
        return []


@frappe.whitelist()
def get_connections(employee_grade):
    try:
        return {
            "employees": frappe.db.count("Employee", {"grade": employee_grade}),
            "onboarding_templates": frappe.db.count("Employee Onboarding Template", {"employee_grade": employee_grade}),
            "separation_templates": frappe.db.count("Employee Separation Template", {"employee_grade": employee_grade}),
        }
    except Exception as e:
        frappe.log_error(f"Error fetching Employee Grade connections: {str(e)}", "Employee Grade API")
        return {}
