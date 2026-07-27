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

    # ── School branding from Education Settings ───────────────────────

    school_name = ""
    school_abbreviation = ""
    school_logo = None

    try:
        settings = frappe.get_single("Education Settings")
        school_name = getattr(settings, "school_name", "") or ""
        school_abbreviation = getattr(settings, "school_abbreviation", "") or ""
        school_logo = getattr(settings, "school_logo", None)
    except Exception:
        pass

    # Fallback: try School Settings (custom doctype from education_extension)
    if not school_name:
        try:
            ss = frappe.get_single("School Settings")
            school_name = getattr(ss, "school_name", "") or ""
            school_abbreviation = getattr(ss, "school_abbreviation", "") or ""
            school_logo = getattr(ss, "school_logo", None) or school_logo
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
