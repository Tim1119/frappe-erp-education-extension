import json
import frappe
from education_extension.staff_portal_api.recruitment._utils import guarded, parse

@frappe.whitelist()
@guarded("Shift Assignment Tool employees")
def get_employees(company, branch=None, department=None, designation=None, grade=None, employment_type=None):
    filters={k:v for k,v in {"company":company,"branch":branch,"department":department,"designation":designation,"grade":grade,"employment_type":employment_type,"status":"Active"}.items() if v}
    return frappe.get_list("Employee",fields=["name","employee_name","branch","department","designation","default_shift"],filters=filters,order_by="employee_name",limit_page_length=500)

@frappe.whitelist()
@guarded("Shift Assignment Tool assign")
def bulk_assign(data):
    data=parse(data); employees=data.get("employees") or []
    if isinstance(employees,str): employees=json.loads(employees)
    action=data.get("action")
    created=[]
    for employee in employees:
        if action=="Assign Shift":
            doc=frappe.get_doc({"doctype":"Shift Assignment","employee":employee,"shift_type":data.get("shift_type"),"shift_location":data.get("shift_location"),"start_date":data.get("start_date"),"end_date":data.get("end_date"),"status":data.get("status") or "Active"})
        else:
            doc=frappe.get_doc({"doctype":"Shift Schedule Assignment","employee":employee,"shift_schedule":data.get("shift_schedule"),"shift_location":data.get("shift_location"),"create_shifts_after":data.get("start_date"),"enabled":1})
        doc.insert(); created.append(doc.name)
    frappe.db.commit(); return {"created":created,"count":len(created)}

@frappe.whitelist()
@guarded("Shift Assignment Tool requests")
def get_shift_requests(company=None,shift_type=None,approver=None,from_date=None,to_date=None):
    filters={"docstatus":0,"status":"Draft"}
    for k,v in {"company":company,"shift_type":shift_type,"approver":approver}.items():
        if v: filters[k]=v
    if from_date: filters["to_date"]=[">=",from_date]
    if to_date: filters["from_date"]=["<=",to_date]
    return frappe.get_list("Shift Request",fields=["name","employee","employee_name","shift_type","from_date","to_date"],filters=filters,limit_page_length=500)

@frappe.whitelist()
@guarded("Shift Assignment Tool process requests")
def process_requests(names,status):
    names=json.loads(names) if isinstance(names,str) else names
    for name in names:
        doc=frappe.get_doc("Shift Request",name); doc.status=status; doc.save()
    frappe.db.commit(); return {"count":len(names)}
