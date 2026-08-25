import json

import frappe
from frappe import _
from frappe.utils import cint


@frappe.whitelist()
def get_branches(page=1, page_size=20, search=None):
    page, page_size = cint(page), cint(page_size)
    filters = [["Branch", "branch", "like", f"%{search}%"]] if search else []
    rows = frappe.get_list(
        "Branch", fields=["name", "branch"], filters=filters,
        order_by="branch asc", start=(page - 1) * page_size, page_length=page_size,
    )
    total = frappe.db.count("Branch", filters=filters)
    return {"rows": rows, "count": total, "page": page, "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size if page_size else 1}


@frappe.whitelist()
def get_branch(name):
    if not name:
        frappe.throw(_("Branch name is required"))
    doc = frappe.get_doc("Branch", name)
    data = doc.as_dict()
    return data


@frappe.whitelist()
def get_connections(branch):
    if not branch:
        frappe.throw(_("Branch name is required"))
    try:
        return {
            "employees": frappe.db.count("Employee", {"branch": branch}),
            "job_openings": frappe.db.count("Job Opening", {"branch": branch}),
        }
    except Exception as e:
        frappe.log_error(f"Error fetching Branch connections: {str(e)}", "Branch API")
        return {"employees": 0, "job_openings": 0}


@frappe.whitelist()
def create_branch(data):
    if isinstance(data, str):
        data = json.loads(data)
    doc = frappe.new_doc("Branch")
    doc.branch = data.get("branch")
    doc.insert()
    frappe.db.commit()
    return doc.as_dict()


@frappe.whitelist()
def delete_branch(name):
    frappe.delete_doc("Branch", name)
    frappe.db.commit()
    return {"message": "Branch deleted"}
