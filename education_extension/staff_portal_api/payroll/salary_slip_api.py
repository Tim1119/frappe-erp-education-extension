from education_extension.staff_portal_api.recruitment._api import expose

expose(globals(), "Salary Slip", ["employee", "employee_name", "company", "department", "designation", "posting_date", "payroll_frequency", "start_date", "end_date", "salary_structure", "currency", "gross_pay", "total_deduction", "net_pay", "status"], ["name", "employee", "employee_name", "start_date", "end_date", "gross_pay", "net_pay", "status", "docstatus"], ["name", "employee", "employee_name"], submittable=True, filter_fields=["employee", "company", "status"])
