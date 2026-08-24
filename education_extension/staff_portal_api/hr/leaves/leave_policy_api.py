import frappe

from education_extension.staff_portal_api.hr.leaves import api_call, common_options, cancel_document, delete_document, document, page_result, save_document, submit_document

DOCTYPE = "Leave Policy"
FIELDS = ["title"]
TABLES = {"leave_policy_details": ["leave_type", "annual_allocation"]}

@frappe.whitelist()
def get_leave_policies(page=1, page_size=20, search=None, filters=None):
    return api_call("Leave Policy API", lambda: page_result(DOCTYPE, ["name", "title", "docstatus", "modified"], page, page_size, search, ["name", "title"], filters, "modified desc"))
@frappe.whitelist()
def get_leave_policy(name): return api_call("Leave Policy API", lambda: document(DOCTYPE, name))
@frappe.whitelist()
def create_leave_policy(data): return api_call("Leave Policy API", lambda: save_document(DOCTYPE, data, FIELDS, TABLES))
@frappe.whitelist()
def update_leave_policy(name, data): return api_call("Leave Policy API", lambda: save_document(DOCTYPE, data, FIELDS, TABLES, name))
@frappe.whitelist()
def delete_leave_policy(name): return api_call("Leave Policy API", lambda: delete_document(DOCTYPE, name))
@frappe.whitelist()
def submit_leave_policy(name): return api_call("Leave Policy API", lambda: submit_document(DOCTYPE, name))
@frappe.whitelist()
def cancel_leave_policy(name): return api_call("Leave Policy API", lambda: cancel_document(DOCTYPE, name))
@frappe.whitelist()
def get_options(): return api_call("Leave Policy API", common_options)
@frappe.whitelist()
def get_connections(name): return api_call("Leave Policy API", lambda: {"policy_assignments": frappe.db.count("Leave Policy Assignment", {"leave_policy": name})})
