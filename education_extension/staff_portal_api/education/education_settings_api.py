import json

import frappe
from frappe import _

from education_extension.staff_portal_api.permissions import ensure_doctype_permission


@frappe.whitelist()
def get_education_settings():
    ensure_doctype_permission("Education Settings", "read")
    doc = frappe.get_single("Education Settings")
    return doc.as_dict()


@frappe.whitelist()
def update_education_settings(data):
    ensure_doctype_permission("Education Settings", "write")
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_single("Education Settings")

    allowed_fields = [
        "current_academic_year",
        "current_academic_term",
        "attendance_freeze_date",
        "validate_batch",
        "validate_course",
        "academic_term_reqd",
        "instructor_created_by",
        "user_creation_skip",
        "create_so",
        "auto_submit_sales_invoice",
        "sales_invoice_posting_date_fee_schedule",
        "auto_submit_sales_order",
        "sales_order_transaction_date_fee_schedule",
        "attendance_based_on_course_schedule",
        "razorpay_key",
        "razorpay_secret",
        "school_college_name_abbreviation",
        "school_college_logo",
    ]

    for field in allowed_fields:
        if field in data:
            doc.set(field, data[field])

    # doc.validate() / on_update() (naming-series property setter,
    # Global Defaults sync) run automatically on save
    doc.save()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def get_academic_years():
    try:
        return frappe.get_list(
            "Academic Year",
            fields=["name"],
            order_by="name desc",
            limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching academic years: {str(e)}", "Education Settings API")
        return []


@frappe.whitelist()
def get_academic_terms(academic_year=None):
    try:
        filters = {}
        if academic_year:
            filters["academic_year"] = academic_year
        return frappe.get_list(
            "Academic Term",
            fields=["name"],
            filters=filters,
            order_by="name",
            limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching academic terms: {str(e)}", "Education Settings API")
        return []
