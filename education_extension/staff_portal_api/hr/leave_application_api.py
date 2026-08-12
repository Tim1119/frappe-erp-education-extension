import json

import frappe
from frappe import _
from frappe.utils import cint


FIELDS = ["naming_series", "employee", "leave_type", "from_date", "to_date", "half_day", "half_day_date",
          "description", "leave_approver", "status", "posting_date", "follow_via_email", "salary_slip",
          "letter_head", "color"]


@frappe.whitelist()
def get_leave_applications(page=1, page_size=20, search=None, employee=None, leave_type=None, status=None, department=None, company=None):
    page, page_size = cint(page), cint(page_size)
    filters = {k: v for k, v in {"employee": employee, "leave_type": leave_type, "status": status,
                                  "department": department, "company": company}.items() if v}
    or_filters = [["name", "like", f"%{search}%"], ["employee_name", "like", f"%{search}%"]] if search else []
    fields = ["name", "employee", "employee_name", "leave_type", "from_date", "to_date", "total_leave_days",
              "department", "status", "company", "docstatus", "posting_date"]
    rows = frappe.get_all("Leave Application", fields=fields, filters=filters, or_filters=or_filters,
                          order_by="posting_date desc, name desc", start=(page - 1) * page_size, page_length=page_size)
    for row in rows:
        row["can_edit"] = row.docstatus == 0 and frappe.has_permission("Leave Application", "write", doc=row.name)
    total = len(frappe.get_all("Leave Application", filters=filters, or_filters=or_filters, pluck="name", limit_page_length=0))
    return {"rows": rows, "count": total, "page": page, "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size if page_size else 1}


@frappe.whitelist()
def get_leave_application(name):
    doc = frappe.get_doc("Leave Application", name)
    data = doc.as_dict()
    data["can_edit"] = doc.docstatus == 0 and doc.has_permission("write")
    return data


def _set_fields(doc, data):
    for field in FIELDS:
        if field in data:
            doc.set(field, data.get(field))


@frappe.whitelist()
def create_leave_application(data):
    if isinstance(data, str): data = json.loads(data)
    doc = frappe.new_doc("Leave Application")
    _set_fields(doc, data)
    doc.insert(); frappe.db.commit()
    return doc.as_dict()


@frappe.whitelist()
def update_leave_application(name, data):
    if isinstance(data, str): data = json.loads(data)
    doc = frappe.get_doc("Leave Application", name)
    if doc.docstatus != 0: frappe.throw(_("Only draft leave applications can be edited"))
    _set_fields(doc, data)
    doc.save(); frappe.db.commit()
    return doc.as_dict()


@frappe.whitelist()
def delete_leave_application(name):
    doc = frappe.get_doc("Leave Application", name)
    if doc.docstatus == 1: frappe.throw(_("Cancel the leave application before deleting it"))
    frappe.delete_doc("Leave Application", name); frappe.db.commit()
    return {"message": "Leave Application deleted"}


@frappe.whitelist()
def submit_leave_application(name):
    doc = frappe.get_doc("Leave Application", name); doc.submit(); frappe.db.commit(); return doc.as_dict()


@frappe.whitelist()
def cancel_leave_application(name):
    doc = frappe.get_doc("Leave Application", name); doc.cancel(); frappe.db.commit(); return doc.as_dict()


def _safe(title, fn):
    try: return fn()
    except Exception as e: frappe.log_error(str(e), title); return []


@frappe.whitelist()
def get_employees():
    return _safe("Leave Application API", lambda: frappe.get_all("Employee", fields=["name", "employee_name", "department", "company"], filters={"status": "Active"}, order_by="employee_name", limit_page_length=500))


@frappe.whitelist()
def get_leave_types(employee=None, date=None):
    def load():
        filters = {}
        if employee and date:
            allocated = frappe.get_all("Leave Allocation", filters={"employee": employee, "docstatus": 1,
                "from_date": ["<=", date], "to_date": [">=", date]}, pluck="leave_type", limit_page_length=0)
            unpaid = frappe.get_all("Leave Type", filters={"is_lwp": 1}, pluck="name", limit_page_length=0)
            names = list(dict.fromkeys(allocated + unpaid))
            return frappe.get_all("Leave Type", fields=["name", "is_lwp"], filters={"name": ["in", names]}) if names else []
        return frappe.get_all("Leave Type", fields=["name", "is_lwp"], order_by="name", limit_page_length=500)
    return _safe("Leave Application API", load)


@frappe.whitelist()
def get_leave_approvers(employee):
    if not employee: return []
    def load():
        department = frappe.db.get_value("Employee", employee, "department")
        users = frappe.get_all("Department Approver", filters={"parent": department, "parenttype": "Department", "parentfield": "leave_approvers"}, pluck="approver", limit_page_length=0) if department else []
        return frappe.get_all("User", fields=["name", "full_name"], filters={"name": ["in", users], "enabled": 1}) if users else []
    return _safe("Leave Application API", load)


@frappe.whitelist()
def get_companies(): return _safe("Leave Application API", lambda: frappe.get_all("Company", fields=["name"], order_by="name", limit_page_length=500))
@frappe.whitelist()
def get_departments(): return _safe("Leave Application API", lambda: frappe.get_all("Department", fields=["name"], order_by="name", limit_page_length=500))
@frappe.whitelist()
def get_salary_slips(employee=None): return _safe("Leave Application API", lambda: frappe.get_all("Salary Slip", fields=["name"], filters={"employee": employee} if employee else {}, order_by="posting_date desc", limit_page_length=500))
@frappe.whitelist()
def get_letter_heads(): return _safe("Leave Application API", lambda: frappe.get_all("Letter Head", fields=["name"], order_by="name", limit_page_length=500))


@frappe.whitelist()
def get_connections(leave_application):
    return {"attendance": frappe.db.count("Attendance", {"leave_application": leave_application})}
