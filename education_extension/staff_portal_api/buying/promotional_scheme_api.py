from ._api import expose

expose(
    globals(), "Promotional Scheme",
    ["name", "apply_on", "company", "currency", "selling", "buying", "valid_from", "valid_upto", "disable", "mixed_conditions", "is_cumulative"],
    ["name", "apply_on", "company", "valid_from", "valid_upto", "disable"],
    ["name", "company"],
    {
        "items": ["item_code", "uom"],
        "item_groups": ["item_group", "uom"],
        "brands": ["brand", "uom"],
        "price_discount_slabs": ["disable", "apply_multiple_pricing_rules", "rule_description", "min_qty", "max_qty", "min_amount", "max_amount", "rate_or_discount", "rate", "discount_amount", "discount_percentage", "for_price_list", "warehouse", "threshold_percentage", "validate_applied_rule", "priority", "apply_discount_on_rate"],
        "product_discount_slabs": ["disable", "apply_multiple_pricing_rules", "rule_description", "min_qty", "max_qty", "min_amount", "max_amount", "same_item", "free_item", "free_qty", "free_item_uom", "free_item_rate", "round_free_qty", "warehouse", "threshold_percentage", "priority", "is_recursive", "recurse_for", "apply_recursion_over"],
    },
    filter_fields=["company", "disable"],
)
