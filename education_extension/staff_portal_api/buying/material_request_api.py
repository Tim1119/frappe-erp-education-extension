import frappe
from education_extension.staff_portal_api.recruitment._utils import guarded
from ._api import expose
expose(globals(),"Material Request",["naming_series","material_request_type","transaction_date","schedule_date","company","set_warehouse","set_from_warehouse","purpose","letter_head"],["name","material_request_type","transaction_date","schedule_date","company","set_warehouse","status","docstatus"],["name","material_request_type","company"],{"items":["item_code","item_name","description","qty","uom","stock_uom","conversion_factor","schedule_date","warehouse","from_warehouse","project","cost_center"]},True,["company","material_request_type","status"])

@frappe.whitelist()
@guarded("Material Request connections")
def get_connections(name):
    return {
        "purchase_orders": frappe.db.sql("select count(distinct parent) from `tabPurchase Order Item` where material_request=%s", (name,))[0][0],
        "supplier_quotations": frappe.db.sql("select count(distinct parent) from `tabSupplier Quotation Item` where material_request=%s", (name,))[0][0],
    }

@frappe.whitelist()
@guarded("Material Request stop")
def stop_material_request(name):
    from erpnext.stock.doctype.material_request.material_request import update_status
    update_status(name, "Stopped")
    frappe.db.commit()
    return {"success": True}

@frappe.whitelist()
@guarded("Material Request reopen")
def unstop_material_request(name):
    from erpnext.stock.doctype.material_request.material_request import update_status
    update_status(name, "Submitted")
    frappe.db.commit()
    return {"success": True}
