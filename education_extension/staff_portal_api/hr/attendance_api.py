import json
import frappe
from frappe import _
from frappe.utils import cint

FIELDS = ["naming_series", "employee", "status", "leave_type", "attendance_date", "shift", "late_entry", "early_exit", "half_day_status"]

@frappe.whitelist()
def get_attendances(page=1,page_size=20,search=None,employee=None,status=None,company=None,department=None,shift=None,date_from=None,date_to=None,attendance_request=None):
    page,page_size=cint(page),cint(page_size); filters={k:v for k,v in {"employee":employee,"status":status,"company":company,"department":department,"shift":shift,"attendance_request":attendance_request}.items() if v}
    if date_from and date_to: filters["attendance_date"]=["between",[date_from,date_to]]
    elif date_from: filters["attendance_date"]=[">=",date_from]
    elif date_to: filters["attendance_date"]=["<=",date_to]
    ors=[["name","like",f"%{search}%"],["employee","like",f"%{search}%"],["employee_name","like",f"%{search}%"]] if search else []
    fields=["name","employee","employee_name","attendance_date","status","company","department","shift","working_hours","late_entry","early_exit","docstatus"]
    rows=frappe.get_all("Attendance",fields=fields,filters=filters,or_filters=ors,order_by="attendance_date desc, name desc",start=(page-1)*page_size,page_length=page_size)
    for row in rows:
        row["can_edit"]=row.docstatus==0 and frappe.has_permission("Attendance","write",doc=row.name); row["can_delete"]=row.docstatus!=1 and frappe.has_permission("Attendance","delete",doc=row.name)
    total=len(frappe.get_all("Attendance",filters=filters,or_filters=ors,pluck="name",limit_page_length=0))
    return {"rows":rows,"count":total,"page":page,"page_size":page_size,"total_pages":((total+page_size-1)//page_size if page_size else 1)}

@frappe.whitelist()
def get_attendance(name):
    doc=frappe.get_doc("Attendance",name); data=doc.as_dict(); data["can_edit"]=doc.docstatus==0 and doc.has_permission("write"); data["can_delete"]=doc.docstatus!=1 and doc.has_permission("delete"); return data

def _set(doc,data):
    for field in FIELDS:
        if field in data: doc.set(field,data.get(field))

@frappe.whitelist()
def create_attendance(data):
    if isinstance(data,str): data=json.loads(data)
    doc=frappe.new_doc("Attendance"); _set(doc,data); doc.insert(); frappe.db.commit(); return doc.as_dict()
@frappe.whitelist()
def update_attendance(name,data):
    if isinstance(data,str): data=json.loads(data)
    doc=frappe.get_doc("Attendance",name)
    if doc.docstatus!=0: frappe.throw(_("Only draft attendance can be edited"))
    _set(doc,data); doc.save(); frappe.db.commit(); return doc.as_dict()
@frappe.whitelist()
def delete_attendance(name):
    doc=frappe.get_doc("Attendance",name)
    if doc.docstatus==1: frappe.throw(_("Cancel the attendance before deleting it"))
    frappe.delete_doc("Attendance",name); frappe.db.commit(); return {"message":"Attendance deleted"}
@frappe.whitelist()
def submit_attendance(name): doc=frappe.get_doc("Attendance",name); doc.submit(); frappe.db.commit(); return doc.as_dict()
@frappe.whitelist()
def cancel_attendance(name): doc=frappe.get_doc("Attendance",name); doc.cancel(); frappe.db.commit(); return doc.as_dict()

def _safe(fn):
    try:return fn()
    except Exception as exc: frappe.log_error(str(exc),"Attendance API"); return []
@frappe.whitelist()
def get_employees(): return _safe(lambda:frappe.get_all("Employee",fields=["name","employee_name","company","department"],filters={"status":"Active"},order_by="employee_name",limit_page_length=500))
@frappe.whitelist()
def get_leave_types(): return _safe(lambda:frappe.get_all("Leave Type",fields=["name"],order_by="name",limit_page_length=500))
@frappe.whitelist()
def get_shift_types(): return _safe(lambda:frappe.get_all("Shift Type",fields=["name"],order_by="name",limit_page_length=500))
@frappe.whitelist()
def get_companies(): return _safe(lambda:frappe.get_all("Company",fields=["name"],order_by="name",limit_page_length=500))
@frappe.whitelist()
def get_departments(): return _safe(lambda:frappe.get_all("Department",fields=["name"],order_by="name",limit_page_length=500))
@frappe.whitelist()
def get_connections(attendance): return {"employee_checkins":frappe.db.count("Employee Checkin",{"attendance":attendance})}
