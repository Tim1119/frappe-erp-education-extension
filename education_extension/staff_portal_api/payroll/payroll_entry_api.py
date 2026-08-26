from education_extension.staff_portal_api.recruitment._api import expose

expose(globals(), "Payroll Entry", ["company", "posting_date", "payroll_frequency", "start_date", "end_date", "department", "branch", "project", "cost_center", "payment_account", "currency", "exchange_rate", "status"], ["name", "company", "posting_date", "payroll_frequency", "start_date", "end_date", "status", "docstatus"], ["name", "company"], submittable=True, filter_fields=["company", "status"])
