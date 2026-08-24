import frappe
from frappe.utils import nowdate

from education_extension.staff_portal_api.hr.leaves import api_call, cancel_document, common_options, delete_document, document, page_result, save_document, submit_document

DOCTYPE = "Leave Allocation"
FIELDS = ["employee", "leave_type", "from_date", "to_date", "new_leaves_allocated", "carry_forward", "carry_forwarded_leaves", "unused_leaves", "total_leaves_allocated", "description", "leave_policy_assignment"]

@frappe.whitelist()
def get_leave_allocations(page=1, page_size=20, search=None, filters=None):
    fields = ["name", "employee", "employee_name", "department", "company", "leave_type", "from_date", "to_date", "new_leaves_allocated", "total_leaves_allocated", "docstatus"]
    return api_call("Leave Allocation API", lambda: page_result(DOCTYPE, fields, page, page_size, search, ["name", "employee", "employee_name"], filters, "from_date desc"))
@frappe.whitelist()
def get_leave_allocation(name): return api_call("Leave Allocation API", lambda: document(DOCTYPE, name))
@frappe.whitelist()
def create_leave_allocation(data): return api_call("Leave Allocation API", lambda: save_document(DOCTYPE, data, FIELDS))
@frappe.whitelist()
def update_leave_allocation(name, data): return api_call("Leave Allocation API", lambda: save_document(DOCTYPE, data, FIELDS, name=name))
@frappe.whitelist()
def delete_leave_allocation(name): return api_call("Leave Allocation API", lambda: delete_document(DOCTYPE, name))
@frappe.whitelist()
def submit_leave_allocation(name): return api_call("Leave Allocation API", lambda: submit_document(DOCTYPE, name))
@frappe.whitelist()
def cancel_leave_allocation(name): return api_call("Leave Allocation API", lambda: cancel_document(DOCTYPE, name))
@frappe.whitelist()
def get_options(): return api_call("Leave Allocation API", common_options)
@frappe.whitelist()
def get_current_balance(employee, leave_type, date=None):
    def run():
        if not employee or not leave_type: return {"balance": 0}
        from hrms.hr.doctype.leave_application.leave_application import get_leave_balance_on
        return {"balance": get_leave_balance_on(employee, leave_type, date or nowdate())}
    return api_call("Leave Allocation Balance", run)
@frappe.whitelist()
def get_connections(name):
    def run():
        allocation = frappe.get_doc(DOCTYPE, name)
        return {"leave_applications": frappe.db.count("Leave Application", {"employee": allocation.employee, "leave_type": allocation.leave_type, "from_date": ["<=", allocation.to_date], "to_date": [">=", allocation.from_date]})}
    return api_call("Leave Allocation API", run)
