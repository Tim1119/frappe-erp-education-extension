import frappe
from ._api import expose
from ._utils import guarded
expose(globals(), "Job Opening", ["job_title","designation","status","posted_on","closes_on","closed_on","company","department","employment_type","location","staffing_plan","job_requisition","publish","route","description","currency","lower_range","upper_range","salary_per","publish_salary_range"], ["name","job_title","designation","company","department","posted_on","closes_on","status"], ["name","job_title","designation","company"], filter_fields=["status","designation","department","company","job_requisition"], connections={"job_applicants":("Job Applicant","job_title")})

@frappe.whitelist()
@guarded("Job Opening connections")
def get_connections(name=None):
    if not name:
        frappe.throw("Job Opening document name is required")
    opening = frappe.get_doc("Job Opening", name)
    return {"job_applicants": frappe.db.count("Job Applicant", {"job_title": name}),
            "job_requisitions": 1 if opening.job_requisition else 0}
