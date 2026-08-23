import frappe
from education_extension.staff_portal_api.recruitment._utils import guarded
from ._api import expose

expose(globals(), "Quotation",
    ["naming_series", "quotation_to", "party_name", "customer_name", "company", "transaction_date", "valid_till", "order_type", "currency", "conversion_rate", "selling_price_list", "price_list_currency", "plc_conversion_rate", "taxes_and_charges", "apply_discount_on", "additional_discount_percentage", "discount_amount", "net_total", "grand_total", "tc_name", "terms", "status"],
    ["name", "quotation_to", "party_name", "customer_name", "transaction_date", "valid_till", "company", "grand_total", "status", "docstatus"],
    ["name", "party_name", "customer_name", "company"],
    {"items": ["item_code", "item_name", "description", "qty", "uom", "stock_uom", "conversion_factor", "rate", "amount", "warehouse", "prevdoc_docname", "quotation_item"], "taxes": ["charge_type", "account_head", "description", "rate", "tax_amount", "total"]}, True, ["quotation_to", "party_name", "company", "status"], child_filter_fields={"sales_order": ("Sales Order Item", "parent", "prevdoc_docname")})

@frappe.whitelist()
@guarded("Quotation connections")
def get_connections(name):
    return {
        "sales_orders": frappe.db.sql(
            """select count(distinct parent)
               from `tabSales Order Item`
               where prevdoc_docname=%s and docstatus < 2""",
            (name,),
        )[0][0] or 0,
        "sales_invoices": frappe.db.sql(
            """select count(distinct parent)
               from `tabSales Invoice Item`
               where docstatus < 2 and so_detail in (
                   select name from `tabSales Order Item`
                   where prevdoc_docname=%s and docstatus < 2
               )""",
            (name,),
        )[0][0] or 0,
    }
