import frappe

from education_extension.staff_portal_api.hr.performance import api_call, common_options, delete_document, document, page_result, save_document

DOCTYPE = "Goal"
FIELDS = ["goal_name", "is_group", "parent_goal", "progress", "status", "employee", "start_date", "end_date", "appraisal_cycle", "kra", "description"]

@frappe.whitelist()
def get_goals(page=1, page_size=20, search=None, filters=None):
    fields = ["name", "goal_name", "employee", "employee_name", "company", "parent_goal", "is_group", "progress", "status", "start_date", "end_date", "appraisal_cycle", "kra"]
    return api_call("Goal API", lambda: page_result(DOCTYPE, fields, page, page_size, search, ["name", "goal_name", "employee", "employee_name"], filters, "modified desc"))
@frappe.whitelist()
def get_goal(name): return api_call("Goal API", lambda: document(DOCTYPE, name))
@frappe.whitelist()
def create_goal(data): return api_call("Goal API", lambda: save_document(DOCTYPE, data, FIELDS))
@frappe.whitelist()
def update_goal(name, data): return api_call("Goal API", lambda: save_document(DOCTYPE, data, FIELDS, name=name))
@frappe.whitelist()
def delete_goal(name): return api_call("Goal API", lambda: delete_document(DOCTYPE, name))
@frappe.whitelist()
def get_options(): return api_call("Goal API", common_options)
@frappe.whitelist()
def update_progress(name, progress):
    def run():
        doc = frappe.get_doc(DOCTYPE, name); doc.progress = progress; doc.save(); frappe.db.commit(); return document(DOCTYPE, name)
    return api_call("Goal Progress", run)
@frappe.whitelist()
def get_connections(name): return api_call("Goal API", lambda: {"child_goals": frappe.db.count("Goal", {"parent_goal": name})})
