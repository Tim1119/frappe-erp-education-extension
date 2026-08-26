import frappe
from education_extension.staff_portal_api.recruitment._utils import guarded
from ._api import expose

expose(globals(), "Sales Order",
    ["naming_series", "customer", "customer_name", "order_type", "company", "transaction_date", "delivery_date", "tax_id", "currency", "conversion_rate", "selling_price_list", "price_list_currency", "plc_conversion_rate", "taxes_and_charges", "apply_discount_on", "additional_discount_percentage", "discount_amount", "net_total", "grand_total", "tc_name", "terms", "status", "sales_partner", "commission_rate", "fee_schedule"],
    ["name", "customer", "customer_name", "transaction_date", "delivery_date", "company", "grand_total", "per_delivered", "per_billed", "status", "docstatus"],
    ["name", "customer", "customer_name", "company"],
    {"items": ["item_code", "item_name", "description", "delivery_date", "qty", "uom", "stock_uom", "conversion_factor", "rate", "amount", "warehouse", "prevdoc_docname", "quotation_item", "blanket_order", "purchase_order"], "taxes": ["charge_type", "account_head", "description", "rate", "tax_amount", "total"], "sales_team": ["sales_person", "contact_no", "allocated_percentage", "allocated_amount", "commission_rate", "incentives"]}, True, ["customer", "company", "status", "fee_schedule"], child_filter_fields={"sales_invoice": ("Sales Invoice Item", "parent", "sales_order"), "quotation": ("Sales Order Item", "prevdoc_docname", "parent")})

@frappe.whitelist()
@guarded("Sales Order connections")
def get_connections(name):
    return {
        "sales_invoices": frappe.db.sql("select count(distinct parent) from `tabSales Invoice Item` where sales_order=%s", (name,))[0][0],
        "quotations": frappe.db.sql("select count(distinct prevdoc_docname) from `tabSales Order Item` where parent=%s and prevdoc_docname is not null and prevdoc_docname!=''", (name,))[0][0],
        "material_requests": frappe.db.sql("select count(distinct parent) from `tabMaterial Request Item` where sales_order=%s and docstatus<2", (name,))[0][0],
        "purchase_orders": frappe.db.sql("select count(distinct parent) from `tabPurchase Order Item` where sales_order=%s and docstatus<2", (name,))[0][0],
        "blanket_orders": frappe.db.sql("select count(distinct blanket_order) from `tabSales Order Item` where parent=%s and blanket_order is not null and blanket_order!='' and docstatus<2", (name,))[0][0],
        "payment_entries": len(frappe.get_all("Payment Entry Reference", filters={"reference_doctype":"Sales Order","reference_name":name,"docstatus":1}, distinct=True, pluck="parent")),
        "journal_entries": len(frappe.get_all("Journal Entry Account", filters={"reference_type":"Sales Order","reference_name":name,"docstatus":1}, distinct=True, pluck="parent")),
    }

@frappe.whitelist()
@guarded("Sales Order status")
def set_status(name, status):
    if status not in ("Closed", "Draft"):
        frappe.throw("Unsupported Sales Order status")
    from erpnext.selling.doctype.sales_order.sales_order import update_status
    update_status(status, name)
    frappe.db.commit()
    return {"success": True}
