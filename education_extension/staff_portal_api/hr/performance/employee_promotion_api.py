import frappe

from education_extension.staff_portal_api.hr.performance import api_call, cancel_document, common_options, delete_document, document, page_result, save_document, submit_document

DOCTYPE = "Employee Promotion"
FIELDS = ["employee", "promotion_date", "company", "salary_currency", "current_ctc", "revised_ctc"]
TABLES = {"promotion_details": ["property", "current", "new", "fieldname"]}

@frappe.whitelist()
def get_employee_promotions(page=1, page_size=20, search=None, filters=None): return api_call("Employee Promotion API", lambda: page_result(DOCTYPE, ["name", "employee", "employee_name", "department", "company", "promotion_date", "current_ctc", "revised_ctc", "docstatus"], page, page_size, search, ["name", "employee", "employee_name"], filters, "promotion_date desc"))
@frappe.whitelist()
def get_employee_promotion(name): return api_call("Employee Promotion API", lambda: document(DOCTYPE, name))
@frappe.whitelist()
def create_employee_promotion(data): return api_call("Employee Promotion API", lambda: save_document(DOCTYPE, data, FIELDS, TABLES))
@frappe.whitelist()
def update_employee_promotion(name, data): return api_call("Employee Promotion API", lambda: save_document(DOCTYPE, data, FIELDS, TABLES, name=name))
@frappe.whitelist()
def delete_employee_promotion(name): return api_call("Employee Promotion API", lambda: delete_document(DOCTYPE, name))
@frappe.whitelist()
def submit_employee_promotion(name): return api_call("Employee Promotion API", lambda: submit_document(DOCTYPE, name))
@frappe.whitelist()
def cancel_employee_promotion(name): return api_call("Employee Promotion API", lambda: cancel_document(DOCTYPE, name))
@frappe.whitelist()
def get_options(): return api_call("Employee Promotion API", common_options)
@frappe.whitelist()
def get_employee_property(employee, fieldname):
    def run():
        from hrms.hr.utils import get_employee_field_property
        detail = get_employee_field_property(employee, fieldname) or {}
        if detail.get("datatype") == "Link" and detail.get("options"):
            detail["link_options"] = frappe.get_list(
                detail["options"], fields=["name"], order_by="name",
                limit_page_length=500,
            )
        return detail
    return api_call("Employee Promotion Property", run)
@frappe.whitelist()
def get_connections(name): return {}
