import frappe
from education_extension.staff_portal_api.recruitment._utils import guarded
from ._api import expose
expose(globals(), "Territory", ["territory_name", "parent_territory", "is_group", "territory_manager"], ["name", "territory_name", "parent_territory", "is_group", "territory_manager"], ["name", "territory_name"], filter_fields=["parent_territory", "is_group"])
@frappe.whitelist()
@guarded("Territory connections")
def get_connections(name): return {"customers": frappe.db.count("Customer", {"territory": name})}
