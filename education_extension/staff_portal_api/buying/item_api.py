import frappe
from education_extension.staff_portal_api.recruitment._utils import guarded
from ._api import expose
expose(globals(),"Item",["item_code","item_name","item_group","description","stock_uom","is_stock_item","standard_rate","valuation_rate","disabled","is_sales_item","is_purchase_item","has_variants","variant_of","image"],["name","item_name","item_group","stock_uom","standard_rate","is_stock_item","disabled"],["name","item_name","item_group"],filter_fields=["item_group","disabled"],connections={"item_prices":("Item Price","item_code")})

@frappe.whitelist()
@guarded("Item connections")
def get_connections(name):
    return {
        "item_prices": frappe.db.count("Item Price", {"item_code": name}),
        "purchase_order_items": frappe.db.count("Purchase Order Item", {"item_code": name}),
        "material_request_items": frappe.db.count("Material Request Item", {"item_code": name}),
    }
