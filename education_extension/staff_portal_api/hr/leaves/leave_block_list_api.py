import frappe

from education_extension.staff_portal_api.hr.leaves import api_call, common_options, delete_document, document, page_result, save_document

DOCTYPE = "Leave Block List"
FIELDS = ["leave_block_list_name", "company", "applies_to_all_departments", "leave_type"]
TABLES = {"leave_block_list_dates": ["block_date", "reason"], "leave_block_list_allowed": ["allow_user"]}

@frappe.whitelist()
def get_leave_block_lists(page=1, page_size=20, search=None, filters=None):
    return api_call("Leave Block List API", lambda: page_result(DOCTYPE, ["name", *FIELDS, "modified"], page, page_size, search, ["name", "leave_block_list_name", "company"], filters, "modified desc"))
@frappe.whitelist()
def get_leave_block_list(name): return api_call("Leave Block List API", lambda: document(DOCTYPE, name))
@frappe.whitelist()
def create_leave_block_list(data): return api_call("Leave Block List API", lambda: save_document(DOCTYPE, data, FIELDS, TABLES))
@frappe.whitelist()
def update_leave_block_list(name, data): return api_call("Leave Block List API", lambda: save_document(DOCTYPE, data, FIELDS, TABLES, name))
@frappe.whitelist()
def delete_leave_block_list(name): return api_call("Leave Block List API", lambda: delete_document(DOCTYPE, name))
@frappe.whitelist()
def get_options(): return api_call("Leave Block List API", common_options)
@frappe.whitelist()
def get_connections(name): return api_call("Leave Block List API", lambda: {})
