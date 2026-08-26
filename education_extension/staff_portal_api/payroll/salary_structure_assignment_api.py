from education_extension.staff_portal_api.recruitment._api import expose

expose(globals(), "Salary Structure Assignment", ["employee", "employee_name", "department", "designation", "company", "salary_structure", "from_date", "base", "variable", "income_tax_slab"], ["name", "employee", "employee_name", "salary_structure", "from_date", "base", "docstatus"], ["name", "employee", "employee_name"], submittable=True, filter_fields=["employee", "company", "salary_structure"])
