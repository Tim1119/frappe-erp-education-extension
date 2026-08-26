from education_extension.staff_portal_api.recruitment._api import expose

expose(globals(), "Salary Structure", ["name", "company", "payroll_frequency", "currency", "is_active", "leave_encashment_amount_per_day", "max_benefits", "salary_slip_based_on_timesheet"], ["name", "company", "payroll_frequency", "currency", "is_active", "docstatus"], ["name", "company"], submittable=True, filter_fields=["company", "is_active"])
