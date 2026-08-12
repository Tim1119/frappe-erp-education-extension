import json

import frappe


@frappe.whitelist()
def get_school_settings():
    doc = frappe.get_single("School Settings")
    result = doc.as_dict()

    for child_table in ("assessment_criteria_item", "overall_grading_scale"):
        if result.get(child_table):
            if not isinstance(result[child_table], list):
                try:
                    result[child_table] = frappe.parse_json(result[child_table])
                except Exception:
                    result[child_table] = []
        else:
            result[child_table] = []

    return result


@frappe.whitelist()
def update_school_settings(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_single("School Settings")

    allowed_fields = [
        "school",
        "next_term_start_date",
        "secondary_school_print_format",
        "primary_school_print_format",
        "remark_score_for_secondary_school",
        "remark_score_for_primary_school",
        "principal_signature",
        "headteacher_signature",
        "primary_school_stamp_image",
        "secondary_school_stamp_image",
    ]

    for field in allowed_fields:
        if field in data:
            doc.set(field, data[field])

    if "assessment_criteria_item" in data:
        doc.set("assessment_criteria_item", [])
        for row in data.get("assessment_criteria_item", []):
            if row.get("criteria_name"):
                doc.append("assessment_criteria_item", {
                    "criteria_name": row.get("criteria_name"),
                    "is_active": row.get("is_active", 0),
                })

    if "overall_grading_scale" in data:
        doc.set("overall_grading_scale", [])
        for row in data.get("overall_grading_scale", []):
            if row.get("grade_code"):
                doc.append("overall_grading_scale", {
                    "grade_code": row.get("grade_code"),
                    "min_percentage": row.get("min_percentage"),
                    "max_percentage": row.get("max_percentage"),
                    "description": row.get("description"),
                })

    doc.save()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def get_companies():
    try:
        return frappe.get_all("Company", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching companies: {str(e)}", "School Settings API")
        return []


@frappe.whitelist()
def get_print_formats():
    try:
        return frappe.get_all("Print Format", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching print formats: {str(e)}", "School Settings API")
        return []
