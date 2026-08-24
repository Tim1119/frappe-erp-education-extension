import frappe
from frappe.utils import now

from education_extension.staff_portal_api.hr.performance import api_call, cancel_document, common_options, delete_document, document, page_result, payload, save_document, submit_document

DOCTYPE = "Employee Performance Feedback"
FIELDS = ["employee", "reviewer", "appraisal", "appraisal_cycle", "feedback", "added_on"]
TABLES = {"feedback_ratings": ["criteria", "per_weightage", "rating"]}

def _prepare(data):
    data = payload(data)
    if data.get("appraisal"):
        data["appraisal_cycle"] = frappe.db.get_value("Appraisal", data.get("appraisal"), "appraisal_cycle")
    data["added_on"] = data.get("added_on") or now()
    return data

@frappe.whitelist()
def get_employee_performance_feedbacks(page=1, page_size=20, search=None, filters=None):
    fields = ["name", "employee", "employee_name", "reviewer", "reviewer_name", "appraisal", "appraisal_cycle", "added_on", "total_score", "docstatus"]
    return api_call("Employee Performance Feedback API", lambda: page_result(DOCTYPE, fields, page, page_size, search, ["name", "employee_name", "reviewer_name"], filters, "added_on desc"))
@frappe.whitelist()
def get_employee_performance_feedback(name): return api_call("Employee Performance Feedback API", lambda: document(DOCTYPE, name))
@frappe.whitelist()
def create_employee_performance_feedback(data): return api_call("Employee Performance Feedback API", lambda: save_document(DOCTYPE, _prepare(data), FIELDS, TABLES))
@frappe.whitelist()
def update_employee_performance_feedback(name, data): return api_call("Employee Performance Feedback API", lambda: save_document(DOCTYPE, _prepare(data), FIELDS, TABLES, name=name))
@frappe.whitelist()
def delete_employee_performance_feedback(name): return api_call("Employee Performance Feedback API", lambda: delete_document(DOCTYPE, name))
@frappe.whitelist()
def submit_employee_performance_feedback(name): return api_call("Employee Performance Feedback API", lambda: submit_document(DOCTYPE, name))
@frappe.whitelist()
def cancel_employee_performance_feedback(name): return api_call("Employee Performance Feedback API", lambda: cancel_document(DOCTYPE, name))
@frappe.whitelist()
def get_options(): return api_call("Employee Performance Feedback API", common_options)
@frappe.whitelist()
def get_feedback_details(appraisal):
    def run():
        appraisal_doc = frappe.get_doc("Appraisal", appraisal)
        template = frappe.get_doc("Appraisal Template", appraisal_doc.appraisal_template)
        return {
            "employee": appraisal_doc.employee,
            "employee_name": appraisal_doc.employee_name,
            "department": appraisal_doc.department,
            "designation": appraisal_doc.designation,
            "company": appraisal_doc.company,
            "appraisal_cycle": appraisal_doc.appraisal_cycle,
            "feedback_ratings": [{"criteria": row.criteria, "per_weightage": row.per_weightage, "rating": 0} for row in template.rating_criteria],
        }
    return api_call("Employee Performance Feedback Details", run)
@frappe.whitelist()
def get_connections(name): return {}
