import frappe
from frappe.utils import flt

from education_extension.staff_portal_api.hr.performance import api_call, cancel_document, common_options, delete_document, document, page_result, payload, save_document, submit_document

DOCTYPE = "Appraisal"
FIELDS = ["naming_series", "employee", "company", "appraisal_cycle", "start_date", "end_date", "appraisal_template", "rate_goals_manually", "remarks", "reflections"]
TABLES = {
    "goals": ["kra", "per_weightage", "score", "score_earned"],
    "appraisal_kra": ["kra", "per_weightage", "goal_completion", "goal_score"],
    "self_ratings": ["criteria", "per_weightage", "rating"],
}

def _prepare(data):
    data = payload(data)
    cycle = frappe.db.get_value("Appraisal Cycle", data.get("appraisal_cycle"), ["start_date", "end_date", "kra_evaluation_method"], as_dict=True) if data.get("appraisal_cycle") else None
    if cycle:
        data["start_date"], data["end_date"] = cycle.start_date, cycle.end_date
        data["rate_goals_manually"] = 1 if cycle.kra_evaluation_method == "Manual Rating" else 0
    return data

@frappe.whitelist()
def get_appraisals(page=1, page_size=20, search=None, filters=None):
    fields = ["name", "employee", "employee_name", "department", "designation", "company", "appraisal_cycle", "start_date", "end_date", "total_score", "avg_feedback_score", "final_score", "docstatus"]
    return api_call("Appraisal API", lambda: page_result(DOCTYPE, fields, page, page_size, search, ["name", "employee", "employee_name"], filters, "creation desc"))
@frappe.whitelist()
def get_appraisal(name):
    def run():
        result = document(DOCTYPE, name)
        scores = [flt(row.get("score")) for row in result.get("goals") or [] if row.get("score") is not None]
        result["average_score"] = flt(sum(scores) / len(scores)) if scores else 0
        return result
    return api_call("Appraisal API", run)
@frappe.whitelist()
def create_appraisal(data): return api_call("Appraisal API", lambda: save_document(DOCTYPE, _prepare(data), FIELDS, TABLES))
@frappe.whitelist()
def update_appraisal(name, data): return api_call("Appraisal API", lambda: save_document(DOCTYPE, _prepare(data), FIELDS, TABLES, name=name))
@frappe.whitelist()
def delete_appraisal(name): return api_call("Appraisal API", lambda: delete_document(DOCTYPE, name))
@frappe.whitelist()
def submit_appraisal(name): return api_call("Appraisal API", lambda: submit_document(DOCTYPE, name))
@frappe.whitelist()
def cancel_appraisal(name): return api_call("Appraisal API", lambda: cancel_document(DOCTYPE, name))
@frappe.whitelist()
def get_options(): return api_call("Appraisal API", common_options)
@frappe.whitelist()
def get_template_details(appraisal_template, appraisal_cycle=None):
    def run():
        method = frappe.db.get_value("Appraisal Cycle", appraisal_cycle, "kra_evaluation_method") if appraisal_cycle else "Manual Rating"
        manual = method == "Manual Rating"
        template = frappe.get_doc("Appraisal Template", appraisal_template)
        rows = [{"kra": row.key_result_area, "per_weightage": row.per_weightage, "score": 0, "score_earned": 0} for row in template.goals]
        return {
            "rate_goals_manually": 1 if manual else 0,
            "goals": rows if manual else [],
            "appraisal_kra": [] if manual else [{"kra": row["kra"], "per_weightage": row["per_weightage"], "goal_completion": 0, "goal_score": 0} for row in rows],
            "self_ratings": [{"criteria": row.criteria, "per_weightage": row.per_weightage, "rating": 0} for row in template.rating_criteria],
        }
    return api_call("Appraisal Template Details", run)
@frappe.whitelist()
def get_connections(name): return api_call("Appraisal API", lambda: {"performance_feedback": frappe.db.count("Employee Performance Feedback", {"appraisal": name})})
