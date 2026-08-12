import json
import frappe
from frappe.utils import cint

FIELDS=["employee","log_type","time","device_id","skip_auto_attendance"]
@frappe.whitelist()
def get_employee_checkins(page=1,page_size=20,search=None,employee=None,log_type=None,shift=None,attendance=None,date_from=None,date_to=None):
    page,page_size=cint(page),cint(page_size);filters={k:v for k,v in {"employee":employee,"log_type":log_type,"shift":shift,"attendance":attendance}.items() if v}
    if date_from and date_to:filters["time"]=["between",[date_from,f"{date_to} 23:59:59"]]
    elif date_from:filters["time"]=[">=",date_from]
    elif date_to:filters["time"]=["<=",f"{date_to} 23:59:59"]
    ors=[["name","like",f"%{search}%"],["employee","like",f"%{search}%"],["employee_name","like",f"%{search}%"],["device_id","like",f"%{search}%"]] if search else []
    fields=["name","employee","employee_name","log_type","time","shift","device_id","skip_auto_attendance","attendance","latitude","longitude","offshift"]
    rows=frappe.get_all("Employee Checkin",fields=fields,filters=filters,or_filters=ors,order_by="time desc, name desc",start=(page-1)*page_size,page_length=page_size)
    for row in rows:row["can_edit"]=frappe.has_permission("Employee Checkin","write",doc=row.name);row["can_delete"]=frappe.has_permission("Employee Checkin","delete",doc=row.name)
    total=len(frappe.get_all("Employee Checkin",filters=filters,or_filters=ors,pluck="name",limit_page_length=0));return {"rows":rows,"count":total,"page":page,"page_size":page_size,"total_pages":((total+page_size-1)//page_size if page_size else 1)}
@frappe.whitelist()
def get_employee_checkin(name):
    doc=frappe.get_doc("Employee Checkin",name);data=doc.as_dict();data["can_edit"]=doc.has_permission("write");data["can_delete"]=doc.has_permission("delete");data["allow_geolocation_tracking"]=frappe.db.get_single_value("HR Settings","allow_geolocation_tracking") or 0;return data
def _set(doc,data):
    for field in FIELDS:
        if field in data:doc.set(field,data.get(field))
    if "latitude" in data and "longitude" in data:
        doc.latitude=data.get("latitude");doc.longitude=data.get("longitude")
        if data.get("latitude") not in (None,"") and data.get("longitude") not in (None,""):doc.geolocation=json.dumps({"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[float(data.get("longitude")),float(data.get("latitude"))]}}]})
@frappe.whitelist()
def create_employee_checkin(data):
    if isinstance(data,str):data=json.loads(data)
    doc=frappe.new_doc("Employee Checkin");_set(doc,data);doc.insert();frappe.db.commit();return doc.as_dict()
@frappe.whitelist()
def update_employee_checkin(name,data):
    if isinstance(data,str):data=json.loads(data)
    doc=frappe.get_doc("Employee Checkin",name);_set(doc,data);doc.save();frappe.db.commit();return doc.as_dict()
@frappe.whitelist()
def delete_employee_checkin(name):frappe.delete_doc("Employee Checkin",name);frappe.db.commit();return {"message":"Employee Checkin deleted"}
@frappe.whitelist()
def fetch_employee_checkin_shift(name):
    doc=frappe.get_doc("Employee Checkin",name)
    if doc.attendance:frappe.throw("Cancel the linked Attendance before fetching the shift again")
    doc.fetch_shift();doc.save();frappe.db.commit();return doc.as_dict()
def _safe(fn):
    try:return fn()
    except Exception as exc:frappe.log_error(str(exc),"Employee Checkin API");return []
@frappe.whitelist()
def get_employees():return _safe(lambda:frappe.get_all("Employee",fields=["name","employee_name","status"],order_by="employee_name",limit_page_length=500))
@frappe.whitelist()
def get_shift_types():return _safe(lambda:frappe.get_all("Shift Type",fields=["name"],order_by="name",limit_page_length=500))
@frappe.whitelist()
def get_geolocation_setting():return cint(frappe.db.get_single_value("HR Settings","allow_geolocation_tracking") or 0)
