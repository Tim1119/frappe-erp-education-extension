import frappe
import json
from frappe import _
from frappe.utils import cint

@frappe.whitelist()
def get_fee_structures(
    page=1,
    page_size=20,
    search=None,
    program=None,
    academic_year=None,
    academic_term=None,
    student_category=None,
):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    or_filters = []

    if program:
        filters["program"] = program

    if academic_year:
        filters["academic_year"] = academic_year

    if academic_term:
        filters["academic_term"] = academic_term

    if student_category:
        filters["student_category"] = student_category

    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["program", "like", f"%{search}%"],
        ]

    rows = frappe.get_list(
        "Fee Structure",
        fields=[
            "name",
            "program",
            "student_category",
            "academic_year",
            "academic_term",
            "total_amount",
            "company",
            "docstatus",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="modified desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count(
        "Fee Structure",
        filters=filters,
    )

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
def get_fee_structure(name):
    if not name:
        frappe.throw(_("Fee Structure name is required"))

    doc = frappe.get_doc("Fee Structure", name)
    
    result = doc.as_dict()
    result['docstatus'] = doc.docstatus
    
    if result.get('components'):
        if not isinstance(result['components'], list):
            try:
                result['components'] = frappe.parse_json(result['components'])
            except:
                result['components'] = []
    else:
        result['components'] = []
    
    return result

@frappe.whitelist()
def create_fee_structure(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.new_doc("Fee Structure")
    
    doc.program = data.get("program")
    doc.student_category = data.get("student_category")
    doc.academic_year = data.get("academic_year")
    doc.academic_term = data.get("academic_term")
    doc.company = data.get("company")
    doc.receivable_account = data.get("receivable_account")
    doc.cost_center = data.get("cost_center")
    
    if data.get("components"):
        for component in data.get("components"):
            if component.get("fees_category"):
                doc.append("components", {
                    "fees_category": component.get("fees_category"),
                    "amount": component.get("amount", 0),
                    "discount": component.get("discount", 0),
                    "description": component.get("description"),
                })
    
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def update_fee_structure(name, data):
    if not name:
        frappe.throw(_("Fee Structure name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Fee Structure", name)
    
    if "program" in data:
        doc.program = data.get("program")
    if "student_category" in data:
        doc.student_category = data.get("student_category")
    if "academic_year" in data:
        doc.academic_year = data.get("academic_year")
    if "academic_term" in data:
        doc.academic_term = data.get("academic_term")
    if "company" in data:
        doc.company = data.get("company")
    if "receivable_account" in data:
        doc.receivable_account = data.get("receivable_account")
    if "cost_center" in data:
        doc.cost_center = data.get("cost_center")
    
    if "components" in data:
        doc.set("components", [])
        for component in data.get("components", []):
            if component.get("fees_category"):
                doc.append("components", {
                    "fees_category": component.get("fees_category"),
                    "amount": component.get("amount", 0),
                    "discount": component.get("discount", 0),
                    "description": component.get("description"),
                })
    
    doc.save()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def delete_fee_structure(name):
    if not name:
        frappe.throw(_("Fee Structure name is required"))

    doc = frappe.get_doc("Fee Structure", name)
    
    # Only allow deletion of Draft or Cancelled documents
    if doc.docstatus == 1:
        frappe.throw(_("Cannot delete a submitted document. Please cancel it first."))
    
    doc.delete()
    frappe.db.commit()

    return {"message": "Fee Structure deleted"}

@frappe.whitelist()
def submit_fee_structure(name):
    """Submit a fee structure"""
    if not name:
        frappe.throw(_("Fee Structure name is required"))

    doc = frappe.get_doc("Fee Structure", name)
    
    if doc.docstatus == 1:
        frappe.throw(_("Document is already submitted"))
    if doc.docstatus == 2:
        frappe.throw(_("Cannot submit a cancelled document"))
    
    doc.submit()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def cancel_fee_structure(name):
    """Cancel a fee structure"""
    if not name:
        frappe.throw(_("Fee Structure name is required"))

    doc = frappe.get_doc("Fee Structure", name)
    
    if doc.docstatus == 2:
        frappe.throw(_("Document is already cancelled"))
    if doc.docstatus == 0:
        frappe.throw(_("Cannot cancel a draft document"))
    
    doc.cancel()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def get_programs():
    try:
        return frappe.get_list("Program", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching programs: {str(e)}", "Fee Structure API")
        return []

@frappe.whitelist()
def get_academic_years():
    try:
        return frappe.get_list("Academic Year", fields=["name"], order_by="name desc", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching academic years: {str(e)}", "Fee Structure API")
        return []

@frappe.whitelist()
def get_academic_terms(academic_year=None):
    try:
        filters = {}
        if academic_year:
            filters["academic_year"] = academic_year
        return frappe.get_list("Academic Term", fields=["name"], filters=filters, order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching academic terms: {str(e)}", "Fee Structure API")
        return []

@frappe.whitelist()
def get_student_categories():
    try:
        return frappe.get_list("Student Category", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching student categories: {str(e)}", "Fee Structure API")
        return []

@frappe.whitelist()
def get_fee_categories():
    try:
        return frappe.get_list("Fee Category", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching fee categories: {str(e)}", "Fee Structure API")
        return []

@frappe.whitelist()
def get_companies():
    try:
        return frappe.get_list("Company", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching companies: {str(e)}", "Fee Structure API")
        return []

@frappe.whitelist()
def get_receivable_accounts(company):
    if not company:
        return []
    try:
        return frappe.get_list(
            "Account",
            fields=["name"],
            filters={
                "company": company,
                "is_group": 0,
                "root_type": "Asset",
                "account_type": "Receivable"
            },
            order_by="name",
            limit_page_length=500
        )
    except Exception as e:
        frappe.log_error(f"Error fetching receivable accounts for {company}: {str(e)}", "Fee Structure API")
        return []

@frappe.whitelist()
def get_cost_centers(company):
    if not company:
        return []
    try:
        return frappe.get_list(
            "Cost Center",
            fields=["name"],
            filters={
                "company": company,
                "is_group": 0
            },
            order_by="name",
            limit_page_length=500
        )
    except Exception as e:
        frappe.log_error(f"Error fetching cost centers for {company}: {str(e)}", "Fee Structure API")
        return []