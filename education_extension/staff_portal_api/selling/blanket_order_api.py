from ._api import expose
expose(globals(), "Blanket Order",
    ["naming_series", "blanket_order_type", "customer", "customer_name", "supplier", "supplier_name", "from_date", "to_date", "company", "tc_name", "terms"],
    ["name", "blanket_order_type", "customer", "customer_name", "supplier", "supplier_name", "from_date", "to_date", "company", "docstatus"],
    ["name", "customer", "customer_name", "supplier", "supplier_name"],
    {"items": ["item_code", "item_name", "qty", "rate", "ordered_qty", "terms"]}, True, ["blanket_order_type", "customer", "supplier", "company"], child_filter_fields={"sales_order": ("Sales Order Item", "parent", "blanket_order")})
