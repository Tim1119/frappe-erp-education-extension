from education_extension.staff_portal_api.recruitment._api import expose

expose(globals(), "Salary Withholding", ["employee", "employee_name", "company", "from_date", "to_date", "reason"], ["name", "employee", "employee_name", "from_date", "to_date", "docstatus"], ["name", "employee", "employee_name"], submittable=True, filter_fields=["employee", "company"])
