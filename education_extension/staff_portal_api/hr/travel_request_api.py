import json,frappe
from frappe import _
from frappe.utils import cint
FIELDS=["travel_type","travel_funding","travel_proof","purpose_of_travel","details_of_sponsor","description","employee","cell_number","prefered_email","personal_id_type","personal_id_number","passport_number","cost_center","name_of_organizer","address_of_organizer","other_details"]
TABLES={"itinerary":["travel_from","travel_to","mode_of_travel","meal_preference","travel_advance_required","advance_amount","departure_date","arrival_date","lodging_required","preferred_area_for_lodging","check_in_date","check_out_date","other_details"],"costings":["expense_type","sponsored_amount","funded_amount","total_amount","comments"]}
@frappe.whitelist()
def get_travel_requests(page=1,page_size=20,search=None,employee=None,travel_type=None,purpose_of_travel=None,company=None):
 page,page_size=cint(page),cint(page_size);f={k:v for k,v in {"employee":employee,"travel_type":travel_type,"purpose_of_travel":purpose_of_travel,"company":company}.items() if v};o=[["name","like",f"%{search}%"],["employee_name","like",f"%{search}%"]] if search else [];rows=frappe.get_all("Travel Request",fields=["name","employee","employee_name","travel_type","travel_funding","purpose_of_travel","company","docstatus","modified"],filters=f,or_filters=o,order_by="modified desc",start=(page-1)*page_size,page_length=page_size)
 for r in rows:r["can_edit"]=r.docstatus==0 and frappe.has_permission("Travel Request","write",doc=r.name);r["can_delete"]=r.docstatus!=1 and frappe.has_permission("Travel Request","delete",doc=r.name)
 total=len(frappe.get_all("Travel Request",filters=f,or_filters=o,pluck="name",limit_page_length=0));return {"rows":rows,"count":total,"page":page,"page_size":page_size,"total_pages":(total+page_size-1)//page_size if page_size else 1}
@frappe.whitelist()
def get_travel_request(name):d=frappe.get_doc("Travel Request",name);x=d.as_dict();x["can_edit"]=d.docstatus==0 and d.has_permission("write");x["can_delete"]=d.docstatus!=1 and d.has_permission("delete");return x
def setf(d,x):
 for f in FIELDS:
  if f in x:d.set(f,x.get(f))
 for t,fs in TABLES.items():
  if t in x:
   d.set(t,[])
   for r in x.get(t) or []:d.append(t,{f:r.get(f) for f in fs})
@frappe.whitelist()
def create_travel_request(data):x=json.loads(data) if isinstance(data,str) else data;d=frappe.new_doc("Travel Request");setf(d,x);d.insert();frappe.db.commit();return d.as_dict()
@frappe.whitelist()
def update_travel_request(name,data):
 x=json.loads(data) if isinstance(data,str) else data;d=frappe.get_doc("Travel Request",name)
 if d.docstatus:frappe.throw(_("Only draft travel requests can be edited"))
 setf(d,x);d.save();frappe.db.commit();return d.as_dict()
@frappe.whitelist()
def delete_travel_request(name):
 d=frappe.get_doc("Travel Request",name)
 if d.docstatus==1:frappe.throw(_("Cancel before deleting"))
 frappe.delete_doc("Travel Request",name);frappe.db.commit();return {"message":"deleted"}
@frappe.whitelist()
def submit_travel_request(name):d=frappe.get_doc("Travel Request",name);d.submit();frappe.db.commit();return d.as_dict()
@frappe.whitelist()
def cancel_travel_request(name):d=frappe.get_doc("Travel Request",name);d.cancel();frappe.db.commit();return d.as_dict()
@frappe.whitelist()
def get_employees():
 # travel_request.js has no frm.set_query("employee", ...) at all -- unlike
 # Expense Claim/Employee Advance, real Desk shows every Employee here
 # regardless of status, so no status filter is applied.
 return frappe.get_all("Employee",fields=["name","employee_name","company","date_of_birth","cell_number","prefered_email","passport_number"],order_by="employee_name",limit_page_length=500)
@frappe.whitelist()
def get_options(doctype):return frappe.get_all(doctype,fields=["name"],order_by="name",limit_page_length=500)
@frappe.whitelist()
def get_cost_centers(company):return frappe.get_all("Cost Center",fields=["name"],filters={"company":company,"is_group":0},order_by="name",limit_page_length=500) if company else []
