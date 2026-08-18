import frappe
from ._utils import cancel_doc, create_doc, delete_doc, get_options, guarded, list_docs, single, submit_doc, update_doc

DOCTYPE = "Training Event"
FIELDS = ["event_name", "training_program", "event_status", "has_certificate", "type", "level", "company", "trainer_name", "trainer_email", "supplier", "contact_number", "course", "location", "start_time", "end_time", "introduction"]
TABLES = {"employees": ["employee", "status", "attendance", "is_mandatory"]}

@frappe.whitelist()
@guarded("Training Event list")
def get_list(page=1, page_size=20, search=None, event_status=None, type=None, training_program=None): return list_docs(DOCTYPE, ["name", "event_name", "training_program", "event_status", "type", "location", "start_time", "end_time", "docstatus"], page, page_size, search, ["name", "event_name", "location"], {"event_status": event_status, "type": type, "training_program": training_program})
@frappe.whitelist()
@guarded("Training Event get")
def get_single(name): return single(DOCTYPE, name, TABLES)
@frappe.whitelist()
@guarded("Training Event create")
def create(data): return create_doc(DOCTYPE, data, FIELDS, TABLES)
@frappe.whitelist()
@guarded("Training Event update")
def update(name, data): return update_doc(DOCTYPE, name, data, FIELDS, TABLES)
@frappe.whitelist()
@guarded("Training Event delete")
def delete(name): return delete_doc(DOCTYPE, name)
@frappe.whitelist()
@guarded("Training Event connections")
def get_connections(name): return {"training_feedback": frappe.db.count("Training Feedback", {"training_event": name}), "training_results": frappe.db.count("Training Result", {"training_event": name})}
@frappe.whitelist()
@guarded("Training Event submit")
def submit(name): return submit_doc(DOCTYPE, name)
@frappe.whitelist()
@guarded("Training Event cancel")
def cancel(name): return cancel_doc(DOCTYPE, name)
@frappe.whitelist()
@guarded("Training Event options", list)
def get_lookup_options(doctype): return get_options(doctype, {"status": "Active"} if doctype == "Employee" else {}, ["name", "employee_name", "department"] if doctype == "Employee" else ["name"])
