import frappe

from education_extension.staff_portal_api.hr.leaves import api_call, common_options, delete_document, document, page_result, payload, save_document

DOCTYPE = "Holiday List"
FIELDS = ["holiday_list_name", "from_date", "to_date", "weekly_off", "country", "subdivision"]
TABLES = {"holidays": ["holiday_date", "description", "weekly_off"]}

@frappe.whitelist()
def get_holiday_lists(page=1, page_size=20, search=None, filters=None):
    return api_call("Holiday List API", lambda: page_result(DOCTYPE, ["name", *FIELDS, "total_holidays"], page, page_size, search, ["name", "holiday_list_name"], filters, "from_date desc"))
@frappe.whitelist()
def get_holiday_list(name): return api_call("Holiday List API", lambda: document(DOCTYPE, name))
@frappe.whitelist()
def create_holiday_list(data): return api_call("Holiday List API", lambda: save_document(DOCTYPE, data, FIELDS, TABLES))
@frappe.whitelist()
def update_holiday_list(name, data): return api_call("Holiday List API", lambda: save_document(DOCTYPE, data, FIELDS, TABLES, name))
@frappe.whitelist()
def delete_holiday_list(name): return api_call("Holiday List API", lambda: delete_document(DOCTYPE, name))
@frappe.whitelist()
def get_options(): return api_call("Holiday List API", common_options)
@frappe.whitelist()
def get_weekly_off_dates(data):
    def run():
        values = payload(data)
        doc = frappe.new_doc(DOCTYPE)
        for field in FIELDS:
            if field in values: doc.set(field, values.get(field))
        for row in values.get("holidays") or []: doc.append("holidays", {key: row.get(key) for key in TABLES["holidays"]})
        doc.get_weekly_off_dates()
        return {"holidays": [row.as_dict() for row in doc.holidays]}
    return api_call("Holiday List Weekly Off Dates", run)
@frappe.whitelist()
def get_connections(name):
    return api_call("Holiday List API", lambda: {
        "employees": frappe.db.count("Employee", {"holiday_list": name}),
        "companies": frappe.db.count("Company", {"default_holiday_list": name}),
        "leave_periods": frappe.db.count("Leave Period", {"optional_holiday_list": name}),
    })
