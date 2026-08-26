from education_extension.staff_portal_api.recruitment._api import expose

expose(globals(), "Employee Incentive", ["employee", "employee_name", "company", "department", "payroll_date", "currency", "incentive_amount"], ["name", "employee", "employee_name", "payroll_date", "incentive_amount", "docstatus"], ["name", "employee", "employee_name"], submittable=True, filter_fields=["employee", "company"])
