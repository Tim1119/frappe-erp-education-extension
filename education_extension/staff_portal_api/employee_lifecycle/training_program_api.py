import frappe
from ._utils import create_doc, delete_doc, get_options, guarded, list_docs, single, update_doc

DOCTYPE = "Training Program"
FIELDS = ["training_program", "status", "company", "trainer_name", "trainer_email", "supplier", "contact_number", "description"]

@frappe.whitelist()
@guarded("Training Program list")
def get_list(page=1, page_size=20, search=None, status=None, company=None): return list_docs(DOCTYPE, ["name", "training_program", "status", "company", "trainer_name", "modified"], page, page_size, search, ["name", "training_program", "trainer_name"], {"status": status, "company": company})
@frappe.whitelist()
@guarded("Training Program get")
def get_single(name): return single(DOCTYPE, name)
@frappe.whitelist()
@guarded("Training Program create")
def create(data): return create_doc(DOCTYPE, data, FIELDS)
@frappe.whitelist()
@guarded("Training Program update")
def update(name, data): return update_doc(DOCTYPE, name, data, FIELDS)
@frappe.whitelist()
@guarded("Training Program delete")
def delete(name): return delete_doc(DOCTYPE, name)
@frappe.whitelist()
@guarded("Training Program connections")
def get_connections(name): return {"training_events": frappe.db.count("Training Event", {"training_program": name})}
@frappe.whitelist()
@guarded("Training Program options", list)
def get_lookup_options(doctype): return get_options(doctype)
