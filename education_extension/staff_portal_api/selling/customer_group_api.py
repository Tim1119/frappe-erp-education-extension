import frappe
from education_extension.staff_portal_api.recruitment._utils import guarded
from ._api import expose
expose(globals(), "Customer Group", ["customer_group_name", "parent_customer_group", "is_group", "default_price_list", "payment_terms"], ["name", "customer_group_name", "parent_customer_group", "is_group"], ["name", "customer_group_name"], filter_fields=["parent_customer_group", "is_group"])
@frappe.whitelist()
@guarded("Customer Group connections")
def get_connections(name): return {"customers": frappe.db.count("Customer", {"customer_group": name})}
