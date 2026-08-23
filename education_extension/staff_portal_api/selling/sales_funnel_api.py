import frappe
from education_extension.staff_portal_api.recruitment._utils import guarded

@frappe.whitelist()
@guarded("Sales Funnel")
def get_data(from_date=None, to_date=None, company=None, chart="sales_funnel"):
    from erpnext.selling.page.sales_funnel.sales_funnel import (
        get_funnel_data,
        get_opp_by_lead_source,
        get_pipeline_data,
    )

    methods = {
        "sales_funnel": get_funnel_data,
        "sales_pipeline": get_pipeline_data,
        "opp_by_lead_source": get_opp_by_lead_source,
    }
    if chart not in methods:
        frappe.throw("Unsupported Sales Funnel chart")
    return methods[chart](from_date, to_date, company)
