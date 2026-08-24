import frappe

from education_extension.staff_portal_api.hr.performance import api_call, common_options, delete_document, document, page_result, save_document

DOCTYPE = "KRA"
FIELDS = ["title", "description"]

@frappe.whitelist()
def get_kras(page=1, page_size=20, search=None, filters=None): return api_call("KRA API", lambda: page_result(DOCTYPE, ["name", *FIELDS], page, page_size, search, ["name", "title", "description"], filters, "title asc"))
@frappe.whitelist()
def get_kra(name): return api_call("KRA API", lambda: document(DOCTYPE, name))
@frappe.whitelist()
def create_kra(data): return api_call("KRA API", lambda: save_document(DOCTYPE, data, FIELDS))
@frappe.whitelist()
def update_kra(name, data): return api_call("KRA API", lambda: save_document(DOCTYPE, data, FIELDS, name=name))
@frappe.whitelist()
def delete_kra(name): return api_call("KRA API", lambda: delete_document(DOCTYPE, name))
@frappe.whitelist()
def get_options(): return api_call("KRA API", common_options)
@frappe.whitelist()
def get_connections(name):
    return api_call("KRA API", lambda: {
        "appraisal_templates": frappe.db.sql("SELECT COUNT(DISTINCT parent) FROM `tabAppraisal Template Goal` WHERE key_result_area=%s", name)[0][0] or 0,
        "goals": frappe.db.count("Goal", {"kra": name}),
    })
