from education_extension.staff_portal_api.recruitment._api import expose

expose(
    globals(),
    "Retention Bonus",
    [
        "employee", "employee_name", "department", "company",
        "date_of_joining", "salary_component", "bonus_amount",
        "bonus_payment_date", "currency",
    ],
    [
        "name", "employee", "employee_name", "salary_component",
        "bonus_payment_date", "bonus_amount", "currency", "docstatus",
    ],
    ["name", "employee", "employee_name"],
    submittable=True,
    filter_fields=["employee", "company", "salary_component"],
)
