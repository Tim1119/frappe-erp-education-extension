import frappe
from frappe import _

from education_extension.staff_portal_api.hr.performance import api_call, common_options, delete_document, document, page_result, save_document

DOCTYPE = "Energy Point Rule"
FIELDS = ["enabled", "rule_name", "reference_doctype", "for_doc_event", "field_to_check", "points", "for_assigned_users", "user_field", "multiplier_field", "max_points", "apply_only_once", "condition"]

def _validate(data):
    from education_extension.staff_portal_api.hr.performance import payload
    values = payload(data)
    if not values.get("for_assigned_users") and not values.get("user_field"):
        frappe.throw(_("User Field is required when points are not allotted to assigned users."))
    if values.get("for_doc_event") == "Custom" and not values.get("condition"):
        frappe.throw(_(
            "Condition is required when For Document Event is Custom. "
            "Enter a condition or select a different document event."
        ))
    return values

@frappe.whitelist()
def get_energy_point_rules(page=1, page_size=20, search=None, filters=None): return api_call("Energy Point Rule API", lambda: page_result(DOCTYPE, ["name", *FIELDS], page, page_size, search, ["name", "rule_name", "reference_doctype"], filters, "modified desc"))
@frappe.whitelist()
def get_energy_point_rule(name): return api_call("Energy Point Rule API", lambda: document(DOCTYPE, name))
@frappe.whitelist()
def create_energy_point_rule(data): return api_call("Energy Point Rule API", lambda: save_document(DOCTYPE, _validate(data), FIELDS))
@frappe.whitelist()
def update_energy_point_rule(name, data): return api_call("Energy Point Rule API", lambda: save_document(DOCTYPE, _validate(data), FIELDS, name=name))
@frappe.whitelist()
def delete_energy_point_rule(name): return api_call("Energy Point Rule API", lambda: delete_document(DOCTYPE, name))
@frappe.whitelist()
def get_options(): return api_call("Energy Point Rule API", common_options)
@frappe.whitelist()
def get_reference_fields(reference_doctype):
    def run():
        fields = [field for field in frappe.get_meta(reference_doctype).fields if field.fieldname and field.fieldtype not in {"Section Break", "Column Break", "Tab Break", "HTML", "Button", "Table"}]
        option = lambda field: {"name": field.fieldname, "label": f"{field.label} ({field.fieldname})"}
        return {
            "reference_fields": [option(field) for field in fields],
            "user_fields": [option(field) for field in fields if (field.fieldtype == "Link" and field.options == "User") or field.fieldtype == "Data"] + [{"name": "owner", "label": "Owner"}, {"name": "modified_by", "label": "Modified By"}],
            "numeric_fields": [option(field) for field in fields if field.fieldtype in {"Int", "Float"}],
        }
    return api_call("Energy Point Rule Fields", run)
@frappe.whitelist()
def get_connections(name): return api_call("Energy Point Rule API", lambda: {"logs": frappe.db.count("Energy Point Log", {"rule": name})})
