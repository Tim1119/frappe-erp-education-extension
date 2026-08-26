"""
Staff Portal API - Portal Context
"""

import json

import frappe
from frappe import _

from education_extension.staff_portal_api.permissions import (
    get_doctype_permissions,
)


PORTAL_DOCTYPES = [
    "Student",
    "Student Group",
    "Student Attendance",
    "Assessment Plan",
    "Assessment Result",
    "Assessment Group",
    "Assessment Criteria",
    "Grading Scale",
    "School Term Result",
    "Course Schedule",
    "Course",
    "Topic",
    "Program",
    "Program Enrollment",
    "Course Enrollment",
    "Instructor",
    "Guardian",
    "Article",
    "Video",
    "Quiz",
    "Subject Activity",
    "Quiz Activity",
    "Student Leave Application",
    "Academic Year",
    "Education Settings",
    "Fees",
    "Fee Structure",
    "Fee Schedule",
    "Sales Invoice",
    "Employee",
    "Department",
    "Designation",
    "Leave Application",
    "Employee Checkin",
    "Expense Claim",
    "Company",
    "Branch",
    "Employee Group",
    "Employee Grade",
    "HR Settings",
    "Daily Work Summary Group",
    "Daily Work Summary",
    "Employee Onboarding Template",
    "Employee Onboarding",
    "Employee Skill Map",
    "Grievance Type",
    "Employee Grievance",
    "Training Program",
    "Training Event",
    "Training Feedback",
    "Training Result",
    "Staffing Plan",
    "Job Requisition",
    "Job Opening",
    "Job Applicant",
    "Job Offer",
    "Employee Referral",
    "Interview Type",
    "Interview Round",
    "Interview",
    "Interview Feedback",
    "Appointment Letter Template",
    "Appointment Letter",
    "Compensatory Leave Request",
    "Leave Allocation",
    "Leave Policy Assignment",
    "Leave Encashment",
    "Leave Type",
    "Leave Period",
    "Leave Policy",
    "Leave Block List",
    "Holiday List",
    "Appraisal Template",
    "KRA",
    "Employee Feedback Criteria",
    "Appraisal",
    "Appraisal Cycle",
    "Employee Performance Feedback",
    "Goal",
    "Employee Promotion",
    "Energy Point Rule",
    "Energy Point Settings",
    "Energy Point Log",
    "Attendance",
    "Attendance Request",
    "Shift Type",
    "Shift Location",
    "Shift Assignment",
    "Shift Schedule",
    "Shift Schedule Assignment",
    "Shift Request",
    "Timesheet",
    "Activity Type",
    "Salary Component",
    "Salary Structure",
    "Income Tax Slab",
    "Payroll Period",
    "Salary Structure Assignment",
    "Salary Slip",
    "Payroll Entry",
    "Salary Withholding",
    "Employee Incentive",
    "Retention Bonus",
    "Expense Claim Type",
    "Employee Advance",
    "Travel Request",
    "Purpose of Travel",
    "Additional Salary",
    "Vehicle",
    "Driver",
    "Vehicle Service Item",
    "Vehicle Log",
]


@frappe.whitelist()
def get_portal_context():
    user = frappe.session.user

    if user == "Guest":
        frappe.throw(_("Not logged in"), frappe.AuthenticationError)

    user_roles = frappe.get_roles(user)

    instructor = None
    instructor_name = None

    employee = frappe.db.get_value(
        "Employee",
        {"user_id": user, "status": "Active"},
        "name",
    )

    if employee:
        instr = frappe.db.get_value(
            "Instructor",
            {"employee": employee},
            ["name", "instructor_name"],
            as_dict=True,
        )
        if instr:
            instructor = instr.name
            instructor_name = instr.instructor_name

    # In portal_api.py, change the role detection to:

    if "Education Manager" in user_roles:
        portal_role = "admin"
    elif "Accounts User" in user_roles or "Sales User" in user_roles:
        portal_role = "bursar"
    elif "Teacher" in user_roles or instructor:
        portal_role = "teacher"
    else:
        frappe.throw(
            _("You do not have access to the Staff Portal"),
            frappe.PermissionError,
        )

    permissions = {}
    for doctype in PORTAL_DOCTYPES:
        try:
            permissions[doctype] = get_doctype_permissions(doctype)
        except Exception:
            permissions[doctype] = {
                "read": False,
                "write": False,
                "create": False,
                "delete": False,
                "submit": False,
                "cancel": False,
            }

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
        school_abbreviation = (
            getattr(settings, "school_college_name_abbreviation", "") or ""
        )
        school_logo = getattr(settings, "school_college_logo", None)
    except Exception:
        pass

    return {
        "role": portal_role,
        "frappe_roles": user_roles,
        "permissions": permissions,
        "employee": employee,
        "instructor": instructor,
        "instructor_name": instructor_name,
        "school_name": school_name or "School Portal",
        "school_abbreviation": school_abbreviation,
        "school_logo": school_logo,
    }


@frappe.whitelist()
def get_quick_entry_fields(doctype):
    if not doctype:
        return []

    if not frappe.has_permission(doctype, ptype="create"):
        frappe.throw(_("Not permitted"), frappe.PermissionError)

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
    if not doctype:
        frappe.throw(_("DocType is required"))

    if not frappe.has_permission(doctype, ptype="create"):
        frappe.throw(_("Not permitted"), frappe.PermissionError)

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.new_doc(doctype)

    for key, value in data.items():
        if hasattr(doc, key):
            doc.set(key, value)

    doc.insert()
    frappe.db.commit()

    return {"name": doc.name}
