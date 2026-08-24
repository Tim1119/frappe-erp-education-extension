import frappe

from education_extension.staff_portal_api.hr.leaves import api_call, cancel_document, common_options, delete_document, document, page_result, save_document, submit_document

DOCTYPE = "Leave Encashment"
FIELDS = ["employee", "leave_period", "leave_type", "leave_allocation", "leave_balance", "actual_encashable_days", "encashment_days", "encashment_amount", "encashment_date", "company", "currency", "pay_via_payment_entry", "expense_account", "payable_account"]

@frappe.whitelist()
def get_leave_encashments(page=1, page_size=20, search=None, filters=None):
    fields = ["name", "employee", "employee_name", "department", "company", "leave_period", "leave_type", "encashment_days", "encashment_amount", "encashment_date", "docstatus"]
    return api_call("Leave Encashment API", lambda: page_result(DOCTYPE, fields, page, page_size, search, ["name", "employee", "employee_name"], filters, "encashment_date desc"))
@frappe.whitelist()
def get_leave_encashment(name): return api_call("Leave Encashment API", lambda: document(DOCTYPE, name))
@frappe.whitelist()
def create_leave_encashment(data): return api_call("Leave Encashment API", lambda: save_document(DOCTYPE, data, FIELDS))
@frappe.whitelist()
def update_leave_encashment(name, data): return api_call("Leave Encashment API", lambda: save_document(DOCTYPE, data, FIELDS, name=name))
@frappe.whitelist()
def delete_leave_encashment(name): return api_call("Leave Encashment API", lambda: delete_document(DOCTYPE, name))
@frappe.whitelist()
def submit_leave_encashment(name): return api_call("Leave Encashment API", lambda: submit_document(DOCTYPE, name))
@frappe.whitelist()
def cancel_leave_encashment(name): return api_call("Leave Encashment API", lambda: cancel_document(DOCTYPE, name))
@frappe.whitelist()
def get_options():
    def run():
        options = common_options()
        options["leave_types"] = frappe.get_list(
            "Leave Type",
            fields=["name", "allow_encashment", "non_encashable_leaves", "max_encashable_leaves"],
            filters={"allow_encashment": 1},
            order_by="name",
            limit_page_length=500,
        )
        options["leave_periods"] = [
            period for period in options["leave_periods"] if period.get("is_active")
        ]
        return options
    return api_call("Leave Encashment API", run)
@frappe.whitelist()
def get_encashment_details(employee, leave_period, leave_type, encashment_date=None):
    def run():
        doc = frappe.new_doc(DOCTYPE)
        doc.update({"employee": employee, "leave_period": leave_period, "leave_type": leave_type, "encashment_date": encashment_date})
        doc.get_leave_details_for_encashment()
        return doc.as_dict()
    return api_call("Leave Encashment Details", run)
@frappe.whitelist()
def get_connections(name): return api_call("Leave Encashment API", lambda: {})
