import json

import frappe
from frappe import _
from frappe.utils import cint


@frappe.whitelist()
def get_grading_scales(page=1, page_size=20, search=None):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}

    or_filters = []
    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["grading_scale_name", "like", f"%{search}%"],
            ["description", "like", f"%{search}%"],
        ]

    rows = frappe.get_all(
        "Grading Scale",
        fields=["name", "grading_scale_name", "description", "docstatus"],
        filters=filters,
        or_filters=or_filters,
        order_by="creation desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count("Grading Scale", filters=filters)

    return {
        "rows": rows,
        "count": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (
            (total + page_size - 1) // page_size
            if page_size else 1
        ),
    }


@frappe.whitelist()
def get_grading_scale(name):
    if not name:
        frappe.throw(_("Grading Scale name is required"))

    doc = frappe.get_doc("Grading Scale", name)
    result = doc.as_dict()

    if result.get("intervals"):
        if not isinstance(result["intervals"], list):
            try:
                result["intervals"] = frappe.parse_json(result["intervals"])
            except Exception:
                result["intervals"] = []
    else:
        result["intervals"] = []

    return result


@frappe.whitelist()
def create_grading_scale(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc({
        "doctype": "Grading Scale",
        "grading_scale_name": data.get("grading_scale_name"),
        "description": data.get("description"),
    })

    for interval in data.get("intervals", []):
        if interval.get("grade_code"):
            doc.append("intervals", {
                "grade_code": interval.get("grade_code"),
                "threshold": interval.get("threshold"),
                "grade_description": interval.get("grade_description"),
            })

    # doc.validate() (duplicate/zero-threshold checks) runs automatically
    # on insert
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def update_grading_scale(name, data):
    if not name:
        frappe.throw(_("Grading Scale name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Grading Scale", name)

    if doc.docstatus != 0:
        frappe.throw(_("Cannot edit a submitted or cancelled document"))

    # grading_scale_name drives the docname (autoname) -- the frontend
    # locks this field when editing.
    if "description" in data:
        doc.description = data.get("description")

    if "intervals" in data:
        doc.set("intervals", [])
        for interval in data.get("intervals", []):
            if interval.get("grade_code"):
                doc.append("intervals", {
                    "grade_code": interval.get("grade_code"),
                    "threshold": interval.get("threshold"),
                    "grade_description": interval.get("grade_description"),
                })

    doc.save()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def delete_grading_scale(name):
    if not name:
        frappe.throw(_("Grading Scale name is required"))

    doc = frappe.get_doc("Grading Scale", name)

    if doc.docstatus == 1:
        frappe.throw(_("Cannot delete a submitted document. Please cancel it first."))

    doc.delete()
    frappe.db.commit()

    return {"message": "Grading Scale deleted"}


@frappe.whitelist()
def submit_grading_scale(name):
    if not name:
        frappe.throw(_("Grading Scale name is required"))

    doc = frappe.get_doc("Grading Scale", name)

    if doc.docstatus == 1:
        frappe.throw(_("Document is already submitted"))
    if doc.docstatus == 2:
        frappe.throw(_("Cannot submit a cancelled document"))

    doc.submit()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def cancel_grading_scale(name):
    if not name:
        frappe.throw(_("Grading Scale name is required"))

    doc = frappe.get_doc("Grading Scale", name)

    if doc.docstatus == 2:
        frappe.throw(_("Document is already cancelled"))
    if doc.docstatus == 0:
        frappe.throw(_("Cannot cancel a draft document"))

    doc.cancel()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def get_connections(grading_scale):
    """Connection counts shown on the Grading Scale profile page.

    grading_scale.json has no "links" array of its own, so these were
    individually verified against the target doctypes' real fields:
    Course.default_grading_scale, Assessment Plan.grading_scale,
    Assessment Result.grading_scale.
    """
    if not grading_scale:
        frappe.throw(_("Grading Scale name is required"))

    try:
        return {
            "subjects": frappe.db.count(
                "Course", {"default_grading_scale": grading_scale}
            ),
            "assessment_plans": frappe.db.count(
                "Assessment Plan", {"grading_scale": grading_scale}
            ),
            "assessment_results": frappe.db.count(
                "Assessment Result", {"grading_scale": grading_scale}
            ),
        }
    except Exception as e:
        frappe.log_error(
            f"Error fetching connections for {grading_scale}: {str(e)}",
            "Grading Scale API",
        )
        return {}
