import os

import frappe

no_cache = 1

def get_context(context):
    abbr = frappe.db.get_single_value(
        "Education Settings", "school_college_name_abbreviation"
    )
    logo = frappe.db.get_single_value("Education Settings", "school_college_logo")
    context.title = abbr or "Staff Portal"
    context.logo = logo or "/favicon.png"
    # The portal uses stable Vite output names. Version them with the actual
    # bundle modification time so route additions are never hidden by a
    # browser/proxy cache holding an older React router bundle.
    bundle_path = frappe.get_app_path(
        "education_extension", "public", "staff_portal", "index.js"
    )
    try:
        context.staff_portal_version = str(int(os.path.getmtime(bundle_path)))
    except OSError:
        context.staff_portal_version = context.build_version
