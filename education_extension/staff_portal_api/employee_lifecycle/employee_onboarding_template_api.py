import frappe
from ._utils import create_doc, delete_doc, get_options, guarded, list_docs, single, update_doc

DOCTYPE = "Employee Onboarding Template"
FIELDS = ["title", "company", "department", "designation", "employee_grade"]
TABLES = {"activities": ["activity_name", "role", "user", "begin_on", "duration", "task_weight", "required_for_employee_creation", "description"]}

@frappe.whitelist()
@guarded("Onboarding Template list")
def get_list(page=1, page_size=20, search=None, company=None, department=None): return list_docs(DOCTYPE, ["name", "title", "company", "department", "designation", "modified"], page, page_size, search, ["name", "title"], {"company": company, "department": department})
@frappe.whitelist()
@guarded("Onboarding Template get")
def get_single(name): return single(DOCTYPE, name, TABLES)
@frappe.whitelist()
@guarded("Onboarding Template create")
def create(data): return create_doc(DOCTYPE, data, FIELDS, TABLES)
@frappe.whitelist()
@guarded("Onboarding Template update")
def update(name, data): return update_doc(DOCTYPE, name, data, FIELDS, TABLES)
@frappe.whitelist()
@guarded("Onboarding Template delete")
def delete(name): return delete_doc(DOCTYPE, name)
@frappe.whitelist()
@guarded("Onboarding Template connections")
def get_connections(name): return {"employee_onboardings": frappe.db.count("Employee Onboarding", {"employee_onboarding_template": name})}
@frappe.whitelist()
@guarded("Onboarding Template options", list)
def get_lookup_options(doctype, company=None): return get_options(doctype, {"company": company} if doctype == "Department" and company else {})
