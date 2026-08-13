import json
import frappe
from frappe import _
from frappe.utils import cint

ALLOWED = {"Purchase Invoice", "Supplier", "Payment Entry", "Journal Entry", "Payment Reconciliation"}
LAYOUT = {"Section Break", "Column Break", "Tab Break", "HTML", "Button", "Fold"}

def check(doctype):
    if doctype not in ALLOWED: frappe.throw(_("Unsupported document type"))

@frappe.whitelist()
def get_meta(doctype):
    check(doctype); meta=frappe.get_meta(doctype)
    def field_dict(f):
        out={"fieldname":f.fieldname,"fieldtype":f.fieldtype,"label":f.label,"options":f.options,"reqd":f.reqd,"read_only":f.read_only,"hidden":f.hidden,"depends_on":f.depends_on,"default":f.default,"collapsible":f.collapsible,"description":f.description}
        if f.fieldtype=="Table":
            out["child_fields"]=[field_dict(x) for x in frappe.get_meta(f.options).fields if not x.hidden and x.fieldtype not in ("Section Break","Column Break","Tab Break","HTML","Button","Fold")]
        return out
    return {"issingle":meta.issingle,"is_submittable":meta.is_submittable,"fields":[field_dict(f) for f in meta.fields if not f.hidden and f.fieldtype not in ("HTML","Button","Fold")]}

@frappe.whitelist()
def get_documents(doctype,page=1,page_size=20,search=None,status=None,supplier_group=None,supplier=None,company=None,party_type=None,party=None,voucher_type=None,payment_type=None):
    check(doctype);page,page_size=cint(page),cint(page_size);meta=frappe.get_meta(doctype);filters={k:v for k,v in {"status":status,"supplier_group":supplier_group,"supplier":supplier,"company":company,"party_type":party_type,"party":party,"voucher_type":voucher_type,"payment_type":payment_type}.items() if v and meta.has_field(k)}
    search_map={"Supplier":["name","supplier_name"],"Purchase Invoice":["name","supplier","bill_no"],"Payment Entry":["name","party","party_name","reference_no"],"Journal Entry":["name","title","cheque_no"]}
    search_fields=search_map.get(doctype,["name"]);ors=[[f,"like",f"%{search}%"] for f in search_fields] if search else []
    field_map={"Supplier":["supplier_name","supplier_group","supplier_type","country","disabled"],"Purchase Invoice":["supplier","supplier_name","posting_date","due_date","bill_no","grand_total","outstanding_amount","currency","status","docstatus"],"Payment Entry":["payment_type","party_type","party","party_name","posting_date","paid_amount","received_amount","status","docstatus"],"Journal Entry":["title","voucher_type","posting_date","company","total_debit","total_credit","difference","docstatus"]}
    fields=["name","modified"]+field_map.get(doctype,[])
    rows=frappe.get_all(doctype,fields=fields,filters=filters,or_filters=ors,order_by="modified desc",start=(page-1)*page_size,page_length=page_size)
    for r in rows:r["can_edit"]=(not meta_submitted(doctype,r)) and frappe.has_permission(doctype,"write",doc=r.name);r["can_delete"]=frappe.has_permission(doctype,"delete",doc=r.name) and (doctype=="Supplier" or r.docstatus!=1)
    total=len(frappe.get_all(doctype,filters=filters,or_filters=ors,pluck="name",limit_page_length=0));return {"rows":rows,"count":total,"page":page,"page_size":page_size}
def meta_submitted(doctype,row):return frappe.get_meta(doctype).is_submittable and row.docstatus!=0

@frappe.whitelist()
def get_document(doctype,name):
    check(doctype);d=frappe.get_doc(doctype,name);x=d.as_dict();x["can_edit"]=(not frappe.get_meta(doctype).is_submittable or d.docstatus==0) and d.has_permission("write");x["can_delete"]=(not frappe.get_meta(doctype).is_submittable or d.docstatus!=1) and d.has_permission("delete");return x

def apply(d,data):
    meta=frappe.get_meta(d.doctype)
    for f in meta.fields:
        if f.fieldname not in data or f.fieldtype in LAYOUT or f.read_only:continue
        if f.fieldtype=="Table":
            d.set(f.fieldname,[])
            child_meta=frappe.get_meta(f.options)
            valid={x.fieldname for x in child_meta.fields if x.fieldtype not in LAYOUT and not x.read_only}
            for row in data.get(f.fieldname) or []:d.append(f.fieldname,{k:v for k,v in row.items() if k in valid})
        else:d.set(f.fieldname,data.get(f.fieldname))

@frappe.whitelist()
def create_document(doctype,data):
    check(doctype);data=json.loads(data) if isinstance(data,str) else data;d=frappe.new_doc(doctype);apply(d,data);d.insert();frappe.db.commit();return d.as_dict()
@frappe.whitelist()
def update_document(doctype,name,data):
    check(doctype);data=json.loads(data) if isinstance(data,str) else data;d=frappe.get_doc(doctype,name)
    if frappe.get_meta(doctype).is_submittable and d.docstatus:frappe.throw(_("Only draft documents can be edited"))
    apply(d,data);d.save();frappe.db.commit();return d.as_dict()
@frappe.whitelist()
def delete_document(doctype,name):check(doctype);frappe.delete_doc(doctype,name);frappe.db.commit();return {"message":"Deleted"}
@frappe.whitelist()
def submit_document(doctype,name):check(doctype);d=frappe.get_doc(doctype,name);d.submit();frappe.db.commit();return d.as_dict()
@frappe.whitelist()
def cancel_document(doctype,name):check(doctype);d=frappe.get_doc(doctype,name);d.cancel();frappe.db.commit();return d.as_dict()

@frappe.whitelist()
def get_link_options(link_doctype,company=None,supplier=None,fieldname=None,party_type=None,party=None,payment_type=None,parent=None,reference_type=None,account=None):
    filters={}
    if company and frappe.get_meta(link_doctype).has_field("company"):filters["company"]=company
    if link_doctype=="Supplier":filters["disabled"]=0
    if link_doctype=="Price List":filters["buying"]=1
    if link_doctype in ("Account","Cost Center"):
        filters["is_group"]=0
        if fieldname=="credit_to":filters["account_type"]="Payable"
        if fieldname in ("expense_account","write_off_account"):filters["root_type"]="Expense"
        if fieldname in ("paid_from","paid_to"):
            bank_side=(fieldname=="paid_from" and payment_type in ("Pay","Internal Transfer")) or (fieldname=="paid_to" and payment_type in ("Receive","Internal Transfer"))
            if bank_side: filters["account_type"]=["in",["Bank","Cash"]]
            elif party_type: filters["account_type"]="Receivable" if party_type=="Customer" else "Payable"
        if fieldname=="receivable_payable_account" and party_type:
            filters.update({"account_type":"Receivable" if party_type=="Customer" else "Payable","root_type":"Asset" if party_type=="Customer" else "Liability"})
        if fieldname=="default_advance_account" and party_type:
            filters.update({"account_type":"Receivable" if party_type=="Customer" else "Payable","root_type":"Liability" if party_type=="Customer" else "Asset"})
        if fieldname=="bank_cash_account":filters["account_type"]=["in",["Bank","Cash"]]
    if link_doctype=="Bank Account":
        if fieldname=="bank_account":filters.update({"is_company_account":1,"company":company})
        elif fieldname=="party_bank_account":filters.update({"is_company_account":0,"party_type":party_type,"party":party})
    if link_doctype in ("Sales Taxes and Charges Template","Purchase Taxes and Charges Template"):filters.update({"company":company,"disabled":0})
    if link_doctype=="DocType" and fieldname=="party_type":filters["name"]=["in",["Customer","Supplier","Employee","Shareholder"]]
    if fieldname=="reference_name" and reference_type:
        filters["docstatus"]=1
        if frappe.get_meta(link_doctype).has_field("company"):filters["company"]=company
        party_field=(party_type or "").lower()
        if party and party_field and frappe.get_meta(link_doctype).has_field(party_field):filters[party_field]=party
    if link_doctype=="Address" and supplier:filters.update({"link_doctype":"Supplier","link_name":supplier}) if False else None
    try:return frappe.get_all(link_doctype,fields=["name"],filters=filters,order_by="name",limit_page_length=500)
    except Exception as e:frappe.log_error(str(e),"Accounting Document API");return []

def reconciliation_doc(data):
    data=json.loads(data) if isinstance(data,str) else data
    return frappe.get_doc({"doctype":"Payment Reconciliation",**(data or {})})

@frappe.whitelist()
def get_unreconciled_entries(data):
    d=reconciliation_doc(data);d.get_unreconciled_entries();return d.as_dict()

@frappe.whitelist()
def allocate_reconciliation(data):
    d=reconciliation_doc(data);d.allocate_entries({"payments":[x.as_dict() for x in d.payments],"invoices":[x.as_dict() for x in d.invoices]});return d.as_dict()

@frappe.whitelist()
def reconcile_entries(data):
    d=reconciliation_doc(data);d.reconcile();frappe.db.commit();return d.as_dict()

@frappe.whitelist()
def get_connections(doctype,name):
    check(doctype)
    if doctype=="Supplier":return {"purchase_invoices":frappe.db.count("Purchase Invoice",{"supplier":name}),"purchase_orders":frappe.db.count("Purchase Order",{"supplier":name}),"purchase_receipts":frappe.db.count("Purchase Receipt",{"supplier":name})}
    return {"payments":frappe.db.count("Payment Entry Reference",{"reference_doctype":"Purchase Invoice","reference_name":name}),"purchase_orders":len(frappe.get_all("Purchase Invoice Item",filters={"parent":name,"purchase_order":["is","set"]},distinct=True,pluck="purchase_order")),"purchase_receipts":len(frappe.get_all("Purchase Invoice Item",filters={"parent":name,"purchase_receipt":["is","set"]},distinct=True,pluck="purchase_receipt"))}
