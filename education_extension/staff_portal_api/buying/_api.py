import frappe

from education_extension.staff_portal_api.recruitment._api import expose as expose_crud
from education_extension.staff_portal_api.recruitment._utils import guarded


def expose(namespace, *args, **kwargs):
    expose_crud(namespace, *args, **kwargs)

    @frappe.whitelist()
    @guarded("Buying default company")
    def get_default_company():
        return frappe.defaults.get_user_default("Company") or frappe.db.get_single_value(
            "Global Defaults", "default_company"
        )

    @frappe.whitelist()
    @guarded("Buying warehouses")
    def get_warehouses(company=None):
        filters = {"is_group": 0}
        if company:
            filters["company"] = company
        return frappe.get_list("Warehouse", fields=["name"], filters=filters,
            order_by="name", limit_page_length=500)

    namespace["get_default_company"] = get_default_company
    namespace["get_warehouses"] = get_warehouses
