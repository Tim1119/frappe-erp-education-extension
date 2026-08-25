import json
import frappe
from frappe import _
from frappe.utils import cint

FIELDS=["employee","company","from_date","to_date","half_day","half_day_date","reason","explanation","shift","include_holidays"]
@frappe.whitelist()
def get_attendance_requests(page=1,page_size=20,search=None,employee=None,company=None,department=None,reason=None,date_from=None,date_to=None):
    page,page_size=cint(page),cint(page_size);filters={k:v for k,v in {"employee":employee,"company":company,"department":department,"reason":reason}.items() if v}
    if date_from: filters["from_date"]=[">=",date_from]
    if date_to: filters["to_date"]=["<=",date_to]
    ors=[["name","like",f"%{search}%"],["employee","like",f"%{search}%"],["employee_name","like",f"%{search}%"]] if search else []
    fields=["name","employee","employee_name","department","company","from_date","to_date","reason","half_day","shift","docstatus"]
    rows=frappe.get_list("Attendance Request",fields=fields,filters=filters,or_filters=ors,order_by="from_date desc, name desc",start=(page-1)*page_size,page_length=page_size)
    for row in rows: row["can_edit"]=row.docstatus==0 and frappe.has_permission("Attendance Request","write",doc=row.name);row["can_delete"]=row.docstatus!=1 and frappe.has_permission("Attendance Request","delete",doc=row.name)
    total=len(frappe.get_list("Attendance Request",filters=filters,or_filters=ors,pluck="name",limit_page_length=0));return {"rows":rows,"count":total,"page":page,"page_size":page_size,"total_pages":((total+page_size-1)//page_size if page_size else 1)}
@frappe.whitelist()
def get_attendance_request(name):
    doc=frappe.get_doc("Attendance Request",name);data=doc.as_dict();data["can_edit"]=doc.docstatus==0 and doc.has_permission("write");data["can_delete"]=doc.docstatus!=1 and doc.has_permission("delete")
    try:data["warnings"]=doc.get_attendance_warnings() or []
    except Exception:data["warnings"]=[]
    return data
def _set(doc,data):
    for field in FIELDS:
        if field in data:doc.set(field,data.get(field))
@frappe.whitelist()
def create_attendance_request(data):
    if isinstance(data,str):data=json.loads(data)
    doc=frappe.new_doc("Attendance Request");_set(doc,data);doc.insert();frappe.db.commit();return doc.as_dict()
@frappe.whitelist()
def update_attendance_request(name,data):
    if isinstance(data,str):data=json.loads(data)
    doc=frappe.get_doc("Attendance Request",name)
    if doc.docstatus!=0:frappe.throw(_("Only draft attendance requests can be edited"))
    _set(doc,data);doc.save();frappe.db.commit();return doc.as_dict()
@frappe.whitelist()
def delete_attendance_request(name):
    doc=frappe.get_doc("Attendance Request",name)
    if doc.docstatus==1:frappe.throw(_("Cancel the attendance request before deleting it"))
    frappe.delete_doc("Attendance Request",name);frappe.db.commit();return {"message":"Attendance Request deleted"}
@frappe.whitelist()
def submit_attendance_request(name):doc=frappe.get_doc("Attendance Request",name);doc.submit();frappe.db.commit();return doc.as_dict()
@frappe.whitelist()
def cancel_attendance_request(name):doc=frappe.get_doc("Attendance Request",name);doc.cancel();frappe.db.commit();return doc.as_dict()
def _safe(fn):
    try:return fn()
    except Exception as exc:frappe.log_error(str(exc),"Attendance Request API");return []
@frappe.whitelist()
def get_employees():return _safe(lambda:frappe.get_list("Employee",fields=["name","employee_name","company","department","status"],order_by="employee_name",limit_page_length=500))
@frappe.whitelist()
def get_companies():return _safe(lambda:frappe.get_list("Company",fields=["name"],order_by="name",limit_page_length=500))
@frappe.whitelist()
def get_departments():return _safe(lambda:frappe.get_list("Department",fields=["name"],order_by="name",limit_page_length=500))
@frappe.whitelist()
def get_shift_types():return _safe(lambda:frappe.get_list("Shift Type",fields=["name"],order_by="name",limit_page_length=500))
@frappe.whitelist()
def get_connections(attendance_request):return {"attendances":frappe.db.count("Attendance",{"attendance_request":attendance_request})}
