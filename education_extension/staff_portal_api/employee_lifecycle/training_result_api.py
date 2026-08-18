import frappe
from ._utils import cancel_doc, create_doc, delete_doc, get_options, guarded, list_docs, single, submit_doc, update_doc

DOCTYPE = "Training Result"
FIELDS = ["training_event"]
TABLES = {"employees": ["employee", "hours", "grade", "comments"]}

@frappe.whitelist()
@guarded("Training Result list")
def get_list(page=1, page_size=20, search=None, training_event=None): return list_docs(DOCTYPE, ["name", "training_event", "docstatus", "modified"], page, page_size, search, ["name", "training_event"], {"training_event": training_event})
@frappe.whitelist()
@guarded("Training Result get")
def get_single(name): return single(DOCTYPE, name, TABLES)
@frappe.whitelist()
@guarded("Training Result create")
def create(data): return create_doc(DOCTYPE, data, FIELDS, TABLES)
@frappe.whitelist()
@guarded("Training Result update")
def update(name, data): return update_doc(DOCTYPE, name, data, FIELDS, TABLES)
@frappe.whitelist()
@guarded("Training Result delete")
def delete(name): return delete_doc(DOCTYPE, name)
@frappe.whitelist()
@guarded("Training Result connections")
def get_connections(name): return {}
@frappe.whitelist()
@guarded("Training Result submit")
def submit(name): return submit_doc(DOCTYPE, name)
@frappe.whitelist()
@guarded("Training Result cancel")
def cancel(name): return cancel_doc(DOCTYPE, name)
@frappe.whitelist()
@guarded("Training Result event")
def get_training_event(name): return single("Training Event", name, {"employees": ["employee", "employee_name", "department"]})
@frappe.whitelist()
@guarded("Training Result options", list)
def get_lookup_options(doctype): return get_options(doctype, {"docstatus": 1} if doctype == "Training Event" else {}, ["name", "event_name"] if doctype == "Training Event" else ["name", "employee_name"])
