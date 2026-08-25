import frappe
import json
from frappe import _
from frappe.utils import cint

@frappe.whitelist()
def get_fee_categories(
    page=1,
    page_size=20,
    search=None,
):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    or_filters = []

    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["category_name", "like", f"%{search}%"],
            ["description", "like", f"%{search}%"],
        ]

    rows = frappe.get_list(
        "Fee Category",
        fields=[
            "name",
            "category_name",
            "description",
            "item",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="modified desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count(
        "Fee Category",
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
def get_fee_category(name):
    if not name:
        frappe.throw(_("Fee Category name is required"))

    doc = frappe.get_doc("Fee Category", name)
    
    result = doc.as_dict()
    # Ensure item_defaults child table is properly formatted
    if result.get('item_defaults'):
        if not isinstance(result['item_defaults'], list):
            try:
                result['item_defaults'] = frappe.parse_json(result['item_defaults'])
            except:
                result['item_defaults'] = []
    else:
        result['item_defaults'] = []
    
    return result

@frappe.whitelist()
def create_fee_category(data):
    """Create Fee Category using Frappe's built-in validations"""
    if isinstance(data, str):
        data = json.loads(data)

    # Create a new Fee Category document
    doc = frappe.new_doc("Fee Category")
    
    # Set fields
    doc.category_name = data.get("category_name")
    doc.description = data.get("description")
    
    # Add item_defaults
    if data.get("item_defaults"):
        for default_entry in data.get("item_defaults"):
            if default_entry.get("company"):
                doc.append("item_defaults", {
                    "company": default_entry.get("company"),
                    "income_account": default_entry.get("income_account"),
                    "selling_cost_center": default_entry.get("selling_cost_center"),
                })
    
    # This will trigger all validations in the Fee Category model
    # including validate() which runs update_defaults_from_item_group()
    # and validate_duplicate_item_defaults()
    doc.insert()
    frappe.db.commit()

    # Return the complete document with the created item
    return doc.as_dict()

@frappe.whitelist()
def update_fee_category(name, data):
    """Update Fee Category using Frappe's built-in validations"""
    if not name:
        frappe.throw(_("Fee Category name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Fee Category", name)
    
    # Update fields
    # Note: category_name is not allowed to be updated once created
    # because it's used as the Item code
    if "description" in data:
        doc.description = data.get("description")
    
    # Update item_defaults
    if "item_defaults" in data:
        doc.set("item_defaults", [])
        for default_entry in data.get("item_defaults", []):
            if default_entry.get("company"):
                doc.append("item_defaults", {
                    "company": default_entry.get("company"),
                    "income_account": default_entry.get("income_account"),
                    "selling_cost_center": default_entry.get("selling_cost_center"),
                })
    
    # This will trigger all validations and update the associated Item
    doc.save()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def delete_fee_category(name):
    """Delete Fee Category - this will also delete the associated Item"""
    if not name:
        frappe.throw(_("Fee Category name is required"))

    # Get the doc first to access the item
    doc = frappe.get_doc("Fee Category", name)
    
    # The on_trash method in Fee Category model will handle deleting the Item
    doc.delete()
    frappe.db.commit()

    return {"message": "Fee Category deleted"}

@frappe.whitelist()
def get_companies():
    """Get all companies for dropdown"""
    try:
        companies = frappe.get_list(
            "Company",
            fields=["name"],
            order_by="name",
            limit_page_length=500
        )
        return companies
    except Exception as e:
        frappe.log_error(f"Error fetching companies: {str(e)}", "Fee Category API")
        return []

@frappe.whitelist()
def get_accounts(company):
    """Get income accounts for a specific company"""
    if not company:
        return []
    
    try:
        accounts = frappe.get_list(
            "Account",
            fields=["name"],
            filters={
                "company": company,
                "is_group": 0,
                "root_type": "Income"
            },
            order_by="name",
            limit_page_length=500
        )
        return accounts
    except Exception as e:
        frappe.log_error(f"Error fetching accounts for {company}: {str(e)}", "Fee Category API")
        return []

@frappe.whitelist()
def get_cost_centers(company):
    """Get cost centers for a specific company"""
    if not company:
        return []
    
    try:
        cost_centers = frappe.get_list(
            "Cost Center",
            fields=["name"],
            filters={
                "company": company,
                "is_group": 0
            },
            order_by="name",
            limit_page_length=500
        )
        return cost_centers
    except Exception as e:
        frappe.log_error(f"Error fetching cost centers for {company}: {str(e)}", "Fee Category API")
        return []