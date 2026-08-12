import json

import frappe
from frappe import _
from frappe.utils import cint


@frappe.whitelist()
def get_sales_invoices(
    page=1,
    page_size=20,
    search=None,
    student=None,
    status=None,
    fee_schedule=None,
    academic_year=None,
    academic_term=None,
):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    if student:
        filters["student"] = student
    if status:
        filters["status"] = status
    if fee_schedule:
        filters["fee_schedule"] = fee_schedule
    if academic_year:
        filters["academic_year"] = academic_year
    if academic_term:
        filters["academic_term"] = academic_term

    or_filters = []
    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["customer_name", "like", f"%{search}%"],
        ]

    rows = frappe.get_all(
        "Sales Invoice",
        fields=[
            "name", "student", "customer_name", "customer",
            "status", "posting_date", "due_date", "grand_total",
            "outstanding_amount", "currency", "fee_schedule", "docstatus",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="posting_date desc, name desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    for row in rows:
        if row.get("student"):
            row["student_name"] = frappe.db.get_value(
                "Student", row["student"], "student_name"
            ) or ""
        else:
            row["student_name"] = ""

    total = frappe.db.count("Sales Invoice", filters=filters)

    return {
        "rows": rows,
        "count": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (
            (total + page_size - 1) // page_size
            if page_size else 1
        ),
    }


@frappe.whitelist()
def get_sales_invoice(name):
    if not name:
        frappe.throw(_("Sales Invoice name is required"))

    doc = frappe.get_doc("Sales Invoice", name)
    data = doc.as_dict()
    if data.get("student"):
        data["student_name"] = frappe.db.get_value(
            "Student", data["student"], "student_name"
        ) or ""

    return data


LAYOUT_FIELD_TYPES = {"Section Break", "Column Break", "Tab Break", "HTML", "Button"}
SYSTEM_CHILD_FIELDS = {"name", "owner", "creation", "modified", "modified_by", "parent", "parentfield", "parenttype", "idx", "docstatus", "doctype"}


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
        "in_list_view": field.get("in_list_view", 0),
        "parent_fieldname": field.get("parent_fieldname"),
        "default": field.get("default"),
        "description": field.get("description"),
        "allow_on_submit": field.get("allow_on_submit", 0),
        "collapsible": field.get("collapsible", 0),
        "collapsible_depends_on": field.get("collapsible_depends_on"),
    }


@frappe.whitelist()
def get_sales_invoice_meta():
    """Return ordered parent and child metadata used by the portal renderer."""
    meta = frappe.get_meta("Sales Invoice")
    child_meta = {}

    for field in meta.fields:
        if field.fieldtype == "Table" and field.options:
            table_meta = frappe.get_meta(field.options)
            child_meta[field.options] = {
                "name": table_meta.name,
                "fields": [_field_dict(child_field) for child_field in table_meta.fields],
            }

    return {
        "name": meta.name,
        "fields": [_field_dict(field) for field in meta.fields],
        "children": child_meta,
    }


def _allowed_link_doctypes():
    allowed = set()
    meta = frappe.get_meta("Sales Invoice")
    all_fields = list(meta.fields)
    for field in meta.fields:
        if field.fieldtype == "Table" and field.options:
            all_fields.extend(frappe.get_meta(field.options).fields)
    for field in all_fields:
        if field.fieldtype == "Link" and field.options and ":" not in field.options:
            allowed.add(field.options)
    return allowed


@frappe.whitelist()
def search_link_options(doctype, search=None):
    if not doctype or doctype not in _allowed_link_doctypes():
        frappe.throw(_("Invalid Sales Invoice link type"))

    meta = frappe.get_meta(doctype)
    title_field = meta.title_field if meta.title_field and meta.has_field(meta.title_field) else None
    fields = ["name"]
    if title_field and title_field != "name":
        fields.append(title_field)

    or_filters = [["name", "like", f"%{search}%"]] if search else []
    if search and title_field:
        or_filters.append([title_field, "like", f"%{search}%"])

    rows = frappe.get_list(
        doctype,
        fields=fields,
        or_filters=or_filters,
        order_by=title_field or "name",
        page_length=500,
    )
    for row in rows:
        row["display_name"] = row.get(title_field) if title_field else row.name
    return rows


SALES_INVOICE_FIELDS = (
    "naming_series", "posting_date", "due_date", "customer", "company",
    "student", "fee_schedule", "currency", "debit_to", "cost_center",
    "apply_discount_on", "discount_amount", "additional_discount_percentage",
    "taxes_and_charges", "tax_category", "is_return", "return_against",
    "letter_head", "select_print_heading", "remarks",
)


def _set_sales_invoice_fields(doc, data):
    for field in SALES_INVOICE_FIELDS:
        if field in data:
            doc.set(field, data[field])

    if "items" in data:
        doc.set("items", [])
        for row in data.get("items", []):
            if row.get("item_code"):
                doc.append("items", {
                    "item_code": row.get("item_code"),
                    "qty": row.get("qty", 1),
                    "rate": row.get("rate", 0),
                    "description": row.get("description"),
                    "income_account": row.get("income_account"),
                    "cost_center": row.get("cost_center") or data.get("cost_center"),
                })

    if "taxes" in data:
        doc.set("taxes", [])
        for row in data.get("taxes", []):
            if row.get("account_head"):
                doc.append("taxes", {
                    "charge_type": row.get("charge_type", "On Net Total"),
                    "account_head": row.get("account_head"),
                    "rate": row.get("rate", 0),
                    "description": row.get("description"),
                })


@frappe.whitelist()
def create_sales_invoice(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc({
        "doctype": "Sales Invoice",
        "naming_series": data.get("naming_series", "ACC-SINV-.YYYY.-"),
        "posting_date": data.get("posting_date"),
        "due_date": data.get("due_date"),
        "customer": data.get("customer"),
        "company": data.get("company"),
        "student": data.get("student"),
        "fee_schedule": data.get("fee_schedule"),
        "currency": data.get("currency", "NGN"),
        "debit_to": data.get("debit_to"),
        "cost_center": data.get("cost_center"),
        "apply_discount_on": data.get("apply_discount_on"),
        "discount_amount": data.get("discount_amount", 0),
        "additional_discount_percentage": data.get("additional_discount_percentage", 0),
        "taxes_and_charges": data.get("taxes_and_charges"),
        "tax_category": data.get("tax_category"),
        "is_return": data.get("is_return", 0),
        "return_against": data.get("return_against"),
        "letter_head": data.get("letter_head"),
        "select_print_heading": data.get("select_print_heading"),
        "remarks": data.get("remarks"),
    })
    _set_sales_invoice_fields(doc, {"items": data.get("items", []), "taxes": data.get("taxes", [])})

    doc.insert()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def update_sales_invoice(name, data):
    if not name:
        frappe.throw(_("Sales Invoice name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Sales Invoice", name)

    _set_sales_invoice_fields(doc, data)

    doc.save()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def delete_sales_invoice(name):
    if not name:
        frappe.throw(_("Sales Invoice name is required"))

    doc = frappe.get_doc("Sales Invoice", name)

    if doc.docstatus == 1:
        frappe.throw(_("Cannot delete a submitted document. Please cancel it first."))

    doc.delete()
    frappe.db.commit()

    return {"message": "Sales Invoice deleted"}


@frappe.whitelist()
def submit_sales_invoice(name):
    if not name:
        frappe.throw(_("Sales Invoice name is required"))

    doc = frappe.get_doc("Sales Invoice", name)

    if doc.docstatus == 1:
        frappe.throw(_("Document is already submitted"))
    if doc.docstatus == 2:
        frappe.throw(_("Cannot submit a cancelled document"))

    doc.submit()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def cancel_sales_invoice(name):
    if not name:
        frappe.throw(_("Sales Invoice name is required"))

    doc = frappe.get_doc("Sales Invoice", name)

    if doc.docstatus == 2:
        frappe.throw(_("Document is already cancelled"))
    if doc.docstatus == 0:
        frappe.throw(_("Cannot cancel a draft document"))

    doc.cancel()
    frappe.db.commit()

    return doc.as_dict()


def _safe_get_all(label, doctype, **kwargs):
    try:
        return frappe.get_all(doctype, limit_page_length=500, **kwargs)
    except Exception as e:
        frappe.log_error(f"Error fetching {label}: {str(e)}", "Sales Invoice API")
        return []


@frappe.whitelist()
def get_customers():
    return _safe_get_all(
        "customers", "Customer", fields=["name", "customer_name"],
        order_by="customer_name",
    )


@frappe.whitelist()
def get_customer_name(customer):
    if not customer:
        return ""
    try:
        return frappe.db.get_value("Customer", customer, "customer_name") or ""
    except Exception as e:
        frappe.log_error(f"Error fetching customer name for {customer}: {str(e)}", "Sales Invoice API")
        return ""


@frappe.whitelist()
def get_submitted_sales_invoices():
    return _safe_get_all(
        "submitted sales invoices", "Sales Invoice",
        fields=["name", "customer", "customer_name", "posting_date"],
        filters={"docstatus": 1}, order_by="posting_date desc, name desc",
    )


@frappe.whitelist()
def get_students():
    return _safe_get_all(
        "students", "Student", fields=["name", "student_name"],
        order_by="student_name",
    )


@frappe.whitelist()
def get_items():
    return _safe_get_all(
        "items", "Item", fields=["name", "item_name", "standard_rate"],
        order_by="item_name",
    )


@frappe.whitelist()
def get_companies():
    return _safe_get_all("companies", "Company", fields=["name"], order_by="name")


@frappe.whitelist()
def get_debit_accounts(company):
    if not company:
        return []
    return _safe_get_all(
        f"debit accounts for {company}", "Account", fields=["name"],
        filters={
            "company": company, "is_group": 0, "root_type": "Asset",
            "account_type": "Receivable",
        },
        order_by="name",
    )


@frappe.whitelist()
def get_income_accounts(company):
    if not company:
        return []
    return _safe_get_all(
        f"income accounts for {company}", "Account", fields=["name"],
        filters={"company": company, "is_group": 0, "root_type": "Income"},
        order_by="name",
    )


@frappe.whitelist()
def get_cost_centers(company):
    if not company:
        return []
    return _safe_get_all(
        f"cost centers for {company}", "Cost Center", fields=["name"],
        filters={"company": company, "is_group": 0}, order_by="name",
    )


@frappe.whitelist()
def get_fee_schedules():
    return _safe_get_all(
        "fee schedules", "Fee Schedule", fields=["name"],
        order_by="creation desc",
    )


@frappe.whitelist()
def get_naming_series():
    try:
        meta = frappe.get_meta("Sales Invoice")
        options = meta.get_field("naming_series").options or ""
        return [series.strip() for series in options.split("\n") if series.strip()]
    except Exception as e:
        frappe.log_error(f"Error fetching naming series: {str(e)}", "Sales Invoice API")
        return ["ACC-SINV-.YYYY.-"]


@frappe.whitelist()
def get_currencies():
    return _safe_get_all(
        "currencies", "Currency", fields=["name"],
        filters={"enabled": 1}, order_by="name",
    )


@frappe.whitelist()
def get_tax_templates():
    return _safe_get_all(
        "tax templates", "Sales Taxes and Charges Template",
        fields=["name"], order_by="name",
    )


@frappe.whitelist()
def get_tax_categories():
    return _safe_get_all(
        "tax categories", "Tax Category", fields=["name"], order_by="name",
    )


@frappe.whitelist()
def get_tax_accounts(company):
    if not company:
        return []
    return _safe_get_all(
        f"tax accounts for {company}", "Account", fields=["name"],
        filters={"company": company, "is_group": 0, "account_type": "Tax"},
        order_by="name",
    )


@frappe.whitelist()
def get_letter_heads():
    return _safe_get_all("letter heads", "Letter Head", fields=["name"], order_by="name")


@frappe.whitelist()
def get_print_headings():
    return _safe_get_all("print headings", "Print Heading", fields=["name"], order_by="name")


@frappe.whitelist()
def get_academic_years():
    return _safe_get_all(
        "academic years", "Academic Year", fields=["name"],
        order_by="name desc",
    )


@frappe.whitelist()
def get_academic_terms(academic_year=None):
    filters = {}
    if academic_year:
        filters["academic_year"] = academic_year
    return _safe_get_all(
        "academic terms", "Academic Term", fields=["name"],
        filters=filters, order_by="name",
    )
