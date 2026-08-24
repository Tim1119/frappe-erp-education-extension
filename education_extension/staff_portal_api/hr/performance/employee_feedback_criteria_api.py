import frappe

from education_extension.staff_portal_api.hr.performance import api_call, common_options, delete_document, document, page_result, save_document

DOCTYPE = "Employee Feedback Criteria"
FIELDS = ["criteria"]

@frappe.whitelist()
def get_employee_feedback_criteria(page=1, page_size=20, search=None, filters=None): return api_call("Employee Feedback Criteria API", lambda: page_result(DOCTYPE, ["name", "criteria"], page, page_size, search, ["name", "criteria"], filters, "criteria asc"))
@frappe.whitelist()
def get_employee_feedback_criterion(name): return api_call("Employee Feedback Criteria API", lambda: document(DOCTYPE, name))
@frappe.whitelist()
def create_employee_feedback_criterion(data): return api_call("Employee Feedback Criteria API", lambda: save_document(DOCTYPE, data, FIELDS))
@frappe.whitelist()
def update_employee_feedback_criterion(name, data): return api_call("Employee Feedback Criteria API", lambda: save_document(DOCTYPE, data, FIELDS, name=name))
@frappe.whitelist()
def delete_employee_feedback_criterion(name): return api_call("Employee Feedback Criteria API", lambda: delete_document(DOCTYPE, name))
@frappe.whitelist()
def get_options(): return api_call("Employee Feedback Criteria API", common_options)
@frappe.whitelist()
def get_connections(name): return {}
