import frappe
from ._utils import create_doc, delete_doc, guarded, list_docs, single, update_doc

DOCTYPE = "Grievance Type"
FIELDS = ["description"]

@frappe.whitelist()
@guarded("Grievance Type list")
def get_list(page=1, page_size=20, search=None): return list_docs(DOCTYPE, ["name", "description"], page, page_size, search, ["name", "description"], order_by="name asc")
@frappe.whitelist()
@guarded("Grievance Type get")
def get_single(name): return single(DOCTYPE, name)
@frappe.whitelist()
@guarded("Grievance Type create")
def create(data):
    values = __import__("json").loads(data) if isinstance(data, str) else data
    doc = frappe.new_doc(DOCTYPE); doc.name = values.get("name"); doc.description = values.get("description"); doc.insert(); frappe.db.commit(); return doc.as_dict()
@frappe.whitelist()
@guarded("Grievance Type update")
def update(name, data): return update_doc(DOCTYPE, name, data, FIELDS)
@frappe.whitelist()
@guarded("Grievance Type delete")
def delete(name): return delete_doc(DOCTYPE, name)
@frappe.whitelist()
@guarded("Grievance Type connections")
def get_connections(name): return {"employee_grievances": frappe.db.count("Employee Grievance", {"grievance_type": name})}
