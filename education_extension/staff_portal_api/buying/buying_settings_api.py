import frappe
from frappe import _
from education_extension.staff_portal_api.recruitment._utils import guarded

FIELDS=["supplier_number_format","purchase_order_required","purchase_receipt_required","maintain_same_rate","allow_multiple_items","buying_price_list","action_if_same_rate_is_not_available","role_to_override_stop_action","allow_item_to_be_added_multiple_times_in_a_transaction"]

@frappe.whitelist()
@guarded("Buying Settings get")
def get():
    doc=frappe.get_single("Buying Settings")
    return {field:doc.get(field) for field in FIELDS}

@frappe.whitelist()
@guarded("Buying Settings update")
def update(data):
    if isinstance(data,str):
        import json
        data=json.loads(data)
    doc=frappe.get_single("Buying Settings")
    for field in FIELDS:
        if field in data:
            doc.set(field,data[field])
    doc.save()
    frappe.db.commit()
    return {field:doc.get(field) for field in FIELDS}
