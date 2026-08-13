import json

import frappe
from frappe import _
from frappe.utils import cint

FIELDS = [
    "naming_series", "employee", "posting_date", "purpose", "advance_amount",
    "advance_account", "mode_of_payment", "repay_unclaimed_amount_from_salary",
    "currency", "exchange_rate",
]


@frappe.whitelist()
def get_employee_advances(page=1, page_size=20, search=None, employee=None, status=None, department=None):
    page = cint(page)
    page_size = cint(page_size)

    filters = {k: v for k, v in {"employee": employee, "status": status, "department": department}.items() if v}
    or_filters = [["name", "like", f"%{search}%"], ["employee_name", "like", f"%{search}%"]] if search else []

    rows = frappe.get_all(
        "Employee Advance",
        fields=[
            "name", "employee", "employee_name", "posting_date", "department", "purpose",
            "advance_amount", "paid_amount", "claimed_amount", "return_amount",
            "pending_amount", "currency", "status", "docstatus",
        ],
        filters=filters, or_filters=or_filters,
        order_by="posting_date desc,name desc", start=(page - 1) * page_size, page_length=page_size,
    )
    for r in rows:
        r["can_edit"] = r.docstatus == 0 and frappe.has_permission("Employee Advance", "write", doc=r.name)
        r["can_delete"] = r.docstatus != 1 and frappe.has_permission("Employee Advance", "delete", doc=r.name)

    total = len(frappe.get_all("Employee Advance", filters=filters, or_filters=or_filters, pluck="name", limit_page_length=0))
    return {
        "rows": rows, "count": total, "page": page, "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size else 1,
    }


@frappe.whitelist()
def get_employee_advance(name):
    d = frappe.get_doc("Employee Advance", name)
    x = d.as_dict()
    x["can_edit"] = d.docstatus == 0 and d.has_permission("write")
    x["can_delete"] = d.docstatus != 1 and d.has_permission("delete")
    return x


def setf(d, x):
    for f in FIELDS:
        if f in x:
            d.set(f, x.get(f))


@frappe.whitelist()
def create_employee_advance(data):
    x = json.loads(data) if isinstance(data, str) else data
    d = frappe.new_doc("Employee Advance")
    setf(d, x)
    d.insert()
    frappe.db.commit()
    return d.as_dict()


@frappe.whitelist()
def update_employee_advance(name, data):
    x = json.loads(data) if isinstance(data, str) else data
    d = frappe.get_doc("Employee Advance", name)
    if d.docstatus:
        frappe.throw(_("Only draft advances can be edited"))
    setf(d, x)
    d.save()
    frappe.db.commit()
    return d.as_dict()


@frappe.whitelist()
def delete_employee_advance(name):
    d = frappe.get_doc("Employee Advance", name)
    if d.docstatus == 1:
        frappe.throw(_("Cancel before deleting"))
    frappe.delete_doc("Employee Advance", name)
    frappe.db.commit()
    return {"message": "Employee Advance deleted"}


@frappe.whitelist()
def submit_employee_advance(name):
    d = frappe.get_doc("Employee Advance", name)
    d.submit()
    frappe.db.commit()
    return d.as_dict()


@frappe.whitelist()
def cancel_employee_advance(name):
    d = frappe.get_doc("Employee Advance", name)
    d.cancel()
    frappe.db.commit()
    return d.as_dict()


@frappe.whitelist()
def get_employees():
    """Mirrors employee_advance.js's frm.set_query('employee', {filters: {status: 'Active'}})."""
    return frappe.get_all(
        "Employee", fields=["name", "employee_name", "company", "department"],
        filters={"status": "Active"}, order_by="employee_name", limit_page_length=500,
    )


@frappe.whitelist()
def get_options(doctype):
    return frappe.get_all(doctype, fields=["name"], order_by="name", limit_page_length=500)


@frappe.whitelist()
def get_advance_accounts(company, currency=None):
    """Mirrors employee_advance.js's frm.set_query('advance_account', ...):
    root_type Asset, Receivable, not a group, and denominated in either the
    company's own currency or the advance's chosen currency."""
    if not company:
        return []

    filters = {"company": company, "root_type": "Asset", "account_type": "Receivable", "is_group": 0}

    company_currency = frappe.get_cached_value("Company", company, "default_currency")
    currencies = [c for c in {company_currency, currency} if c]
    if currencies:
        filters["account_currency"] = ["in", currencies]

    return frappe.get_all("Account", fields=["name"], filters=filters, order_by="name", limit_page_length=500)


@frappe.whitelist()
def get_default_advance_account(company):
    """Mirrors the real fetch_from on advance_account (company.
    default_employee_advance_account) -- unlike most fetch_from fields this
    one has no fetch_if_empty, so real Desk unconditionally overwrites
    whatever the user picked with this value on every save. Also checks it
    against validate_advance_account_type()'s real requirement
    (account_type == "Receivable") so the frontend can tell the difference
    between "nothing configured" and "configured but wrong account type" --
    the latter would silently fail on save in Desk too, it just LOOKS
    filled-in there."""
    if not company:
        return {"account": None, "valid": False}

    account = frappe.get_cached_value("Company", company, "default_employee_advance_account")
    if not account:
        return {"account": None, "valid": False}

    account_type = frappe.db.get_value("Account", account, "account_type")
    return {"account": account, "valid": account_type == "Receivable", "account_type": account_type}


@frappe.whitelist()
def get_company_currency(company):
    if not company:
        return None
    return frappe.get_cached_value("Company", company, "default_currency")


@frappe.whitelist()
def get_employee_currency(employee, company=None):
    """Mirrors employee_advance.js's employee-change trigger exactly:
    frappe.db.get_value('Salary Structure Assignment', {employee, docstatus:
    1}, 'currency') first, falling back to the Company's own default
    currency only if the employee has no submitted salary structure."""
    if not employee:
        return get_company_currency(company)

    currency = frappe.db.get_value(
        "Salary Structure Assignment", {"employee": employee, "docstatus": 1}, "currency"
    )
    return currency or get_company_currency(company)


@frappe.whitelist()
def get_advance_exchange_rate(from_currency, to_currency):
    """Mirrors employee_advance.js's currency-change trigger: when the
    chosen currency differs from the company's own, Desk calls
    erpnext.setup.utils.get_exchange_rate to seed a live rate (still
    user-editable afterward -- this portal doesn't re-fetch on every
    keystroke, just once when the currency is picked)."""
    if not from_currency or not to_currency or from_currency == to_currency:
        return 1

    from erpnext.setup.utils import get_exchange_rate

    return get_exchange_rate(from_currency, to_currency) or 1
