import frappe
from ._utils import cancel_doc, create_doc, delete_doc, employee_details, get_options, guarded, list_docs, single, submit_doc, update_doc

DOCTYPE = "Employee Onboarding"
FIELDS = ["job_applicant", "job_offer", "employee_onboarding_template", "company", "employee", "employee_name", "department", "designation", "employee_grade", "holiday_list", "date_of_joining", "boarding_begins_on", "notify_users_by_email"]
TABLES = {"activities": ["activity_name", "role", "user", "begin_on", "duration", "task_weight", "required_for_employee_creation", "description", "task"]}

@frappe.whitelist()
@guarded("Employee Onboarding list")
def get_list(page=1, page_size=20, search=None, boarding_status=None, company=None, department=None, employee=None): return list_docs(DOCTYPE, ["name", "employee", "employee_name", "company", "department", "date_of_joining", "boarding_status", "docstatus"], page, page_size, search, ["name", "employee_name"], {"boarding_status": boarding_status, "company": company, "department": department, "employee": employee})
@frappe.whitelist()
@guarded("Employee Onboarding get")
def get_single(name): return single(DOCTYPE, name, TABLES)
@frappe.whitelist()
@guarded("Employee Onboarding create")
def create(data): return create_doc(DOCTYPE, data, FIELDS, TABLES)
@frappe.whitelist()
@guarded("Employee Onboarding update")
def update(name, data): return update_doc(DOCTYPE, name, data, FIELDS, TABLES)
@frappe.whitelist()
@guarded("Employee Onboarding delete")
def delete(name): return delete_doc(DOCTYPE, name)
@frappe.whitelist()
@guarded("Employee Onboarding connections")
def get_connections(name):
    doc = frappe.get_doc(DOCTYPE, name); return {"employee": 1 if doc.employee else 0, "tasks": frappe.db.count("Task", {"project": doc.project}) if doc.project else 0}
@frappe.whitelist()
@guarded("Employee Onboarding submit")
def submit(name): return submit_doc(DOCTYPE, name)
@frappe.whitelist()
@guarded("Employee Onboarding cancel")
def cancel(name): return cancel_doc(DOCTYPE, name)
@frappe.whitelist()
@guarded("Employee Onboarding template")
def get_template(name): return single("Employee Onboarding Template", name, {"activities": TABLES["activities"]})
@frappe.whitelist()
@guarded("Employee Onboarding employee")
def get_employee_details(employee): return employee_details(employee)
@frappe.whitelist()
@guarded("Employee Onboarding options", list)
def get_lookup_options(doctype):
    filters = {"status": "Accepted"} if doctype == "Job Applicant" else ({"docstatus": 1} if doctype == "Job Offer" else {})
    return get_options(doctype, filters)
