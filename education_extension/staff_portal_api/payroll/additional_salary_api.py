from education_extension.staff_portal_api.recruitment._api import expose

expose(globals(), "Additional Salary", ["employee", "employee_name", "company", "department", "salary_component", "type", "payroll_date", "currency", "amount", "overwrite_salary_structure_amount", "ref_doctype", "ref_docname"], ["name", "employee", "employee_name", "salary_component", "payroll_date", "amount", "docstatus"], ["name", "employee", "employee_name"], submittable=True, filter_fields=["employee", "company", "salary_component"])
