import frappe
from frappe import _
from frappe.utils import add_months

from education_extension.staff_portal_api.hr.leaves import api_call, cancel_document, common_options, delete_document, document, page_result, payload, save_document, submit_document

DOCTYPE = "Leave Policy Assignment"
FIELDS = ["employee", "leave_policy", "leave_period", "effective_from", "effective_to", "carry_forward", "assignment_based_on"]


def _validate_assignment(data):
    data = payload(data)
    assignment_based_on = data.get("assignment_based_on")
    employee = data.get("employee")

    if assignment_based_on == "Leave Period":
        leave_period = data.get("leave_period")
        if not leave_period:
            frappe.throw(_("Leave Period is required when Assignment Based On is Leave Period."))
        period = frappe.db.get_value(
            "Leave Period", leave_period, ["from_date", "to_date"], as_dict=True
        )
        if not period:
            frappe.throw(_("Leave Period {0} does not exist.").format(frappe.bold(leave_period)))
        data["effective_from"] = period.from_date
        data["effective_to"] = period.to_date
    elif assignment_based_on == "Joining Date":
        if not employee:
            frappe.throw(_("Employee is required when Assignment Based On is Joining Date."))
        date_of_joining = frappe.db.get_value("Employee", employee, "date_of_joining")
        if not date_of_joining:
            frappe.throw(_("Date of Joining is required on Employee {0}.").format(frappe.bold(employee)))
        data["effective_from"] = date_of_joining
        if not data.get("effective_to"):
            data["effective_to"] = add_months(date_of_joining, 12)
    else:
        frappe.throw(_("Assignment Based On is required."))

    leave_policy = data.get("leave_policy")
    if leave_policy and frappe.db.get_value("Leave Policy", leave_policy, "docstatus") != 1:
        frappe.throw(_("Leave Policy must be submitted before it can be assigned."))
    return data


def _save_assignment(data, name=None):
    return save_document(DOCTYPE, _validate_assignment(data), FIELDS, name=name)

@frappe.whitelist()
def get_leave_policy_assignments(page=1, page_size=20, search=None, filters=None):
    fields = ["name", "employee", "employee_name", "department", "company", "leave_policy", "leave_period", "effective_from", "effective_to", "docstatus"]
    return api_call("Leave Policy Assignment API", lambda: page_result(DOCTYPE, fields, page, page_size, search, ["name", "employee", "employee_name"], filters, "effective_from desc"))
@frappe.whitelist()
def get_leave_policy_assignment(name): return api_call("Leave Policy Assignment API", lambda: document(DOCTYPE, name))
@frappe.whitelist()
def create_leave_policy_assignment(data): return api_call("Leave Policy Assignment API", lambda: _save_assignment(data))
@frappe.whitelist()
def update_leave_policy_assignment(name, data): return api_call("Leave Policy Assignment API", lambda: _save_assignment(data, name=name))
@frappe.whitelist()
def delete_leave_policy_assignment(name): return api_call("Leave Policy Assignment API", lambda: delete_document(DOCTYPE, name))
@frappe.whitelist()
def submit_leave_policy_assignment(name): return api_call("Leave Policy Assignment API", lambda: submit_document(DOCTYPE, name))
@frappe.whitelist()
def cancel_leave_policy_assignment(name): return api_call("Leave Policy Assignment API", lambda: cancel_document(DOCTYPE, name))
@frappe.whitelist()
def get_options(): return api_call("Leave Policy Assignment API", common_options)
@frappe.whitelist()
def get_connections(name): return api_call("Leave Policy Assignment API", lambda: {"leave_allocations": frappe.db.count("Leave Allocation", {"leave_policy_assignment": name})})
