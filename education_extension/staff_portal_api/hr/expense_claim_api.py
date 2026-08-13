import json

import frappe
from frappe import _
from frappe.utils import cint

FIELDS = [
    "naming_series", "employee", "department", "expense_approver",
    "approval_status", "is_paid", "posting_date", "project", "task",
    "remark", "company", "mode_of_payment", "clearance_date",
    "payable_account", "cost_center", "delivery_trip",
]
TABLES = {
    "expenses": [
        "expense_date", "expense_type", "default_account", "description",
        "amount", "sanctioned_amount", "cost_center", "project",
    ],
    "advances": [
        "employee_advance", "posting_date", "advance_account", "advance_paid",
        "unclaimed_amount", "return_amount", "allocated_amount",
    ],
    "taxes": ["account_head", "cost_center", "description", "rate", "tax_amount", "total", "project"],
}


@frappe.whitelist()
def get_expense_claims(page=1, page_size=20, search=None, employee=None, status=None, approval_status=None, company=None, department=None):
    page = cint(page)
    page_size = cint(page_size)

    filters = {k: v for k, v in {
        "employee": employee, "status": status, "approval_status": approval_status,
        "company": company, "department": department,
    }.items() if v}
    or_filters = [["name", "like", f"%{search}%"], ["employee_name", "like", f"%{search}%"]] if search else []
    fields = [
        "name", "employee", "employee_name", "posting_date", "department", "company",
        "approval_status", "status", "total_claimed_amount", "total_sanctioned_amount",
        "total_amount_reimbursed", "grand_total", "docstatus",
    ]

    rows = frappe.get_all(
        "Expense Claim", fields=fields, filters=filters, or_filters=or_filters,
        order_by="posting_date desc,name desc", start=(page - 1) * page_size, page_length=page_size,
    )
    for r in rows:
        r["can_edit"] = r.docstatus == 0 and frappe.has_permission("Expense Claim", "write", doc=r.name)
        r["can_delete"] = r.docstatus != 1 and frappe.has_permission("Expense Claim", "delete", doc=r.name)

    total = len(frappe.get_all("Expense Claim", filters=filters, or_filters=or_filters, pluck="name", limit_page_length=0))
    return {
        "rows": rows, "count": total, "page": page, "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size else 1,
    }


@frappe.whitelist()
def get_expense_claim(name):
    d = frappe.get_doc("Expense Claim", name)
    x = d.as_dict()
    x["can_edit"] = d.docstatus == 0 and d.has_permission("write")
    x["can_delete"] = d.docstatus != 1 and d.has_permission("delete")
    return x


def _set(d, x):
    for f in FIELDS:
        if f in x:
            d.set(f, x.get(f))

    for table, fields in TABLES.items():
        if table in x:
            d.set(table, [])
            for row in x.get(table) or []:
                if any(row.get(f) for f in fields):
                    d.append(table, {f: row.get(f) for f in fields})

    # Mirrors expense_claim.js's client-side set_child_cost_center(): rows
    # left blank by the frontend fall back to the header cost_center. Real
    # Desk only does this in the browser client script, which this custom
    # form never runs -- without replicating it here, before_submit()'s
    # validate_account_details() would throw "Cost Center is required" on
    # any expense row the user didn't explicitly set one on.
    if d.cost_center:
        for row in d.get("expenses") or []:
            if not row.cost_center:
                row.cost_center = d.cost_center


@frappe.whitelist()
def create_expense_claim(data):
    x = json.loads(data) if isinstance(data, str) else data
    d = frappe.new_doc("Expense Claim")
    _set(d, x)
    d.insert()
    frappe.db.commit()
    return d.as_dict()


@frappe.whitelist()
def update_expense_claim(name, data):
    x = json.loads(data) if isinstance(data, str) else data
    d = frappe.get_doc("Expense Claim", name)
    if d.docstatus:
        frappe.throw(_("Only draft claims can be edited"))
    _set(d, x)
    d.save()
    frappe.db.commit()
    return d.as_dict()


@frappe.whitelist()
def delete_expense_claim(name):
    d = frappe.get_doc("Expense Claim", name)
    if d.docstatus == 1:
        frappe.throw(_("Cancel before deleting"))
    frappe.delete_doc("Expense Claim", name)
    frappe.db.commit()
    return {"message": "Expense Claim deleted"}


@frappe.whitelist()
def submit_expense_claim(name):
    d = frappe.get_doc("Expense Claim", name)
    d.submit()
    frappe.db.commit()
    return d.as_dict()


@frappe.whitelist()
def cancel_expense_claim(name):
    d = frappe.get_doc("Expense Claim", name)
    d.cancel()
    frappe.db.commit()
    return d.as_dict()


def safe(fn):
    try:
        return fn()
    except Exception as e:
        frappe.log_error(str(e), "Expense Claim API")
        return []


@frappe.whitelist()
def get_employees():
    return safe(lambda: frappe.get_all(
        "Employee", fields=["name", "employee_name", "company", "department"],
        filters={"status": "Active"}, order_by="employee_name", limit_page_length=500,
    ))


@frappe.whitelist()
def get_options(doctype):
    return safe(lambda: frappe.get_all(doctype, fields=["name"], order_by="name", limit_page_length=500))


@frappe.whitelist()
def get_departments(company=None):
    """Mirrors expense_claim.js's frm.set_query('department', {filters: {company}})."""
    filters = {"company": company} if company else {}
    return safe(lambda: frappe.get_all("Department", fields=["name"], filters=filters, order_by="name", limit_page_length=500))


@frappe.whitelist()
def get_tasks(project=None):
    """Mirrors expense_claim.js's frm.set_query('task', {filters: {project}}) --
    real Desk behavior shows no options at all until a Project is chosen."""
    if not project:
        return []
    return safe(lambda: frappe.get_all("Task", fields=["name", "subject"], filters={"project": project}, order_by="name", limit_page_length=500))


@frappe.whitelist()
def get_approvers(employee):
    """Mirrors expense_claim.js's frm.set_query('expense_approver', {query:
    'hrms.hr.doctype.department_approver.department_approver.get_approvers',
    filters: {employee, doctype: 'Expense Claim'}}) -- reused directly rather
    than re-deriving the department-tree + employee.expense_approver lookup
    here. The real function throws if nothing is configured (an Employee or
    Department without an Expense Approver set); that's surfaced to the user
    via getErrorMessage() same as any other real validation error."""
    if not employee:
        return []

    from hrms.hr.doctype.department_approver.department_approver import get_approvers as real_get_approvers

    try:
        rows = real_get_approvers(
            doctype="User", txt="", searchfield="name", start=0, page_len=20,
            filters={"employee": employee, "doctype": "Expense Claim"},
        )
    except frappe.ValidationError:
        # expense_approver is NOT reqd:1 on Expense Claim -- an Employee/
        # Department with no Expense Approver configured should just show an
        # empty dropdown, not block the rest of the form.
        return []

    return [
        {"name": name, "full_name": f"{first or ''} {last or ''}".strip() or name}
        for name, first, last in rows
    ]


@frappe.whitelist()
def get_accounts(company, kind):
    if not company:
        return []
    filters = {"company": company, "is_group": 0}
    filters.update(
        {"account_type": "Payable", "report_type": "Balance Sheet"} if kind == "payable"
        else {"account_type": ["in", ["Tax", "Chargeable", "Income Account", "Expenses Included In Valuation"]]}
    )
    return safe(lambda: frappe.get_all("Account", fields=["name"], filters=filters, order_by="name", limit_page_length=500))


@frappe.whitelist()
def get_cost_centers(company):
    if not company:
        return []
    return safe(lambda: frappe.get_all("Cost Center", fields=["name"], filters={"company": company, "is_group": 0}, order_by="name", limit_page_length=500))


@frappe.whitelist()
def get_advances(employee, company=None):
    if not employee:
        return []
    filters = {
        "employee": employee, "docstatus": 1, "paid_amount": [">", 0],
        "status": ["not in", ["Claimed", "Returned", "Partly Claimed and Returned"]],
    }
    if company:
        company_currency = frappe.get_cached_value("Company", company, "default_currency")
        if company_currency:
            filters["currency"] = company_currency

    return safe(lambda: frappe.get_all(
        "Employee Advance",
        fields=["name", "posting_date", "paid_amount", "claimed_amount", "return_amount", "advance_account"],
        filters=filters, order_by="posting_date desc", limit_page_length=500,
    ))


@frappe.whitelist()
def get_expense_account_and_cost_center(expense_type, company):
    """Mirrors Expense Claim Detail's real expense_type trigger, which calls
    this exact whitelisted method (hrms.hr.doctype.expense_claim.expense_claim.
    get_expense_claim_account_and_cost_center) -- reused directly rather than
    re-deriving the Expense Claim Type -> Account/Cost Center lookup here."""
    if not expense_type or not company:
        return {}
    from hrms.hr.doctype.expense_claim.expense_claim import get_expense_claim_account_and_cost_center
    return get_expense_claim_account_and_cost_center(expense_type, company)
