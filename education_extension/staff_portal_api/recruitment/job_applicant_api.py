import frappe
from ._api import expose
from ._utils import guarded
expose(globals(), "Job Applicant", ["applicant_name","email_id","phone_number","country","job_title","designation","status","source","source_name","applicant_rating","cover_letter","resume_attachment","resume_link","currency","lower_range","upper_range"], ["name","applicant_name","email_id","job_title","designation","applicant_rating","status"], ["name","applicant_name","email_id","phone_number"], filter_fields=["status","job_title","designation"], connections={"job_offers":("Job Offer","job_applicant"),"interviews":("Interview","job_applicant")})

@frappe.whitelist()
@guarded("Job Applicant connections")
def get_connections(name):
    applicant = frappe.get_doc("Job Applicant", name)
    return {"job_offers": frappe.db.count("Job Offer", {"job_applicant": name}),
            "interviews": frappe.db.count("Interview", {"job_applicant": name}),
            "employee_referrals": 1 if applicant.employee_referral else 0}
