# # import frappe

# # def boot_session(bootinfo):
# #     """Force Student users to /student-portal on login"""
# #     try:
# #         roles = frappe.get_roles()
# #         if "Student" in roles:
# #             bootinfo["home_page"] = "/student-portal"
# #     except Exception as e:
# #         frappe.log_error(frappe.get_traceback(), "boot_session_error")


# # import frappe

# # def get_home_page(user=None):
# #     """Force Student users to open /student-portal even if they have Desk User."""
# #     if not user:
# #         user = frappe.session.user

# #     roles = frappe.get_roles(user)
# #     if "Student" in roles:
# #         return "/student-portal"

# #     # Default fallback
# #     return frappe.get_website_settings("home_page") or "login"


# # In your_app/utils.py
# import frappe
# from frappe.auth import LoginManager

# import frappe

# # education_extension/education_extension/custom_login.py

# import frappe
# from frappe import _


# def redirect_student(login_manager=None, **kwargs):
# 	"""
# 	Called on session creation to redirect students to portal
# 	"""
# 	try:
# 		user = frappe.session.user

# 		# Skip for Administrator and Guest
# 		if user in ["Administrator", "Guest"]:
# 			return

# 		roles = frappe.get_roles(user)

# 		# Redirect students to portal
# 		if "Student" in roles:
# 			# Don't redirect admins who also have student role
# 			if "System Manager" not in roles and "Administrator" not in roles:
# 				frappe.local.response["type"] = "redirect"
# 				frappe.local.response["location"] = "/student-portal"

# 	except Exception as e:
# 		frappe.log_error(frappe.get_traceback(), "Student Redirect Error")


# # education_extension/education_extension/custom_login.py

# import frappe
# from frappe import _

# # def get_website_user_home_page(user):
# #     """
# #     This determines where users go after login
# #     """
# #     try:
# #         # Skip system users
# #         if user in ["Administrator", "Guest"]:
# #             return None

# #         roles = frappe.get_roles(user)

# #         # Don't redirect admins
# #         if "System Manager" in roles or "Administrator" in roles:
# #             return None

# #         # Redirect students to portal
# #         if "Student" in roles:
# #             return "/student-portal"

# #     except Exception as e:
# #         frappe.log_error(frappe.get_traceback(), "Get Website User Home Page Error")

# #     return None


# import frappe
# from frappe import _


# def get_website_user_home_page(user):
# 	"""
# 	This determines where users go after login
# 	"""
# 	try:
# 		if user in ["Administrator", "Guest"]:
# 			return None

# 		roles = frappe.get_roles(user)

# 		# Don't redirect admins
# 		if "System Manager" in roles or "Administrator" in roles:
# 			return None

# 		# Redirect guardians to guardian portal
# 		is_guardian = frappe.db.exists("Guardian", {"email_address": user})
# 		if is_guardian:
# 			return "/guardian-dashboard"

# 		# Redirect students to student portal
# 		if "Student" in roles:
# 			return "/student-portal"

# 	except Exception as e:
# 		frappe.log_error(frappe.get_traceback(), "Get Website User Home Page Error")

# 	return None



import frappe


def get_website_user_home_page(user):
	"""
	Determines where users land after login.
	Registered in hooks.py via get_website_user_home_page.
	"""
	try:
		if user in ["Administrator", "Guest"]:
			return None

		roles = frappe.get_roles(user)

		if "System Manager" in roles:
			return None

		is_guardian = frappe.db.exists("Guardian", {"email_address": user})
		if is_guardian:
			return "/guardian-dashboard"

		if "Student" in roles:
			return "/student-portal"

	except Exception:
		frappe.log_error(frappe.get_traceback(), "Get Website User Home Page Error")

	return None
