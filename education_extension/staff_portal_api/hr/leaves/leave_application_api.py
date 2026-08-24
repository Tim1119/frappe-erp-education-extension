import json

import frappe
from frappe import _
from frappe.utils import cint, flt, getdate, today


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


def _validate_required_approver(data):
    mandatory = frappe.db.get_single_value(
        "HR Settings", "leave_approver_mandatory_in_leave_application"
    )
    if mandatory and not data.get("leave_approver"):
        frappe.throw(_("Leave Approver is required. Configure one on the Employee or Department first."))


@frappe.whitelist()
def create_leave_application(data):
    if isinstance(data, str): data = json.loads(data)
    _validate_required_approver(data)
    doc = frappe.new_doc("Leave Application")
    _set_fields(doc, data)
    doc.insert(); frappe.db.commit()
    return doc.as_dict()


@frappe.whitelist()
def update_leave_application(name, data):
    if isinstance(data, str): data = json.loads(data)
    _validate_required_approver(data)
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


def _safe(title, fn, fallback=None):
    try: return fn()
    except Exception as e:
        frappe.log_error(str(e), title)
        return [] if fallback is None else fallback


@frappe.whitelist()
def get_employees():
    return _safe("Leave Application API", lambda: frappe.get_all("Employee", fields=["name", "employee_name", "department", "company"], filters={"status": "Active"}, order_by="employee_name", limit_page_length=500))


@frappe.whitelist()
def get_employee_details(employee):
    def load():
        if not employee:
            return {}
        return frappe.db.get_value(
            "Employee", employee, ["name", "employee_name", "department", "company"], as_dict=True
        ) or {}
    return _safe("Leave Application Employee Details", load, {})


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
def get_allocated_leaves(employee, date=None):
    def load():
        if not employee:
            return {"leave_allocation": {}, "leave_approver": None, "lwps": []}
        from hrms.hr.doctype.leave_application.leave_application import get_leave_details

        return get_leave_details(employee, date or today())
    return _safe(
        "Leave Application Allocated Leaves",
        load,
        {"leave_allocation": {}, "leave_approver": None, "lwps": []},
    )


@frappe.whitelist()
def get_leave_application_settings():
    return {
        "leave_approver_mandatory": cint(
            frappe.db.get_single_value(
                "HR Settings", "leave_approver_mandatory_in_leave_application"
            )
        )
    }


@frappe.whitelist()
def get_leave_balance(employee, leave_type, date=None, to_date=None):
    def load():
        from hrms.hr.doctype.leave_application.leave_application import get_leave_balance_on

        if not employee or not leave_type:
            return 0
        balance_date = date or today()
        if frappe.db.get_value("Leave Type", leave_type, "is_lwp"):
            return 0
        if not frappe.get_all(
            "Leave Allocation",
            filters={
                "employee": employee,
                "leave_type": leave_type,
                "docstatus": 1,
                "from_date": ["<=", balance_date],
                "to_date": [">=", balance_date],
            },
            pluck="name",
            limit=1,
        ):
            return 0
        balance = get_leave_balance_on(
            employee,
            leave_type,
            balance_date,
            to_date=to_date,
            consider_all_leaves_in_the_allocation_period=True,
        )
        return flt(balance)
    return _safe("Leave Application Balance", load, 0)


@frappe.whitelist()
def get_total_leave_days(employee, leave_type, from_date, to_date, half_day=0, half_day_date=None):
    def load():
        from hrms.hr.doctype.leave_application.leave_application import get_number_of_leave_days

        if not all((employee, leave_type, from_date, to_date)):
            return 0
        return flt(
            get_number_of_leave_days(
                employee, leave_type, from_date, to_date, half_day, half_day_date
            )
        )
    return _safe("Leave Application Total Days", load, 0)


@frappe.whitelist()
def get_allocation_period(employee, leave_type, from_date=None, to_date=None):
    """Return the matching allocation and all valid periods for an early form warning."""
    def load():
        if not employee or not leave_type:
            return {"valid": False, "is_lwp": False, "periods": []}

        is_lwp = bool(frappe.db.get_value("Leave Type", leave_type, "is_lwp"))
        allocations = frappe.get_all(
            "Leave Allocation",
            filters={"employee": employee, "leave_type": leave_type, "docstatus": 1},
            fields=["name", "from_date", "to_date", "total_leaves_allocated"],
            order_by="from_date desc",
            limit_page_length=0,
        )
        start = getdate(from_date) if from_date else None
        end = getdate(to_date) if to_date else start
        matching = next(
            (
                row for row in allocations
                if start and end and getdate(row.from_date) <= start <= end <= getdate(row.to_date)
            ),
            None,
        )
        return {
            "valid": is_lwp or bool(matching),
            "is_lwp": is_lwp,
            "allocation": matching,
            "periods": allocations,
        }
    return _safe(
        "Leave Application Allocation Period",
        load,
        {"valid": False, "is_lwp": False, "periods": []},
    )


@frappe.whitelist()
def get_leave_approvers(employee):
    if not employee: return []
    def load():
        employee_values = frappe.db.get_value(
            "Employee", employee, ["leave_approver", "department"], as_dict=True
        ) or {}
        department = employee_values.get("department")
        users = frappe.get_all("Department Approver", filters={"parent": department, "parenttype": "Department", "parentfield": "leave_approvers"}, pluck="approver", limit_page_length=0) if department else []
        if employee_values.get("leave_approver"):
            users.insert(0, employee_values.get("leave_approver"))
        users = list(dict.fromkeys(users))
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
