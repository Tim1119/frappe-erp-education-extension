import json

import frappe
from frappe import _
from frappe.utils import cint


@frappe.whitelist()
def get_companies(page=1, page_size=20, search=None, country=None):
    page = cint(page)
    page_size = cint(page_size)
    filters = {}
    if country:
        filters["country"] = country

    or_filters = []
    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["company_name", "like", f"%{search}%"],
            ["abbr", "like", f"%{search}%"],
        ]

    rows = frappe.get_all(
        "Company",
        fields=[
            "name", "company_name", "abbr", "domain", "country",
            "default_currency", "is_group", "parent_company",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="name asc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )
    for row in rows:
        row["can_edit"] = frappe.has_permission("Company", "write", doc=row.name)
    total = frappe.db.count("Company", filters=filters)
    return {
        "rows": rows,
        "count": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size else 1,
    }


@frappe.whitelist()
def get_company(name):
    if not name:
        frappe.throw(_("Company name is required"))
    doc = frappe.get_doc("Company", name)
    data = doc.as_dict()
    data["can_edit"] = doc.has_permission("write")
    return data


LAYOUT_FIELD_TYPES = {"Section Break", "Column Break", "Tab Break", "HTML", "Button"}


def _field_dict(field):
    return {
        "fieldname": field.get("fieldname"),
        "fieldtype": field.get("fieldtype"),
        "label": field.get("label"),
        "options": field.get("options"),
        "reqd": field.get("reqd", 0),
        "read_only": field.get("read_only", 0),
        "hidden": field.get("hidden", 0),
        "depends_on": field.get("depends_on"),
        "default": field.get("default"),
        "description": field.get("description"),
        "collapsible": field.get("collapsible", 0),
    }


@frappe.whitelist()
def get_company_meta():
    try:
        meta = frappe.get_meta("Company")
        return {"name": meta.name, "fields": [_field_dict(field) for field in meta.fields]}
    except Exception as e:
        frappe.log_error(f"Error fetching Company metadata: {str(e)}", "Company API")
        return {"name": "Company", "fields": []}


def _company_link_doctypes():
    return {
        field.options for field in frappe.get_meta("Company").fields
        if field.fieldtype == "Link" and field.options
    }


@frappe.whitelist()
def get_link_options(doctype, company=None):
    try:
        if not doctype or doctype not in _company_link_doctypes():
            frappe.throw(_("Invalid Company link type"))

        meta = frappe.get_meta(doctype)
        title_field = meta.title_field if meta.title_field and meta.has_field(meta.title_field) else None
        fields = ["name"]
        if title_field and title_field != "name":
            fields.append(title_field)

        rows = frappe.get_list(
            doctype, fields=fields,
            order_by=title_field or "name", page_length=500,
        )
        for row in rows:
            row["display_name"] = row.get(title_field) if title_field else row.name
        return rows
    except Exception as e:
        frappe.log_error(f"Error fetching {doctype} options: {str(e)}", "Company API")
        return []


def _filtered_link_options(doctype, filters, title_field=None):
    """Return consistently shaped options for Company controller queries."""
    fields = ["name"]
    if title_field:
        fields.append(title_field)
    rows = frappe.get_all(
        doctype, fields=fields, filters=filters,
        order_by=title_field or "name", limit_page_length=500,
    )
    for row in rows:
        row["display_name"] = row.get(title_field) if title_field else row.name
    return rows


def _company_options(doctype, company, filters=None):
    if not company:
        return []
    query_filters = {"company": company, "is_group": 0}
    query_filters.update(filters or {})
    return _filtered_link_options(doctype, query_filters)


def _safe_company_options(doctype, company, filters, label):
    try:
        return _company_options(doctype, company, filters)
    except Exception as e:
        frappe.log_error(f"Error fetching {label}: {str(e)}", "Company API")
        return []


@frappe.whitelist()
def get_operating_cost_accounts(company):
    if not company:
        return []
    try:
        return _filtered_link_options(
            "Account", {"company": company, "root_type": "Expense"}
        )
    except Exception as e:
        frappe.log_error(f"Error fetching operating cost accounts: {str(e)}", "Company API")
        return []


@frappe.whitelist()
def get_selling_terms():
    try:
        return _filtered_link_options("Terms and Conditions", {"selling": 1})
    except Exception as e:
        frappe.log_error(f"Error fetching selling terms: {str(e)}", "Company API")
        return []


@frappe.whitelist()
def get_buying_terms():
    try:
        return _filtered_link_options("Terms and Conditions", {"buying": 1})
    except Exception as e:
        frappe.log_error(f"Error fetching buying terms: {str(e)}", "Company API")
        return []


@frappe.whitelist()
def get_sales_contacts(company):
    if not company:
        return []
    try:
        contact_names = frappe.get_all(
            "Dynamic Link",
            filters={"parenttype": "Contact", "link_doctype": "Company", "link_name": company},
            pluck="parent",
            limit_page_length=500,
        )
        if not contact_names:
            return []
        return _filtered_link_options("Contact", {"name": ["in", contact_names]}, "full_name")
    except Exception as e:
        frappe.log_error(f"Error fetching sales contacts: {str(e)}", "Company API")
        return []


@frappe.whitelist()
def get_in_transit_warehouses(company):
    return _safe_company_options("Warehouse", company, {"warehouse_type": "Transit"}, "transit warehouses")


@frappe.whitelist()
def get_sales_return_warehouses(company):
    return _safe_company_options("Warehouse", company, {}, "sales return warehouses")


ACCOUNT_FILTERS = {
    "bank": {"account_type": "Bank"},
    "cash": {"account_type": "Cash"},
    "receivable": {"root_type": "Asset", "account_type": "Receivable"},
    "payable": {"root_type": "Liability", "account_type": "Payable"},
    "expense": {"root_type": "Expense"},
    "income": {"root_type": "Income"},
    "opening_round_off": {"root_type": "Liability", "account_type": "Round Off for Opening"},
    "exchange_gain_loss": {"root_type": ["in", ["Expense", "Income"]]},
    "unrealized_exchange_gain_loss": {"root_type": ["in", ["Expense", "Income", "Equity", "Liability"]]},
    "accumulated_depreciation": {"root_type": "Asset", "account_type": "Accumulated Depreciation"},
    "depreciation_expense": {"root_type": "Expense", "account_type": "Depreciation"},
    "disposal": {"report_type": "Profit and Loss"},
    "inventory": {"account_type": "Stock"},
    "asset_valuation": {"account_type": "Expenses Included In Asset Valuation"},
    "capital_work_in_progress": {"account_type": "Capital Work in Progress"},
    "asset_received_not_billed": {"account_type": "Asset Received But Not Billed"},
    "unrealized_profit_loss": {"root_type": ["in", ["Liability", "Asset"]]},
    "provisional": {"root_type": ["in", ["Liability", "Asset"]]},
    "advance_received": {"root_type": "Liability", "account_type": "Receivable"},
    "advance_paid": {"root_type": "Asset", "account_type": "Payable"},
    "stock_adjustment": {"root_type": "Expense", "account_type": "Stock Adjustment"},
    "expenses_included_valuation": {"root_type": "Expense", "account_type": "Expenses Included in Valuation"},
    "stock_received_not_billed": {"root_type": "Liability", "account_type": "Stock Received But Not Billed"},
}


def _account_options(company, filter_key, label):
    return _safe_company_options("Account", company, ACCOUNT_FILTERS.get(filter_key, {}), label)


@frappe.whitelist()
def get_bank_accounts(company): return _account_options(company, "bank", "bank accounts")

@frappe.whitelist()
def get_cash_accounts(company): return _account_options(company, "cash", "cash accounts")

@frappe.whitelist()
def get_receivable_accounts(company): return _account_options(company, "receivable", "receivable accounts")

@frappe.whitelist()
def get_payable_accounts(company): return _account_options(company, "payable", "payable accounts")

@frappe.whitelist()
def get_expense_accounts(company): return _account_options(company, "expense", "expense accounts")

@frappe.whitelist()
def get_income_accounts(company): return _account_options(company, "income", "income accounts")

@frappe.whitelist()
def get_round_off_accounts(company): return _account_options(company, "expense", "round off accounts")

@frappe.whitelist()
def get_opening_round_off_accounts(company): return _account_options(company, "opening_round_off", "opening round off accounts")

@frappe.whitelist()
def get_write_off_accounts(company): return _account_options(company, "expense", "write off accounts")

@frappe.whitelist()
def get_deferred_expense_accounts(company): return _account_options(company, "", "deferred expense accounts")

@frappe.whitelist()
def get_deferred_revenue_accounts(company): return _account_options(company, "", "deferred revenue accounts")

@frappe.whitelist()
def get_discount_accounts(company): return _account_options(company, "", "discount accounts")

@frappe.whitelist()
def get_exchange_gain_loss_accounts(company): return _account_options(company, "exchange_gain_loss", "exchange gain/loss accounts")

@frappe.whitelist()
def get_unrealized_exchange_gain_loss_accounts(company): return _account_options(company, "unrealized_exchange_gain_loss", "unrealized exchange gain/loss accounts")

@frappe.whitelist()
def get_accumulated_depreciation_accounts(company): return _account_options(company, "accumulated_depreciation", "accumulated depreciation accounts")

@frappe.whitelist()
def get_depreciation_expense_accounts(company): return _account_options(company, "depreciation_expense", "depreciation expense accounts")

@frappe.whitelist()
def get_disposal_accounts(company): return _account_options(company, "disposal", "disposal accounts")

@frappe.whitelist()
def get_inventory_accounts(company): return _account_options(company, "inventory", "inventory accounts")

@frappe.whitelist()
def get_asset_valuation_accounts(company): return _account_options(company, "asset_valuation", "asset valuation accounts")

@frappe.whitelist()
def get_capital_work_in_progress_accounts(company): return _account_options(company, "capital_work_in_progress", "capital work in progress accounts")

@frappe.whitelist()
def get_asset_received_not_billed_accounts(company): return _account_options(company, "asset_received_not_billed", "asset received not billed accounts")

@frappe.whitelist()
def get_unrealized_profit_loss_accounts(company): return _account_options(company, "unrealized_profit_loss", "unrealized profit/loss accounts")

@frappe.whitelist()
def get_provisional_accounts(company): return _account_options(company, "provisional", "provisional accounts")

@frappe.whitelist()
def get_advance_received_accounts(company): return _account_options(company, "advance_received", "advance received accounts")

@frappe.whitelist()
def get_advance_paid_accounts(company): return _account_options(company, "advance_paid", "advance paid accounts")

@frappe.whitelist()
def get_stock_adjustment_accounts(company): return _account_options(company, "stock_adjustment", "stock adjustment accounts")

@frappe.whitelist()
def get_expenses_included_valuation_accounts(company): return _account_options(company, "expenses_included_valuation", "valuation expense accounts")

@frappe.whitelist()
def get_stock_received_not_billed_accounts(company): return _account_options(company, "stock_received_not_billed", "stock received not billed accounts")


@frappe.whitelist()
def get_cost_centers(company):
    return _safe_company_options("Cost Center", company, {}, "cost centers")


@frappe.whitelist()
def create_company(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.new_doc("Company")
    meta = frappe.get_meta("Company")
    valid_fields = {
        field.fieldname for field in meta.fields
        if field.fieldtype not in LAYOUT_FIELD_TYPES
    }
    for field in valid_fields:
        if field in data:
            doc.set(field, data.get(field))
    doc.insert()
    frappe.db.commit()
    return doc.as_dict()


@frappe.whitelist()
def update_company(name, data):
    if not name:
        frappe.throw(_("Company name is required"))
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Company", name)
    meta = frappe.get_meta("Company")
    valid_fields = {
        field.fieldname for field in meta.fields
        if field.fieldtype not in LAYOUT_FIELD_TYPES
    }
    for field in valid_fields:
        if field in data:
            doc.set(field, data.get(field))
    doc.save()
    frappe.db.commit()
    return doc.as_dict()


@frappe.whitelist()
def delete_company(name):
    if not name:
        frappe.throw(_("Company name is required"))
    frappe.delete_doc("Company", name)
    frappe.db.commit()
    return {"message": "Company deleted"}


@frappe.whitelist()
def get_connections(company):
    if not company:
        frappe.throw(_("Company name is required"))
    try:
        return {
            "employees": frappe.db.count("Employee", {"company": company}),
            "departments": frappe.db.count("Department", {"company": company}),
            "purchase_invoices": frappe.db.count("Purchase Invoice", {"company": company}),
            "sales_invoices": frappe.db.count("Sales Invoice", {"company": company}),
        }
    except Exception as e:
        frappe.log_error(f"Error fetching connections for {company}: {str(e)}", "Company API")
        return {"employees": 0, "departments": 0, "purchase_invoices": 0, "sales_invoices": 0}


@frappe.whitelist()
def get_currencies():
    try:
        return frappe.get_all(
            "Currency", fields=["name", "currency_name"],
            filters={"enabled": 1}, order_by="name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching currencies: {str(e)}", "Company API")
        return []


@frappe.whitelist()
def get_countries():
    try:
        return frappe.get_all("Country", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching countries: {str(e)}", "Company API")
        return []


@frappe.whitelist()
def get_parent_companies():
    try:
        return frappe.get_all(
            "Company", fields=["name", "company_name"],
            filters={"is_group": 1}, order_by="name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching parent companies: {str(e)}", "Company API")
        return []


@frappe.whitelist()
def get_domains():
    """Return domain options for Company."""
    try:
        meta = frappe.get_meta("Company")
        field = meta.get_field("domain")
        if field and field.options:
            return [value.strip() for value in field.options.split("\n") if value.strip()]
        return []
    except Exception as e:
        frappe.log_error(f"Error fetching domains: {str(e)}", "Company API")
        return []
