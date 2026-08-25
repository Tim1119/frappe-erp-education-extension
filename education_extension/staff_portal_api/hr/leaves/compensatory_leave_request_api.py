import json
import frappe
from frappe import _
from frappe.utils import cint

FIELDS = ["employee", "leave_type", "work_from_date", "work_end_date", "half_day", "half_day_date", "reason"]

@frappe.whitelist()
def get_compensatory_leave_requests(page=1, page_size=20, search=None, employee=None, leave_type=None, department=None):
    page, page_size = cint(page), cint(page_size)
    filters = {k: v for k, v in {"employee": employee, "leave_type": leave_type, "department": department}.items() if v}
    ors = [["name", "like", f"%{search}%"], ["employee_name", "like", f"%{search}%"]] if search else []
    fields = ["name", "employee", "employee_name", "department", "leave_type", "work_from_date", "work_end_date", "half_day", "leave_allocation", "docstatus"]
    rows = frappe.get_list("Compensatory Leave Request", fields=fields, filters=filters, or_filters=ors, order_by="work_from_date desc, name desc", start=(page-1)*page_size, page_length=page_size)
    for row in rows: row["can_edit"] = row.docstatus == 0 and frappe.has_permission("Compensatory Leave Request", "write", doc=row.name)
    total = len(frappe.get_list("Compensatory Leave Request", filters=filters, or_filters=ors, pluck="name", limit_page_length=0))
    return {"rows": rows, "count": total, "page": page, "page_size": page_size, "total_pages": (total+page_size-1)//page_size if page_size else 1}

@frappe.whitelist()
def get_compensatory_leave_request(name):
    doc = frappe.get_doc("Compensatory Leave Request", name); data = doc.as_dict(); data["can_edit"] = doc.docstatus == 0 and doc.has_permission("write"); return data

def _set(doc, data):
    for field in FIELDS:
        if field in data: doc.set(field, data.get(field))

@frappe.whitelist()
def create_compensatory_leave_request(data):
    if isinstance(data, str): data = json.loads(data)
    doc = frappe.new_doc("Compensatory Leave Request"); _set(doc, data); doc.insert(); frappe.db.commit(); return doc.as_dict()
@frappe.whitelist()
def update_compensatory_leave_request(name, data):
    if isinstance(data, str): data = json.loads(data)
    doc = frappe.get_doc("Compensatory Leave Request", name)
    if doc.docstatus != 0: frappe.throw(_("Only draft requests can be edited"))
    _set(doc, data); doc.save(); frappe.db.commit(); return doc.as_dict()
@frappe.whitelist()
def delete_compensatory_leave_request(name):
    doc = frappe.get_doc("Compensatory Leave Request", name)
    if doc.docstatus == 1: frappe.throw(_("Cancel the request before deleting it"))
    frappe.delete_doc("Compensatory Leave Request", name); frappe.db.commit(); return {"message": "Compensatory Leave Request deleted"}
@frappe.whitelist()
def submit_compensatory_leave_request(name):
    doc=frappe.get_doc("Compensatory Leave Request", name); doc.submit(); frappe.db.commit(); return doc.as_dict()
@frappe.whitelist()
def cancel_compensatory_leave_request(name):
    doc=frappe.get_doc("Compensatory Leave Request", name); doc.cancel(); frappe.db.commit(); return doc.as_dict()

def _safe(fn):
    try: return fn()
    except Exception as e: frappe.log_error(str(e), "Compensatory Leave Request API"); return []
@frappe.whitelist()
def get_employees(): return _safe(lambda: frappe.get_list("Employee", fields=["name", "employee_name", "department"], filters={"status":"Active"}, order_by="employee_name", limit_page_length=500))
@frappe.whitelist()
def get_compensatory_leave_types(): return _safe(lambda: frappe.get_list("Leave Type", fields=["name"], filters={"is_compensatory":1}, order_by="name", limit_page_length=500))
@frappe.whitelist()
def get_departments(): return _safe(lambda: frappe.get_list("Department", fields=["name"], order_by="name", limit_page_length=500))
