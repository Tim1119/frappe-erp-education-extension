import frappe

from education_extension.staff_portal_api.hr.leaves import api_call, common_options, delete_document, document, page_result, save_document

DOCTYPE = "Leave Type"
FIELDS = ["leave_type_name", "max_leaves_allowed", "applicable_after", "max_continuous_days_allowed", "is_carry_forward", "is_lwp", "is_compensatory", "include_holiday", "allow_encashment", "max_encashable_leaves", "non_encashable_leaves", "earning_component", "is_earned_leave", "earned_leave_frequency", "rounding", "is_optional_leave"]

@frappe.whitelist()
def get_leave_types(page=1, page_size=20, search=None, filters=None):
    return api_call("Leave Type API", lambda: page_result(DOCTYPE, ["name", *FIELDS], page, page_size, search, ["name", "leave_type_name"], filters, "name asc"))
@frappe.whitelist()
def get_leave_type(name): return api_call("Leave Type API", lambda: document(DOCTYPE, name))
@frappe.whitelist()
def create_leave_type(data): return api_call("Leave Type API", lambda: save_document(DOCTYPE, data, FIELDS))
@frappe.whitelist()
def update_leave_type(name, data): return api_call("Leave Type API", lambda: save_document(DOCTYPE, data, FIELDS, name=name))
@frappe.whitelist()
def delete_leave_type(name): return api_call("Leave Type API", lambda: delete_document(DOCTYPE, name))
@frappe.whitelist()
def get_options(): return api_call("Leave Type API", common_options)
@frappe.whitelist()
def get_connections(name):
    return api_call("Leave Type API", lambda: {
        "leave_allocations": frappe.db.count("Leave Allocation", {"leave_type": name}),
        "leave_applications": frappe.db.count("Leave Application", {"leave_type": name}),
        "leave_encashments": frappe.db.count("Leave Encashment", {"leave_type": name}),
    })
