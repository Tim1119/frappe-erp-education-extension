import json

import frappe
from frappe import _
from frappe.utils import cint


@frappe.whitelist()
def get_fees(
    page=1,
    page_size=20,
    search=None,
    student=None,
    fee_structure=None,
    academic_year=None,
    academic_term=None,
):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    if student:
        filters["student"] = student
    if fee_structure:
        filters["fee_structure"] = fee_structure
    if academic_year:
        filters["academic_year"] = academic_year
    if academic_term:
        filters["academic_term"] = academic_term

    or_filters = []
    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["student_name", "like", f"%{search}%"],
        ]

    rows = frappe.get_all(
        "Fees",
        fields=[
            "name",
            "student",
            "student_name",
            "program",
            "fee_structure",
            "due_date",
            "posting_date",
            "grand_total",
            "outstanding_amount",
            "docstatus",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="creation desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count("Fees", filters=filters)

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
def get_fee(name):
    if not name:
        frappe.throw(_("Fees name is required"))

    doc = frappe.get_doc("Fees", name)
    result = doc.as_dict()

    if result.get("components"):
        if not isinstance(result["components"], list):
            try:
                result["components"] = frappe.parse_json(result["components"])
            except Exception:
                result["components"] = []
    else:
        result["components"] = []

    return result


@frappe.whitelist()
def create_fee(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc({
        "doctype": "Fees",
        "student": data.get("student"),
        "program_enrollment": data.get("program_enrollment"),
        "fee_structure": data.get("fee_structure"),
        "company": data.get("company"),
        "posting_date": data.get("posting_date"),
        "set_posting_time": data.get("set_posting_time", 0),
        "posting_time": data.get("posting_time"),
        "due_date": data.get("due_date"),
        "student_batch": data.get("student_batch"),
        "student_category": data.get("student_category"),
        "academic_term": data.get("academic_term"),
        "academic_year": data.get("academic_year"),
        "receivable_account": data.get("receivable_account"),
        "income_account": data.get("income_account"),
        "cost_center": data.get("cost_center"),
        "send_payment_request": data.get("send_payment_request", 0),
        "include_payment": data.get("include_payment", 0),
    })

    for row in data.get("components", []):
        if row.get("fees_category"):
            doc.append("components", {
                "fees_category": row.get("fees_category"),
                "amount": row.get("amount"),
                "discount": row.get("discount", 0),
            })

    # doc.validate() runs automatically on insert:
    #  - validate_enrollment() -- program_enrollment's own student must
    #    match the student selected here, else frappe.throw()
    #  - calculate_total() -- grand_total/outstanding_amount/
    #    grand_total_in_words computed from the components table
    #  - set_missing_accounts_and_fields() -- fills company/currency/
    #    receivable_account/income_account/cost_center/contact_email from
    #    Company defaults and the student's guardians where left blank
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def update_fee(name, data):
    if not name:
        frappe.throw(_("Fees name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Fees", name)

    for field in (
        "student", "program_enrollment", "fee_structure", "company",
        "posting_date", "set_posting_time", "posting_time", "due_date",
        "student_batch", "student_category", "academic_term",
        "academic_year", "receivable_account", "income_account",
        "cost_center", "send_payment_request", "letter_head",
        "select_print_heading", "contact_email", "include_payment",
    ):
        if field in data:
            doc.set(field, data[field])

    if "components" in data:
        doc.set("components", [])
        for row in data.get("components", []):
            if row.get("fees_category"):
                doc.append("components", {
                    "fees_category": row.get("fees_category"),
                    "amount": row.get("amount"),
                    "discount": row.get("discount", 0),
                })

    # Frappe itself enforces which fields remain editable once submitted
    # (only letter_head, select_print_heading, contact_email are
    # allow_on_submit -- everything else raises a clear error surfaced via
    # getErrorMessage() if changed on a submitted document).
    doc.save()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def delete_fee(name):
    if not name:
        frappe.throw(_("Fees name is required"))

    doc = frappe.get_doc("Fees", name)

    if doc.docstatus == 1:
        frappe.throw(_("Cannot delete a submitted document. Please cancel it first."))

    doc.delete()
    frappe.db.commit()

    return {"message": "Fees record deleted"}


@frappe.whitelist()
def submit_fee(name):
    if not name:
        frappe.throw(_("Fees name is required"))

    doc = frappe.get_doc("Fees", name)

    if doc.docstatus == 1:
        frappe.throw(_("Document is already submitted"))
    if doc.docstatus == 2:
        frappe.throw(_("Cannot submit a cancelled document"))

    doc.submit()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def cancel_fee(name):
    if not name:
        frappe.throw(_("Fees name is required"))

    doc = frappe.get_doc("Fees", name)

    if doc.docstatus == 2:
        frappe.throw(_("Document is already cancelled"))
    if doc.docstatus == 0:
        frappe.throw(_("Cannot cancel a draft document"))

    doc.cancel()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def get_students():
    try:
        return frappe.get_all(
            "Student", fields=["name", "student_name"],
            order_by="student_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching students: {str(e)}", "Fees API")
        return []


@frappe.whitelist()
def get_program_enrollments():
    try:
        return frappe.get_all(
            "Program Enrollment",
            fields=["name", "student", "student_name", "program"],
            order_by="creation desc", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching class enrollments: {str(e)}", "Fees API")
        return []


@frappe.whitelist()
def get_fee_structures():
    try:
        return frappe.get_all(
            "Fee Structure",
            fields=[
                "name", "program", "academic_year", "academic_term",
                "student_category", "company", "receivable_account",
                "cost_center",
            ],
            order_by="name desc", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching fee structures: {str(e)}", "Fees API")
        return []


@frappe.whitelist()
def get_student_categories():
    try:
        return frappe.get_all("Student Category", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching student categories: {str(e)}", "Fees API")
        return []


@frappe.whitelist()
def get_student_batches():
    try:
        return frappe.get_all("Student Batch Name", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching student batches: {str(e)}", "Fees API")
        return []


@frappe.whitelist()
def get_fee_categories():
    try:
        return frappe.get_all(
            "Fee Category", fields=["name", "item"],
            order_by="name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching fee categories: {str(e)}", "Fees API")
        return []


@frappe.whitelist()
def get_academic_years():
    try:
        return frappe.get_all(
            "Academic Year", fields=["name"], order_by="name desc", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching academic years: {str(e)}", "Fees API")
        return []


@frappe.whitelist()
def get_academic_terms(academic_year=None):
    try:
        filters = {}
        if academic_year:
            filters["academic_year"] = academic_year
        return frappe.get_all(
            "Academic Term", fields=["name"], filters=filters,
            order_by="name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching academic terms: {str(e)}", "Fees API")
        return []


@frappe.whitelist()
def get_companies():
    try:
        return frappe.get_all("Company", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching companies: {str(e)}", "Fees API")
        return []


@frappe.whitelist()
def get_receivable_accounts(company):
    if not company:
        return []
    try:
        return frappe.get_all(
            "Account",
            fields=["name"],
            filters={
                "company": company,
                "is_group": 0,
                "root_type": "Asset",
                "account_type": "Receivable",
            },
            order_by="name",
            limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching receivable accounts for {company}: {str(e)}", "Fees API")
        return []


@frappe.whitelist()
def get_income_accounts(company):
    if not company:
        return []
    try:
        return frappe.get_all(
            "Account",
            fields=["name"],
            filters={
                "company": company,
                "is_group": 0,
                "root_type": "Income",
            },
            order_by="name",
            limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching income accounts for {company}: {str(e)}", "Fees API")
        return []


@frappe.whitelist()
def get_cost_centers(company):
    if not company:
        return []
    try:
        return frappe.get_all(
            "Cost Center",
            fields=["name"],
            filters={"company": company, "is_group": 0},
            order_by="name",
            limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching cost centers for {company}: {str(e)}", "Fees API")
        return []


@frappe.whitelist()
def get_letter_heads():
    try:
        return frappe.get_all("Letter Head", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching letter heads: {str(e)}", "Fees API")
        return []


@frappe.whitelist()
def get_print_headings():
    try:
        return frappe.get_all("Print Heading", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching print headings: {str(e)}", "Fees API")
        return []
