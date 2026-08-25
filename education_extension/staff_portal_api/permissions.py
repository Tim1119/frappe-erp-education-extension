import frappe
from frappe import _


def get_current_user():
    user = frappe.session.user
    if not user or user == "Guest":
        frappe.throw(_("Not logged in"), frappe.AuthenticationError)
    return user


def get_current_employee():
    user = get_current_user()
    return frappe.db.get_value(
        "Employee",
        {"user_id": user, "status": "Active"},
        "name",
    )


def get_current_instructor():
    employee = get_current_employee()
    if not employee:
        return None
    return frappe.db.get_value("Instructor", {"employee": employee}, "name")


def is_education_manager():
    return "Education Manager" in frappe.get_roles(get_current_user())


def is_bursar():
    roles = frappe.get_roles(get_current_user())
    return "Accounts User" in roles or "Sales User" in roles


def get_allowed_student_groups():
    """
    Returns:
        None -> unrestricted education manager
        []   -> logged-in user has no assigned class arms
        list -> class arms assigned to the logged-in instructor
    """
    if is_education_manager():
        return None

    instructor = get_current_instructor()
    if not instructor:
        return []

    return frappe.get_all(
        "Student Group Instructor",
        filters={"instructor": instructor},
        pluck="parent",
    )


def ensure_student_group_access(student_group):
    if not student_group:
        frappe.throw(_("Student Group is required"))

    allowed = get_allowed_student_groups()
    if allowed is None:
        return

    if student_group not in allowed:
        frappe.throw(
            _("You do not have access to this class"),
            frappe.PermissionError,
        )


def get_allowed_students():
    allowed_groups = get_allowed_student_groups()
    if allowed_groups is None:
        return None
    if not allowed_groups:
        return []

    return frappe.get_all(
        "Student Group Student",
        filters={
            "parent": ["in", allowed_groups],
            "active": 1,
        },
        pluck="student",
    )


def ensure_student_access(student):
    if not student:
        frappe.throw(_("Student is required"))

    allowed_students = get_allowed_students()
    if allowed_students is None:
        return

    if student not in allowed_students:
        frappe.throw(
            _("You do not have access to this student"),
            frappe.PermissionError,
        )


def ensure_doctype_permission(doctype, ptype="read", doc=None):
    if doc is not None:
        if not doc.has_permission(ptype):
            frappe.throw(_("Not permitted"), frappe.PermissionError)
        return

    if not frappe.has_permission(doctype, ptype=ptype, user=get_current_user()):
        frappe.throw(_("Not permitted"), frappe.PermissionError)


def get_doctype_permissions(doctype):
    user = get_current_user()
    return {
        "read": bool(frappe.has_permission(doctype, ptype="read", user=user)),
        "write": bool(frappe.has_permission(doctype, ptype="write", user=user)),
        "create": bool(frappe.has_permission(doctype, ptype="create", user=user)),
        "delete": bool(frappe.has_permission(doctype, ptype="delete", user=user)),
        "submit": bool(frappe.has_permission(doctype, ptype="submit", user=user)),
        "cancel": bool(frappe.has_permission(doctype, ptype="cancel", user=user)),
    }
