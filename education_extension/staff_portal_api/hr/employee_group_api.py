import json

import frappe
from frappe import _
from frappe.utils import cint


@frappe.whitelist()
def get_employee_groups(page=1, page_size=20, search=None):
    page, page_size = cint(page), cint(page_size)
    filters = [["Employee Group", "employee_group_name", "like", f"%{search}%"]] if search else []
    rows = frappe.get_all(
        "Employee Group", fields=["name", "employee_group_name"], filters=filters,
        order_by="modified desc", start=(page - 1) * page_size, page_length=page_size,
    )
    for row in rows:
        row["member_count"] = frappe.db.count("Employee Group Table", {"parent": row.name})
        row["can_edit"] = frappe.has_permission("Employee Group", "write", doc=row.name)
    total = frappe.db.count("Employee Group", filters=filters)
    return {"rows": rows, "count": total, "page": page, "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size if page_size else 1}


@frappe.whitelist()
def get_employee_group(name):
    if not name:
        frappe.throw(_("Employee Group name is required"))
    doc = frappe.get_doc("Employee Group", name)
    data = doc.as_dict()
    data["employee_list"] = [{"employee": row.employee, "employee_name": row.employee_name,
                              "user_id": row.user_id} for row in doc.employee_list]
    data["can_edit"] = doc.has_permission("write")
    return data


def _set_members(doc, rows):
    doc.set("employee_list", [])
    seen = set()
    for row in rows or []:
        employee = row.get("employee")
        if not employee or employee in seen:
            continue
        seen.add(employee)
        details = frappe.db.get_value("Employee", employee, ["employee_name", "user_id"], as_dict=True) or {}
        doc.append("employee_list", {"employee": employee,
                                     "employee_name": details.get("employee_name"),
                                     "user_id": details.get("user_id")})


@frappe.whitelist()
def create_employee_group(data):
    if isinstance(data, str):
        data = json.loads(data)
    doc = frappe.new_doc("Employee Group")
    doc.employee_group_name = data.get("employee_group_name")
    _set_members(doc, data.get("employee_list"))
    doc.insert()
    frappe.db.commit()
    return doc.as_dict()


@frappe.whitelist()
def update_employee_group(name, data):
    if isinstance(data, str):
        data = json.loads(data)
    doc = frappe.get_doc("Employee Group", name)
    if "employee_list" in data:
        _set_members(doc, data.get("employee_list"))
    doc.save()
    frappe.db.commit()
    return doc.as_dict()


@frappe.whitelist()
def delete_employee_group(name):
    frappe.delete_doc("Employee Group", name)
    frappe.db.commit()
    return {"message": "Employee Group deleted"}


@frappe.whitelist()
def get_employees():
    try:
        return frappe.get_all(
            "Employee", fields=["name", "employee_name", "user_id", "status"],
            order_by="employee_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching Employee Group employees: {str(e)}", "Employee Group API")
        return []
