"""
Staff Portal API — Portal Context
==================================

Place this file at:
  education_extension/education_extension/staff_portal_api/portal_api.py

Provides the ``get_portal_context`` endpoint that returns the logged-in
user's role (admin vs teacher), their linked Instructor record (if any),
and the school branding from Education Settings.
"""

import frappe
from frappe import _


@frappe.whitelist()
def get_portal_context():
    """
    Returns a dict consumed by the staff portal frontend on login:

      {
        "role": "admin" | "teacher",
        "instructor": "INS-0001" | None,
        "instructor_name": "Mr. Adewale" | None,
        "school_name": "Brightwood International School",
        "school_abbreviation": "BIS",
        "school_logo": "/files/logo.png" | None,
      }

    Role logic:
      - If the user has the "Education Manager" role → admin
      - Else if the user has an Employee linked to an Instructor → teacher
      - Else → teacher (safe default; backend permissions still apply)
    """

    user = frappe.session.user

    if user == "Guest":
        frappe.throw(_("Not logged in"), frappe.AuthenticationError)

    # ── Determine role ────────────────────────────────────────────────

    user_roles = frappe.get_roles(user)
    is_admin = "Education Manager" in user_roles

    # ── Find linked Instructor ────────────────────────────────────────

    instructor = None
    instructor_name = None

    # User → Employee (via user_id field on Employee)
    employee = frappe.db.get_value(
        "Employee",
        {"user_id": user, "status": "Active"},
        "name",
    )

    if employee:
        # Employee → Instructor (via employee field on Instructor)
        instr = frappe.db.get_value(
            "Instructor",
            {"employee": employee},
            ["name", "instructor_name"],
            as_dict=True,
        )
        if instr:
            instructor = instr.name
            instructor_name = instr.instructor_name

    # ── School branding ─────────────────────────────────────────────────
    # Full name, abbreviation, and logo live on three different doctypes,
    # not one doctype with a fallback:
    #   - school_name: Company.company_name, via School Settings' `school`
    #     Link (School Settings itself has no name field of its own)
    #   - school_abbreviation: Education Settings.school_college_name_abbreviation
    #   - school_logo: Education Settings.school_college_logo (School Settings
    #     has no logo field -- only signature/stamp Attach Image fields)

    school_name = ""
    school_abbreviation = ""
    school_logo = None

    try:
        school_settings = frappe.get_single("School Settings")
        company = getattr(school_settings, "school", None)
        if company:
            school_name = frappe.db.get_value("Company", company, "company_name") or ""
    except Exception:
        pass

    try:
        settings = frappe.get_single("Education Settings")
        school_abbreviation = getattr(settings, "school_college_name_abbreviation", "") or ""
        school_logo = getattr(settings, "school_college_logo", None)
    except Exception:
        pass

    return {
        "role": "admin" if is_admin else "teacher",
        "instructor": instructor,
        "instructor_name": instructor_name,
        "school_name": school_name or "School Portal",
        "school_abbreviation": school_abbreviation,
        "school_logo": school_logo,
    }


@frappe.whitelist()
def get_quick_entry_fields(doctype):
    """Return the minimal set of fields needed to quick-create a record."""
    if not doctype:
        return []

    meta = frappe.get_meta(doctype)
    skip_types = {
        "Section Break",
        "Column Break",
        "Tab Break",
        "HTML",
        "Button",
        "Heading",
        "Fold",
        "Table",
    }

    all_visible = []
    priority = []

    for field in meta.fields:
        if field.fieldtype in skip_types or field.hidden:
            continue

        field_data = {
            "fieldname": field.fieldname,
            "label": field.label or field.fieldname,
            "fieldtype": field.fieldtype,
            "reqd": field.reqd,
            "options": field.options,
            "default": field.default,
        }

        all_visible.append(field_data)
        if field.reqd or field.in_list_view:
            priority.append(field_data)

    result = priority if priority else all_visible
    return result[:8]


@frappe.whitelist()
def quick_create_document(doctype, data):
    """Create a document with the supplied minimal quick-entry fields."""
    import json

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.new_doc(doctype)
    for key, value in data.items():
        if hasattr(doc, key):
            doc.set(key, value)

    doc.insert()
    frappe.db.commit()
    return {"name": doc.name}
