from ._api import expose
expose(globals(), "Sales Taxes and Charges Template", ["title", "company", "is_default", "disabled", "tax_category"], ["name", "title", "company", "is_default", "disabled"], ["name", "title", "company"], {"taxes": ["charge_type", "account_head", "description", "rate", "tax_amount", "included_in_print_rate", "cost_center"]}, filter_fields=["company", "disabled"])
