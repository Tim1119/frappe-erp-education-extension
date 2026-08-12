import json

import frappe
from frappe import _
from frappe.utils import cint


@frappe.whitelist()
def get_designations(page=1, page_size=20, search=None, appraisal_template=None, skill=None):
    page, page_size = cint(page), cint(page_size)
    or_filters = [["name", "like", f"%{search}%"], ["designation_name", "like", f"%{search}%"]] if search else []
    filters = {"appraisal_template": appraisal_template} if appraisal_template else {}
    if skill:
        parent_names = frappe.get_all(
            "Designation Skill", filters={"skill": skill}, pluck="parent",
            limit_page_length=0,
        )
        filters["name"] = ["in", parent_names or [""]]
    rows = frappe.get_all(
        "Designation", fields=["name", "designation_name", "description", "appraisal_template"],
        filters=filters, or_filters=or_filters, order_by="designation_name asc",
        start=(page - 1) * page_size, page_length=page_size,
    )
    for row in rows:
        row["can_edit"] = frappe.has_permission("Designation", "write", doc=row.name)
    total = len(frappe.get_all("Designation", filters=filters, or_filters=or_filters, pluck="name", limit_page_length=0))
    return {"rows": rows, "count": total, "page": page, "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size if page_size else 1}


@frappe.whitelist()
def get_designation(name):
    if not name:
        frappe.throw(_("Designation name is required"))
    doc = frappe.get_doc("Designation", name)
    data = doc.as_dict()
    data["skills"] = [{"skill": row.skill} for row in doc.get("skills", [])]
    data["can_edit"] = doc.has_permission("write")
    return data


@frappe.whitelist()
def create_designation(data):
    if isinstance(data, str):
        data = json.loads(data)
    doc = frappe.new_doc("Designation")
    doc.designation_name = data.get("designation_name")
    doc.description = data.get("description")
    doc.appraisal_template = data.get("appraisal_template")
    for row in data.get("skills", []):
        if row.get("skill"):
            doc.append("skills", {"skill": row.get("skill")})
    doc.insert()
    frappe.db.commit()
    return doc.as_dict()


@frappe.whitelist()
def update_designation(name, data):
    if isinstance(data, str):
        data = json.loads(data)
    doc = frappe.get_doc("Designation", name)
    if "description" in data:
        doc.description = data.get("description")
    if "appraisal_template" in data:
        doc.appraisal_template = data.get("appraisal_template")
    if "skills" in data:
        doc.set("skills", [])
        for row in data.get("skills", []):
            if row.get("skill"):
                doc.append("skills", {"skill": row.get("skill")})
    doc.save()
    frappe.db.commit()
    return doc.as_dict()


@frappe.whitelist()
def delete_designation(name):
    frappe.delete_doc("Designation", name)
    frappe.db.commit()
    return {"message": "Designation deleted"}


@frappe.whitelist()
def get_connections(designation):
    if not designation:
        frappe.throw(_("Designation name is required"))
    try:
        return {
            "employees": frappe.db.count("Employee", {"designation": designation}),
            "job_openings": frappe.db.count("Job Opening", {"designation": designation}),
            "job_requisitions": frappe.db.count("Job Requisition", {"designation": designation}),
        }
    except Exception as e:
        frappe.log_error(f"Error fetching Designation connections: {str(e)}", "Designation API")
        return {"employees": 0, "job_openings": 0, "job_requisitions": 0}


@frappe.whitelist()
def get_appraisal_templates():
    try:
        return frappe.get_all("Appraisal Template", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching Appraisal Templates: {str(e)}", "Designation API")
        return []


@frappe.whitelist()
def get_skills():
    try:
        return frappe.get_all("Skill", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching Skills: {str(e)}", "Designation API")
        return []
