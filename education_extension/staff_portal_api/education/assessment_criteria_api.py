import json

import frappe
from frappe import _
from frappe.utils import cint


@frappe.whitelist()
def get_assessment_criteria_list(page=1, page_size=20, search=None, assessment_criteria_group=None):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    if assessment_criteria_group:
        filters["assessment_criteria_group"] = assessment_criteria_group

    or_filters = []
    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["assessment_criteria_group", "like", f"%{search}%"],
        ]

    rows = frappe.get_list(
        "Assessment Criteria",
        fields=["name", "assessment_criteria", "assessment_criteria_group"],
        filters=filters,
        or_filters=or_filters,
        order_by="creation desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count("Assessment Criteria", filters=filters)

    return {
        "rows": rows,
        "count": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size else 1,
    }


@frappe.whitelist()
def get_assessment_criteria(name):
    if not name:
        frappe.throw(_("Assessment Criteria name is required"))

    doc = frappe.get_doc("Assessment Criteria", name)
    return doc.as_dict()


@frappe.whitelist()
def create_assessment_criteria(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc({
        "doctype": "Assessment Criteria",
        "assessment_criteria": data.get("assessment_criteria"),
        "assessment_criteria_group": data.get("assessment_criteria_group"),
    })

    # doc.validate() runs automatically on insert -- rejects reserved
    # names (total, score, grade, etc); not duplicated here beyond the
    # client-side hint in the form.
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def update_assessment_criteria(name, data):
    if not name:
        frappe.throw(_("Assessment Criteria name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Assessment Criteria", name)

    # assessment_criteria drives the docname (autoname:
    # field:assessment_criteria) -- changing it post-creation would desync
    # name vs the field, so the frontend locks it when editing.
    if "assessment_criteria_group" in data:
        doc.set("assessment_criteria_group", data["assessment_criteria_group"])

    doc.save()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def delete_assessment_criteria(name):
    if not name:
        frappe.throw(_("Assessment Criteria name is required"))

    frappe.delete_doc("Assessment Criteria", name)
    frappe.db.commit()

    return {"message": "Assessment Criteria deleted"}


@frappe.whitelist()
def get_assessment_criteria_groups():
    try:
        return frappe.get_list(
            "Assessment Criteria Group", fields=["name"],
            order_by="name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching assessment criteria groups: {str(e)}", "Assessment Criteria API")
        return []
