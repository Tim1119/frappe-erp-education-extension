import json
import frappe
from education_extension.staff_portal_api.recruitment._utils import guarded

FIELDS = ["cust_master_name", "customer_group", "territory", "selling_price_list", "sales_update_frequency", "maintain_same_sales_rate", "editable_price_list_rate", "allow_multiple_items", "allow_item_to_be_added_multiple_times_in_a_transaction", "hide_tax_id"]

@frappe.whitelist()
@guarded("Selling Settings get")
def get():
    doc = frappe.get_single("Selling Settings")
    return {field: doc.get(field) for field in FIELDS}

@frappe.whitelist()
@guarded("Selling Settings update")
def update(data):
    if isinstance(data, str): data = json.loads(data)
    doc = frappe.get_single("Selling Settings")
    for field in FIELDS:
        if field in data: doc.set(field, data[field])
    doc.save(); frappe.db.commit()
    return {field: doc.get(field) for field in FIELDS}
