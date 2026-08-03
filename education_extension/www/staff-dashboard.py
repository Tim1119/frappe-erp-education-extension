import frappe

no_cache = 1

def get_context(context):
    abbr = frappe.db.get_single_value(
        "Education Settings", "school_college_name_abbreviation"
    )
    logo = frappe.db.get_single_value("Education Settings", "school_college_logo")
    context.title = abbr or "Staff Portal"
    context.logo = logo or "/favicon.png"