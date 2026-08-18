import frappe
from ._utils import create_doc, delete_doc, employee_details, get_options, guarded, list_docs, single, update_doc

DOCTYPE = "Employee Skill Map"
FIELDS = ["employee"]
SKILLS = ["skill", "proficiency", "evaluation_date"]
EDUCATION = ["school_univ", "qualification", "level", "year_of_passing", "class_per", "maj_opt_subj"]

def tables():
    meta = frappe.get_meta(DOCTYPE)
    result = {"employee_skills": SKILLS}
    for candidate in ("employee_educations", "educations"):
        if meta.has_field(candidate): result[candidate] = EDUCATION
    if meta.has_field("trainings"): result["trainings"] = ["training", "training_date"]
    return result

@frappe.whitelist()
@guarded("Employee Skill Map list")
def get_list(page=1, page_size=20, search=None, employee=None): return list_docs(DOCTYPE, ["name", "employee", "employee_name", "designation", "modified"], page, page_size, search, ["name", "employee_name"], {"employee": employee})
@frappe.whitelist()
@guarded("Employee Skill Map get")
def get_single(name):
    data = single(DOCTYPE, name, tables()); data["education_field"] = next((x for x in ("employee_educations", "educations") if x in data), None); return data
@frappe.whitelist()
@guarded("Employee Skill Map create")
def create(data): return create_doc(DOCTYPE, data, FIELDS, tables())
@frappe.whitelist()
@guarded("Employee Skill Map update")
def update(name, data): return update_doc(DOCTYPE, name, data, FIELDS, tables())
@frappe.whitelist()
@guarded("Employee Skill Map delete")
def delete(name): return delete_doc(DOCTYPE, name)
@frappe.whitelist()
@guarded("Employee Skill Map connections")
def get_connections(name): return {}
@frappe.whitelist()
@guarded("Employee Skill Map employee")
def get_employee_details(employee): return employee_details(employee)
@frappe.whitelist()
@guarded("Employee Skill Map options", list)
def get_lookup_options(doctype): return get_options(doctype)
