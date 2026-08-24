import frappe

from education_extension.staff_portal_api.hr.leaves import api_call, common_options, delete_document, document, page_result, save_document

DOCTYPE = "Leave Period"
FIELDS = ["company", "from_date", "to_date", "is_active", "optional_holiday_list"]

@frappe.whitelist()
def get_leave_periods(page=1, page_size=20, search=None, filters=None):
    return api_call("Leave Period API", lambda: page_result(DOCTYPE, ["name", *FIELDS], page, page_size, search, ["name", "company"], filters, "from_date desc"))
@frappe.whitelist()
def get_leave_period(name): return api_call("Leave Period API", lambda: document(DOCTYPE, name))
@frappe.whitelist()
def create_leave_period(data): return api_call("Leave Period API", lambda: save_document(DOCTYPE, data, FIELDS))
@frappe.whitelist()
def update_leave_period(name, data): return api_call("Leave Period API", lambda: save_document(DOCTYPE, data, FIELDS, name=name))
@frappe.whitelist()
def delete_leave_period(name): return api_call("Leave Period API", lambda: delete_document(DOCTYPE, name))
@frappe.whitelist()
def get_options(): return api_call("Leave Period API", common_options)
@frappe.whitelist()
def grant_leaves(name):
    def run():
        assignments = frappe.get_list("Leave Policy Assignment", filters={"leave_period": name, "docstatus": 1}, pluck="name", limit_page_length=0)
        granted = 0
        for assignment_name in assignments:
            assignment = frappe.get_doc("Leave Policy Assignment", assignment_name)
            if not assignment.leaves_allocated:
                assignment.grant_leave_alloc_for_employee()
                assignment.db_set("leaves_allocated", 1)
                granted += 1
        frappe.db.commit()
        return {"processed": len(assignments), "granted": granted}
    return api_call("Leave Period Grant Leaves", run)
@frappe.whitelist()
def get_connections(name):
    return api_call("Leave Period API", lambda: {
        "policy_assignments": frappe.db.count("Leave Policy Assignment", {"leave_period": name}),
        "encashments": frappe.db.count("Leave Encashment", {"leave_period": name}),
    })
