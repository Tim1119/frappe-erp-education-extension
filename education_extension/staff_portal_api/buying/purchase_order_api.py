import frappe
from education_extension.staff_portal_api.recruitment._utils import guarded
from ._api import expose
expose(globals(),"Purchase Order",["naming_series","title","supplier","supplier_name","company","transaction_date","schedule_date","currency","conversion_rate","buying_price_list","price_list_currency","plc_conversion_rate","set_warehouse","taxes_and_charges","apply_discount_on","additional_discount_percentage","discount_amount","tc_name","terms","status","grand_total","net_total","total_qty"],["name","supplier","supplier_name","transaction_date","schedule_date","company","grand_total","per_received","per_billed","status","docstatus"],["name","supplier","supplier_name","company"],{"items":["item_code","item_name","description","schedule_date","qty","uom","stock_uom","conversion_factor","rate","amount","warehouse","material_request","material_request_item","supplier_quotation","supplier_quotation_item","sales_order"],"taxes":["charge_type","account_head","description","rate","tax_amount","total"]},True,["supplier","company","status"],child_filter_fields={"sales_order":("Purchase Order Item","sales_order","parent")})

@frappe.whitelist()
@guarded("Purchase Order connections")
def get_connections(name):
    return {
        "purchase_invoices": frappe.db.sql("select count(distinct parent) from `tabPurchase Invoice Item` where purchase_order=%s", (name,))[0][0],
        "material_requests": frappe.db.sql("select count(distinct material_request) from `tabPurchase Order Item` where parent=%s and material_request is not null and material_request!=''", (name,))[0][0],
    }

@frappe.whitelist()
@guarded("Purchase Order status")
def set_status(name, status):
    if status not in ("Closed", "Submitted", "On Hold"):
        frappe.throw("Unsupported Purchase Order status")
    from erpnext.buying.doctype.purchase_order.purchase_order import update_status
    update_status(status, name)
    frappe.db.commit()
    return {"success": True}
