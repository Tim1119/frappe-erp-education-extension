# import frappe


# def get_website_user_home_page(user):
# 	"""
# 	Determines where users land after login.
# 	Registered in hooks.py via get_website_user_home_page.
# 	"""
# 	try:
# 		if user in ["Administrator", "Guest"]:
# 			return None

# 		roles = frappe.get_roles(user)

# 		if "System Manager" in roles:
# 			return None

# 		is_guardian = frappe.db.exists("Guardian", {"email_address": user})
# 		if is_guardian:
# 			return "/guardian-dashboard"

# 		if "Student" in roles:
# 			return "/student-portal"

# 	except Exception:
# 		frappe.log_error(frappe.get_traceback(), "Get Website User Home Page Error")

# 	return None


"""
Custom login redirects for the Education Extension.

Registered in hooks.py via:
    get_website_user_home_page = "education_extension.custom_login.get_website_user_home_page"

Uses Frappe's default /login page — no custom login UI.
After login, users are redirected based on their role:
    - Guardian            → /guardian-dashboard
    - Student             → /student-portal
    - Education Manager   → /staff-dashboard  (admin)
    - Accounts/Sales User → /staff-dashboard  (bursar)
    - Instructor          → /staff-dashboard  (teacher)
    - System Manager      → Frappe Desk (default)
"""

import frappe


def get_website_user_home_page(user):
    """
    Determines where users land after login via Frappe's default login page.
    """
    try:
        if user in ("Administrator", "Guest"):
            return None

        roles = frappe.get_roles(user)

        # System Managers go to Frappe Desk (default behaviour)
        if "System Manager" in roles:
            return None

        # Guardian portal
        is_guardian = frappe.db.exists("Guardian", {"email_address": user})
        if is_guardian:
            return "/guardian-dashboard"

        # Student portal
        if "Student" in roles:
            return "/student-portal"

        # Staff portal — Education Manager (admin / principal)
        if "Education Manager" in roles:
            return "/staff-dashboard"

        # Staff portal — Bursar (Accounts User or Sales User)
        if "Accounts User" in roles or "Sales User" in roles:
            return "/staff-dashboard"
        
        if "Teacher" in roles:
            return "/staff-dashboard"

        # Staff portal — Teacher (Employee → Instructor link)
        employee = frappe.db.get_value(
            "Employee", {"user_id": user, "status": "Active"}, "name"
        )
        if employee:
            has_instructor = frappe.db.exists("Instructor", {"employee": employee})
            if has_instructor:
                return "/staff-dashboard"

    except Exception:
        frappe.log_error(frappe.get_traceback(), "Get Website User Home Page Error")

    return None