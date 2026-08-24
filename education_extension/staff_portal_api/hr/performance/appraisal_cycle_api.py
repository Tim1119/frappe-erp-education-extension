import frappe

from education_extension.staff_portal_api.hr.performance import api_call, common_options, delete_document, document, page_result, payload, save_document

DOCTYPE = "Appraisal Cycle"
FIELDS = ["cycle_name", "company", "start_date", "end_date", "description", "branch", "department", "designation", "kra_evaluation_method", "calculate_final_score_based_on_formula", "final_score_formula", "status"]
TABLES = {"appraisees": ["employee", "employee_name", "appraisal_template", "department", "designation", "branch"]}

@frappe.whitelist()
def get_appraisal_cycles(page=1, page_size=20, search=None, filters=None): return api_call("Appraisal Cycle API", lambda: page_result(DOCTYPE, ["name", *FIELDS], page, page_size, search, ["name", "cycle_name", "company"], filters, "start_date desc"))
@frappe.whitelist()
def get_appraisal_cycle(name): return api_call("Appraisal Cycle API", lambda: document(DOCTYPE, name))
@frappe.whitelist()
def create_appraisal_cycle(data): return api_call("Appraisal Cycle API", lambda: save_document(DOCTYPE, data, FIELDS, TABLES))
@frappe.whitelist()
def update_appraisal_cycle(name, data): return api_call("Appraisal Cycle API", lambda: save_document(DOCTYPE, data, FIELDS, TABLES, name=name))
@frappe.whitelist()
def delete_appraisal_cycle(name): return api_call("Appraisal Cycle API", lambda: delete_document(DOCTYPE, name))
@frappe.whitelist()
def get_options(): return api_call("Appraisal Cycle API", common_options)
@frappe.whitelist()
def get_appraisees(data):
    def run():
        values = payload(data)
        doc = frappe.new_doc(DOCTYPE)
        for field in FIELDS:
            if field in values: doc.set(field, values.get(field))
        doc.set_employees()
        return [row.as_dict() for row in doc.appraisees]
    return api_call("Appraisal Cycle Employees", run)
@frappe.whitelist()
def create_appraisals(name):
    def run():
        doc = frappe.get_doc(DOCTYPE, name); doc.create_appraisals(); frappe.db.commit()
        return {"created": frappe.db.count("Appraisal", {"appraisal_cycle": name, "docstatus": ["!=", 2]})}
    return api_call("Appraisal Cycle Create Appraisals", run)
@frappe.whitelist()
def start_cycle(name):
    def run():
        doc = frappe.get_doc(DOCTYPE, name); doc.status = "In Progress"; doc.save(); frappe.db.commit(); return document(DOCTYPE, name)
    return api_call("Appraisal Cycle Start", run)
@frappe.whitelist()
def complete_cycle(name):
    def run():
        doc = frappe.get_doc(DOCTYPE, name); doc.complete_cycle(); frappe.db.commit(); return document(DOCTYPE, name)
    return api_call("Appraisal Cycle Complete", run)
@frappe.whitelist()
def reopen_cycle(name):
    def run():
        doc = frappe.get_doc(DOCTYPE, name)
        doc.check_permission("write")
        doc.status = "In Progress"
        doc.save()
        frappe.db.commit()
        return document(DOCTYPE, name)
    return api_call("Appraisal Cycle Reopen", run)
@frappe.whitelist()
def get_connections(name):
    return api_call(
        "Appraisal Cycle API",
        lambda: {
            "appraisals": frappe.db.count("Appraisal", {"appraisal_cycle": name}),
            "draft_appraisals": frappe.db.count(
                "Appraisal", {"appraisal_cycle": name, "docstatus": 0}
            ),
            "submitted_appraisals": frappe.db.count(
                "Appraisal", {"appraisal_cycle": name, "docstatus": 1}
            ),
            "goals": frappe.db.count("Goal", {"appraisal_cycle": name}),
            "performance_feedback": frappe.db.count(
                "Employee Performance Feedback", {"appraisal_cycle": name}
            ),
        },
    )
