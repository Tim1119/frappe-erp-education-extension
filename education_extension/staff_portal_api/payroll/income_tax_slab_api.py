from education_extension.staff_portal_api.recruitment._api import expose

expose(globals(), "Income Tax Slab", ["name", "company", "effective_from", "currency", "disabled"], ["name", "company", "effective_from", "currency", "disabled", "docstatus"], ["name", "company"], submittable=True, filter_fields=["company", "disabled"])
