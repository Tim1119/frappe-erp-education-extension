from education_extension.staff_portal_api.recruitment._api import expose

expose(globals(), "Salary Component", ["salary_component", "salary_component_abbr", "type", "description", "depends_on_payment_days", "is_tax_applicable", "is_flexible_benefit", "disabled"], ["name", "salary_component_abbr", "type", "disabled"], ["name", "salary_component", "salary_component_abbr"], filter_fields=["type", "disabled"])
