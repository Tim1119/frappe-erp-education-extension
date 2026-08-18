import frappe
from ._utils import cancel_doc, create_doc, delete_doc, employee_details, get_options, guarded, list_docs, single, submit_doc, update_doc

DOCTYPE = "Employee Grievance"
FIELDS = ["subject", "raised_by", "date", "status", "grievance_against_party", "grievance_against", "grievance_type", "associated_document_type", "associated_document", "description", "cause_of_grievance", "resolved_by", "resolution_date", "employee_responsible", "resolution_detail"]

@frappe.whitelist()
@guarded("Employee Grievance list")
def get_list(page=1, page_size=20, search=None, status=None, grievance_type=None, employee=None): return list_docs(DOCTYPE, ["name", "subject", "raised_by", "employee_name", "grievance_type", "date", "status", "docstatus"], page, page_size, search, ["name", "subject", "employee_name"], {"status": status, "grievance_type": grievance_type, "raised_by": employee})
@frappe.whitelist()
@guarded("Employee Grievance get")
def get_single(name): return single(DOCTYPE, name)
@frappe.whitelist()
@guarded("Employee Grievance create")
def create(data): return create_doc(DOCTYPE, data, FIELDS)
@frappe.whitelist()
@guarded("Employee Grievance update")
def update(name, data): return update_doc(DOCTYPE, name, data, FIELDS)
@frappe.whitelist()
@guarded("Employee Grievance delete")
def delete(name): return delete_doc(DOCTYPE, name)
@frappe.whitelist()
@guarded("Employee Grievance connections")
def get_connections(name): return {}
@frappe.whitelist()
@guarded("Employee Grievance submit")
def submit(name): return submit_doc(DOCTYPE, name)
@frappe.whitelist()
@guarded("Employee Grievance cancel")
def cancel(name): return cancel_doc(DOCTYPE, name)
@frappe.whitelist()
@guarded("Employee Grievance employee")
def get_employee_details(employee): return employee_details(employee)
@frappe.whitelist()
@guarded("Employee Grievance options", list)
def get_lookup_options(doctype):
    if doctype == "DocType":
        return get_options(doctype, {"istable": 0, "issingle": 0}, ["name"])
    return get_options(doctype)
