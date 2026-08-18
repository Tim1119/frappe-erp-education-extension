import frappe
from ._utils import cancel_doc, create_doc, delete_doc, employee_details, get_options, guarded, list_docs, single, submit_doc, update_doc

DOCTYPE = "Training Feedback"
FIELDS = ["employee", "training_event", "feedback", "rating"]

@frappe.whitelist()
@guarded("Training Feedback list")
def get_list(page=1, page_size=20, search=None, employee=None, training_event=None): return list_docs(DOCTYPE, ["name", "employee", "employee_name", "training_event", "event_name", "trainer_name", "department", "docstatus"], page, page_size, search, ["name", "employee_name", "event_name"], {"employee": employee, "training_event": training_event})
@frappe.whitelist()
@guarded("Training Feedback get")
def get_single(name): return single(DOCTYPE, name)
@frappe.whitelist()
@guarded("Training Feedback create")
def create(data): return create_doc(DOCTYPE, data, FIELDS)
@frappe.whitelist()
@guarded("Training Feedback update")
def update(name, data): return update_doc(DOCTYPE, name, data, FIELDS)
@frappe.whitelist()
@guarded("Training Feedback delete")
def delete(name): return delete_doc(DOCTYPE, name)
@frappe.whitelist()
@guarded("Training Feedback connections")
def get_connections(name): return {}
@frappe.whitelist()
@guarded("Training Feedback submit")
def submit(name): return submit_doc(DOCTYPE, name)
@frappe.whitelist()
@guarded("Training Feedback cancel")
def cancel(name): return cancel_doc(DOCTYPE, name)
@frappe.whitelist()
@guarded("Training Feedback employee")
def get_employee_details(employee): return employee_details(employee)
@frappe.whitelist()
@guarded("Training Feedback event")
def get_training_event(name): return frappe.db.get_value("Training Event", name, ["event_name", "course", "trainer_name"], as_dict=True) or {}
@frappe.whitelist()
@guarded("Training Feedback options", list)
def get_lookup_options(doctype): return get_options(doctype, {"status": "Active"} if doctype == "Employee" else {}, ["name", "employee_name"] if doctype == "Employee" else ["name", "event_name"] if doctype == "Training Event" else ["name"])
