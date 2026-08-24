import frappe

from education_extension.staff_portal_api.hr.performance import api_call, document, page_result

DOCTYPE = "Energy Point Log"

@frappe.whitelist()
def get_energy_point_logs(page=1, page_size=20, search=None, filters=None):
    fields = ["name", "user", "points", "type", "reference_doctype", "reference_name", "rule", "reason", "creation", "reverted"]
    return api_call("Energy Point Log API", lambda: page_result(DOCTYPE, fields, page, page_size, search, ["name", "user", "reference_name", "reason"], filters, "creation desc"))
@frappe.whitelist()
def get_energy_point_log(name):
    def run():
        result = document(DOCTYPE, name); result["can_edit"] = False; result["can_delete"] = False; return result
    return api_call("Energy Point Log API", run)
@frappe.whitelist()
def get_connections(name): return {}
