import frappe

from education_extension.staff_portal_api.hr.performance import api_call, common_options, delete_document, document, page_result, save_document

DOCTYPE = "Appraisal Template"
FIELDS = ["template_title", "description"]
TABLES = {"goals": ["key_result_area", "per_weightage"], "rating_criteria": ["criteria", "per_weightage"]}

@frappe.whitelist()
def get_appraisal_templates(page=1, page_size=20, search=None, filters=None):
    return api_call("Appraisal Template API", lambda: page_result(DOCTYPE, ["name", *FIELDS], page, page_size, search, ["name", "template_title", "description"], filters, "template_title asc"))
@frappe.whitelist()
def get_appraisal_template(name): return api_call("Appraisal Template API", lambda: document(DOCTYPE, name))
@frappe.whitelist()
def create_appraisal_template(data): return api_call("Appraisal Template API", lambda: save_document(DOCTYPE, data, FIELDS, TABLES))
@frappe.whitelist()
def update_appraisal_template(name, data): return api_call("Appraisal Template API", lambda: save_document(DOCTYPE, data, FIELDS, TABLES, name=name))
@frappe.whitelist()
def delete_appraisal_template(name): return api_call("Appraisal Template API", lambda: delete_document(DOCTYPE, name))
@frappe.whitelist()
def get_options(): return api_call("Appraisal Template API", common_options)
@frappe.whitelist()
def get_connections(name): return api_call("Appraisal Template API", lambda: {"appraisals": frappe.db.count("Appraisal", {"appraisal_template": name})})
