import frappe

from ._api import expose
from ._utils import guarded

expose(globals(), "Staffing Plan", ["company","department","from_date","to_date"], ["name","company","department","from_date","to_date","total_estimated_budget","docstatus"], ["name","company","department"], {"staffing_details":["designation","vacancies","estimated_cost_per_position"]}, True, ["company","department"])


@frappe.whitelist()
@guarded("Staffing Plan connections")
def get_connections(name):
    """Job Opening is the only Recruitment document directly linked to a Staffing Plan."""
    return {"job_openings": frappe.db.count("Job Opening", {"staffing_plan": name})}
