from education_extension.staff_portal_api.recruitment._api import expose

expose(globals(), "Payroll Period", ["name", "company", "start_date", "end_date"], ["name", "company", "start_date", "end_date"], ["name", "company"], filter_fields=["company"])
