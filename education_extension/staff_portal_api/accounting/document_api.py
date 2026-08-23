import json
import frappe
from frappe import _
from frappe.utils import cint, flt

ALLOWED = {
    "Purchase Invoice", "Supplier", "Payment Entry", "Journal Entry", "Payment Reconciliation",
    "Customer", "Dunning", "Dunning Type", "Expense Claim Type", "Purpose of Travel",
    "Additional Salary", "Vehicle", "Driver", "Vehicle Service Item", "Vehicle Log",
}
LAYOUT = {"Section Break", "Column Break", "Tab Break", "HTML", "Button", "Fold"}

def check(doctype):
    if doctype not in ALLOWED: frappe.throw(_("Unsupported document type"))

# Fields hidden from the frontend because they belong to whole feature areas
# this school doesn't use (POS, loyalty, subscriptions, TDS, multi-warehouse
# subcontracting/logistics, discount/write-off automation, sales commission,
# letterhead selection) -- confirmed 0% filled across every existing record
# via a live DB field-usage query. The backend still accepts these fields on
# create/update (apply() reads the real, unfiltered meta), so nothing is
# actually lost -- they're just not cluttering the form/profile UI.
EXCLUDE_FIELDS = {
    "Supplier": {
        "is_transporter", "default_price_list", "is_internal_supplier", "represents_company",
        "supplier_details", "website", "tax_id", "tax_category", "tax_withholding_category",
        "supplier_primary_address", "primary_address", "supplier_primary_contact", "mobile_no", "email_id",
        "payment_terms", "allow_purchase_invoice_creation_without_purchase_order",
        "allow_purchase_invoice_creation_without_purchase_receipt", "is_frozen", "on_hold", "hold_type",
        "release_date",
        # Attach Image has no widget in the generic form (would fall back to a
        # plain text box); RFQ/PO warning toggles and the Portal Users table
        # gate features (Request for Quotation, Purchase Order, a customer/
        # supplier-facing portal login) this portal has no module for; the
        # "companies" table only ever shows when represents_company is set,
        # which is itself excluded above, so it can never be reached.
        "image", "warn_rfqs", "warn_pos", "prevent_rfqs", "prevent_pos", "portal_users", "companies",
        "accounts",
    },
    # Receivables mirror of Supplier's own trim above -- same reasoning:
    # POS/loyalty/subscriptions/sales-team/credit-limit feature areas this
    # portal has no module for, plus the same portal-login/Attach Image
    # exclusions. Keeps only the fields listed in the Customer module spec
    # (basic info, tax, currency & defaults, internal customer, primary
    # contact, disabled).
    "Customer": {
        "salutation", "gender", "lead_name", "image", "account_manager", "companies", "language",
        "website", "mobile_no", "email_id", "primary_address", "accounts", "customer_details",
        "market_segment", "industry", "is_frozen", "loyalty_program", "loyalty_program_tier",
        "default_sales_partner", "default_commission_rate", "sales_team", "customer_pos_id",
        "credit_limits", "so_required", "dn_required", "opportunity_name", "portal_users",
        "prospect_name", "first_name", "last_name",
    },
    "Payment Entry": {
        "bank_account", "party_bank_account", "contact_person", "contact_email",
        "purchase_taxes_and_charges_template", "sales_taxes_and_charges_template",
        "apply_tax_withholding_amount", "tax_withholding_category", "base_total_taxes_and_charges",
        "total_taxes_and_charges", "clearance_date", "project", "custom_remarks", "letter_head",
        "print_heading", "bank", "bank_account_no", "payment_order", "auto_repeat",
        # Multi-currency exchange-rate/base-amount pairs and the tax-withholding-
        # on-advances feature area (taxes table + *_after_tax fields) -- the
        # controller computes all of these itself in validate(), so hiding them
        # from the form doesn't lose anything the school actually fills in.
        "party_balance", "paid_from_account_balance", "paid_to_account_balance", "source_exchange_rate",
        "base_paid_amount", "target_exchange_rate", "base_received_amount", "taxes",
        "paid_amount_after_tax", "base_paid_amount_after_tax", "received_amount_after_tax",
        "base_received_amount_after_tax", "paid_from_account_type", "paid_to_account_type",
        "payment_order_status", "title", "base_total_allocated_amount",
        "book_advance_payments_in_separate_party_account", "base_in_words", "in_words",
        "reconcile_on_advance_payment_date", "is_opening",
    },
    "Journal Entry": {
        "is_system_generated", "finance_book", "process_deferred_accounting", "reversal_of",
        "tax_withholding_category", "from_template", "apply_tds",
        "multi_currency", "clearance_date", "inter_company_journal_entry_reference", "bill_no", "bill_date",
        "due_date", "write_off_amount", "pay_to_recd_from", "letter_head", "select_print_heading",
        "mode_of_payment", "payment_order", "stock_entry", "auto_repeat",
        # Multi-currency total display and the Write Off Entry / Stock
        # Reconciliation-only fields -- neither feature is used here.
        "title", "total_amount_currency", "total_amount", "total_amount_in_words", "paid_loan",
        "write_off_based_on", "is_opening", "party_not_required",
    },
    # Address & Contact tab (customer_address/company_address + their
    # display/mobile/email mirrors) and Print Language/Letter Head -- same
    # reasoning as Supplier/Customer's own trims: this portal has no
    # address-book or per-letterhead print module.
    "Dunning": {
        "language", "letter_head", "customer_address", "address_display", "contact_person",
        "contact_display", "contact_mobile", "contact_email", "company_address", "company_address_display",
    },
}

# Fields that are real, editable DocType fields but are populated by an
# auto-fill hook (see the frontend AUTO_FILL config) or are pure running
# totals the controller computes -- shown read-only rather than excluded so
# the user can still see the value without being able to hand-type a value
# the next save will just overwrite.
READONLY_OVERRIDE_FIELDS = {
    "Payment Entry": {
        "party_name", "paid_from_account_currency", "paid_to_account_currency",
        "total_allocated_amount", "unallocated_amount", "difference_amount",
    },
    "Journal Entry": {"total_debit", "total_credit", "difference"},
}

# Child-table columns that are internal bookkeeping (company-currency mirrors,
# exchange-rate/advance-voucher plumbing) rather than anything a user picks --
# trimmed the same way EXCLUDE_FIELDS trims the parent doctype, so the
# compact child-table UI shows only what's actually meaningful to fill in.
CHILD_EXCLUDE_FIELDS = {
    "Payment Entry Reference": {
        "due_date", "bill_no", "exchange_rate", "payment_term", "exchange_gain_loss", "account",
        "account_type", "payment_type", "payment_request", "payment_term_outstanding",
        "payment_request_outstanding", "reconcile_effect_on", "advance_voucher_type", "advance_voucher_no",
    },
    "Payment Entry Deduction": {"is_exchange_gain_loss"},
    "Journal Entry Account": {
        "account_type", "account_currency", "exchange_rate", "debit", "credit", "reference_due_date",
        "is_advance", "user_remark", "against_account", "bank_account", "reference_detail_no",
        "advance_voucher_type", "advance_voucher_no", "is_tax_withholding_account",
    },
    # Payment-schedule-sync bookkeeping (payment_term/description/mode_of_payment/
    # invoice_portion/payment_amount all mirror the source Sales Invoice's own
    # payment schedule row, paid_amount/discounted_amount are post-payment
    # tracking) -- not something a user picks when manually recording an
    # overdue invoice, see CHILD_FORCE_EDITABLE_FIELDS below for why the
    # fields that ARE kept need special handling.
    "Overdue Payment": {
        "payment_term", "description", "mode_of_payment", "invoice_portion",
        "payment_amount", "paid_amount", "discounted_amount", "payment_schedule",
    },
}

# Every meaningful field on Overdue Payment is read_only in its own JSON,
# because real Desk populates this table exclusively via Dunning's "Fetch
# Overdue Payments" button (a bulk map-current-doc dialog against Sales
# Invoice) rather than direct entry. This portal's compact-table-plus-modal
# UX adds rows by hand instead, so these need to stay editable here or a
# manually-added row could never actually be filled in.
CHILD_FORCE_EDITABLE_FIELDS = {
    "Overdue Payment": {"sales_invoice", "due_date", "outstanding", "overdue_days", "interest", "dunning_level"},
}

CHILD_PRESERVE_FIELDS = {
    # Mapped Purchase Order drafts carry these read-only controller fields.
    # They must survive the portal's child-row allowlist or the saved invoice
    # permanently loses its source-document connection, but remain read-only
    # in the form just as they are in Desk.
    "Purchase Invoice Item": {"purchase_order", "po_detail", "purchase_receipt", "pr_detail"},
}

@frappe.whitelist()
def get_new_document_defaults(doctype):
    # Real Desk fills posting_date/company client-side on every new
    # transaction (frappe.datetime.get_today() + Global Defaults) even
    # though neither has a literal `default` in the DocType JSON -- this
    # portal has no equivalent onload script, so new documents were
    # silently starting with both required fields blank.
    check(doctype)
    meta = frappe.get_meta(doctype)
    out = {"posting_date": frappe.utils.today()}
    if meta.has_field("company"):
        out["company"] = frappe.defaults.get_global_default("company")
    # Same gap as posting_date/company above: real Desk always defaults
    # conversion_rate to 1 (same-currency transaction) and currency to the
    # company's own default on a brand new multi-currency doc via its own
    # onload script -- neither has a literal `default` in Dunning's JSON
    # (its currency/conversion_rate pair has no bespoke onload here the way
    # Purchase Invoice's own form already handles it), so conversion_rate
    # stayed None on a freshly created doc and Dunning.validate_totals()'s
    # `self.dunning_amount * self.conversion_rate` crashed with
    # "unsupported operand type(s) for *: 'float' and 'NoneType'".
    if meta.has_field("conversion_rate"):
        out["conversion_rate"] = 1
    if meta.has_field("currency") and out.get("company"):
        out["currency"] = frappe.get_cached_value("Company", out["company"], "default_currency")
    return out

@frappe.whitelist()
def get_meta(doctype):
    check(doctype); meta=frappe.get_meta(doctype); exclude=EXCLUDE_FIELDS.get(doctype) or set(); readonly_override=READONLY_OVERRIDE_FIELDS.get(doctype) or set()
    # read_only_override: None = use the field's own meta value, True/False =
    # force it either way. True is how the pre-existing READONLY_OVERRIDE_FIELDS
    # mechanism works (auto-fill/running-total fields the controller owns);
    # False is CHILD_FORCE_EDITABLE_FIELDS' mechanism (child fields the source
    # doctype marks read_only because Desk only ever fills them via a bulk
    # "fetch" button this portal doesn't build).
    def field_dict(f, read_only_override=None):
        read_only = f.read_only if read_only_override is None else (1 if read_only_override else 0)
        out={"fieldname":f.fieldname,"fieldtype":f.fieldtype,"label":f.label,"options":f.options,"reqd":f.reqd,"read_only":read_only,"hidden":f.hidden,"depends_on":f.depends_on,"default":f.default,"collapsible":f.collapsible,"description":f.description,"in_list_view":f.in_list_view}
        if f.fieldtype=="Table":
            child_exclude=CHILD_EXCLUDE_FIELDS.get(f.options) or set()
            child_editable=CHILD_FORCE_EDITABLE_FIELDS.get(f.options) or set()
            out["child_fields"]=[field_dict(x, read_only_override=(False if x.fieldname in child_editable else None)) for x in frappe.get_meta(f.options).fields if not x.hidden and x.fieldtype not in ("Section Break","Column Break","Tab Break","HTML","Button","Fold") and x.fieldname not in child_exclude]
        return out
    return {"issingle":meta.issingle,"is_submittable":meta.is_submittable,"fields":[field_dict(f,read_only_override=(True if f.fieldname in readonly_override else None)) for f in meta.fields if not f.hidden and f.fieldtype not in ("HTML","Button","Fold") and f.fieldname not in exclude]}

@frappe.whitelist()
def get_documents(doctype,page=1,page_size=20,search=None,status=None,supplier_group=None,supplier=None,company=None,party_type=None,party=None,voucher_type=None,payment_type=None,reference_name=None,reference_doctype=None,reference_type=None,return_against=None,customer_group=None,customer_type=None,territory=None,customer=None,dunning_type=None,purchase_order=None,sales_invoice=None):
    check(doctype);page,page_size=cint(page),cint(page_size);meta=frappe.get_meta(doctype);filters={k:v for k,v in {"status":status,"supplier_group":supplier_group,"supplier":supplier,"company":company,"party_type":party_type,"party":party,"voucher_type":voucher_type,"payment_type":payment_type,"return_against":return_against,"customer_group":customer_group,"customer_type":customer_type,"territory":territory,"customer":customer,"dunning_type":dunning_type}.items() if v and meta.has_field(k)}
    names=None
    # reference_name alone used to always mean "Purchase Invoice" here, which
    # silently broke every non-Purchase-Invoice caller (e.g. Sales Invoice's
    # own Payment Entry / Journal Entry connections) into a 0-result page --
    # reference_doctype/reference_type (matching the real child-table field
    # names on Payment Entry Reference / Journal Entry Account respectively)
    # now say which parent doctype the reference points at, defaulting to
    # Purchase Invoice only for backward compatibility with old links that
    # don't pass it. docstatus=1 keeps the list in sync with get_connections'
    # counts below (both only count submitted references).
    if reference_name and doctype=="Payment Entry":
        names=frappe.get_all("Payment Entry Reference",filters={"reference_doctype":reference_doctype or "Purchase Invoice","reference_name":reference_name,"docstatus":1},pluck="parent")
        if not names:return {"rows":[],"count":0,"page":page,"page_size":page_size}
        filters["name"]=["in",names]
    elif reference_name and doctype=="Journal Entry":
        names=frappe.get_all("Journal Entry Account",filters={"reference_type":reference_type or "Purchase Invoice","reference_name":reference_name,"docstatus":1},pluck="parent")
        if not names:return {"rows":[],"count":0,"page":page,"page_size":page_size}
        filters["name"]=["in",names]
    elif purchase_order and doctype=="Purchase Invoice":
        names=frappe.get_all("Purchase Invoice Item",filters={"purchase_order":purchase_order,"docstatus":["<",2]},distinct=True,pluck="parent")
        if not names:return {"rows":[],"count":0,"page":page,"page_size":page_size}
        filters["name"]=["in",names]
    elif sales_invoice and doctype=="Dunning":
        names=frappe.get_all("Overdue Payment",filters={"sales_invoice":sales_invoice,"docstatus":1},distinct=True,pluck="parent")
        if not names:return {"rows":[],"count":0,"page":page,"page_size":page_size}
        filters["name"]=["in",names]
    search_map={"Supplier":["name","supplier_name"],"Purchase Invoice":["name","supplier","bill_no"],"Payment Entry":["name","party","party_name","reference_no"],"Journal Entry":["name","title","cheque_no"],"Customer":["name","customer_name"],"Dunning":["name","customer_name"],"Dunning Type":["name","dunning_type"]}
    search_fields=search_map.get(doctype,["name"]);ors=[[f,"like",f"%{search}%"] for f in search_fields] if search else []
    field_map={"Supplier":["supplier_name","supplier_group","supplier_type","country","disabled"],"Purchase Invoice":["supplier","supplier_name","posting_date","due_date","bill_no","grand_total","outstanding_amount","currency","status","docstatus"],"Payment Entry":["payment_type","party_type","party","party_name","posting_date","paid_amount","received_amount","status","docstatus"],"Journal Entry":["title","voucher_type","posting_date","company","total_debit","total_credit","difference","docstatus"],"Customer":["customer_name","customer_group","customer_type","territory","disabled"],"Dunning":["customer","customer_name","dunning_type","posting_date","dunning_fee","grand_total","status","docstatus"],"Dunning Type":["dunning_type","dunning_fee","rate_of_interest","company","is_default"]}
    fields=["name","modified"]+field_map.get(doctype,[])
    rows=frappe.get_all(doctype,fields=fields,filters=filters,or_filters=ors,order_by="modified desc",start=(page-1)*page_size,page_length=page_size)
    for r in rows:r["can_edit"]=(not meta_submitted(doctype,r)) and frappe.has_permission(doctype,"write",doc=r.name);r["can_delete"]=frappe.has_permission(doctype,"delete",doc=r.name) and (doctype in ("Supplier","Customer") or r.docstatus!=1)
    total=len(frappe.get_all(doctype,filters=filters,or_filters=ors,pluck="name",limit_page_length=0));return {"rows":rows,"count":total,"page":page,"page_size":page_size}
def meta_submitted(doctype,row):return frappe.get_meta(doctype).is_submittable and row.docstatus!=0

@frappe.whitelist()
def get_document(doctype,name):
    check(doctype);d=frappe.get_doc(doctype,name);x=d.as_dict();x["can_edit"]=(not frappe.get_meta(doctype).is_submittable or d.docstatus==0) and d.has_permission("write");x["can_delete"]=(not frappe.get_meta(doctype).is_submittable or d.docstatus!=1) and d.has_permission("delete");return x

NUMERIC_FIELDTYPES = {"Int", "Check"}
FLOAT_FIELDTYPES = {"Float", "Currency", "Percent"}

def _cast(fieldtype, value):
    # Every numeric <input> in the generic form (see FieldInput/FormField in
    # AccountingDocumentForm.jsx) sends e.target.value, which the DOM always
    # gives back as a string even for type="number" -- so without this,
    # Int/Float/Currency/Percent fields arrive here as Python str. Frappe
    # only casts those to real numbers when writing to the DB, which happens
    # AFTER the real DocType controller's validate() has already run -- e.g.
    # Dunning.validate_overdue_payments() does `self.rate_of_interest / 100`
    # directly, raising "unsupported operand type(s) for /: 'str' and 'int'"
    # on a doc built from raw, uncast form data.
    if fieldtype in NUMERIC_FIELDTYPES: return cint(value)
    if fieldtype in FLOAT_FIELDTYPES: return flt(value)
    return value

def apply(d,data):
    meta=frappe.get_meta(d.doctype)
    for f in meta.fields:
        if f.fieldname not in data or f.fieldtype in LAYOUT or f.read_only:continue
        if f.fieldtype=="Table":
            d.set(f.fieldname,[])
            child_meta=frappe.get_meta(f.options)
            # CHILD_FORCE_EDITABLE_FIELDS (see get_meta()) tells the frontend
            # these child fields are editable even though the real DocType
            # marks them read_only -- without the same override here, every
            # value typed into one of them would silently get stripped from
            # the row before insert (e.g. Overdue Payment.sales_invoice,
            # which is `reqd`, making the whole row fail to save).
            child_editable=CHILD_FORCE_EDITABLE_FIELDS.get(f.options) or set()
            child_preserve=CHILD_PRESERVE_FIELDS.get(f.options) or set()
            child_fields={x.fieldname:x for x in child_meta.fields if x.fieldtype not in LAYOUT and (not x.read_only or x.fieldname in child_editable or x.fieldname in child_preserve)}
            for row in data.get(f.fieldname) or []:d.append(f.fieldname,{k:_cast(child_fields[k].fieldtype,v) for k,v in row.items() if k in child_fields})
        else:d.set(f.fieldname,_cast(f.fieldtype,data.get(f.fieldname)))

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
def get_link_options(link_doctype,company=None,supplier=None,fieldname=None,party_type=None,party=None,payment_type=None,parent=None,reference_type=None,account=None,customer=None):
    filters={}
    if company and frappe.get_meta(link_doctype).has_field("company"):filters["company"]=company
    if link_doctype=="Supplier":filters["disabled"]=0
    if link_doctype=="Customer":filters["disabled"]=0
    if link_doctype in ("Customer Group","Territory"):filters["is_group"]=0
    if link_doctype=="Price List":filters["selling" if fieldname=="default_price_list" else "buying"]=1
    if link_doctype=="Sales Invoice" and fieldname=="sales_invoice":
        filters["docstatus"]=1
        if customer:filters["customer"]=customer
    if link_doctype in ("Account","Cost Center","Warehouse"):
        filters["is_group"]=0
        if fieldname=="credit_to":filters["account_type"]="Payable"
        if fieldname=="income_account":filters["root_type"]="Income"
        if fieldname in ("expense_account","write_off_account"):filters["root_type"]="Expense"
        if fieldname in ("paid_from","paid_to"):
            bank_side=(fieldname=="paid_from" and payment_type in ("Pay","Internal Transfer")) or (fieldname=="paid_to" and payment_type in ("Receive","Internal Transfer"))
            if bank_side: filters["account_type"]=["in",["Bank","Cash"]]
            elif party_type: filters["account_type"]="Receivable" if party_type=="Customer" else "Payable"
        if fieldname=="receivable_payable_account" and party_type:
            filters.update({"account_type":"Receivable" if party_type=="Customer" else "Payable","root_type":"Asset" if party_type=="Customer" else "Liability"})
        if fieldname=="default_advance_account" and party_type:
            filters.update({"account_type":"Receivable" if party_type=="Customer" else "Payable","root_type":"Liability" if party_type=="Customer" else "Asset"})
        if fieldname in ("bank_cash_account","cash_bank_account"):filters["account_type"]=["in",["Bank","Cash"]]
        if fieldname=="expense_account":filters["disabled"]=0
    if link_doctype=="Bank Account":
        if fieldname=="bank_account":filters.update({"is_company_account":1,"company":company})
        elif fieldname=="party_bank_account":filters.update({"is_company_account":0,"party_type":party_type,"party":party})
        elif fieldname=="default_bank_account":
            filters["is_company_account"]=1
            if company:filters["company"]=company
    if link_doctype in ("Sales Taxes and Charges Template","Purchase Taxes and Charges Template"):filters.update({"company":company,"disabled":0})
    if link_doctype=="DocType" and fieldname=="party_type":filters["name"]=["in",["Customer","Supplier","Employee","Shareholder"]]
    if fieldname=="advance_reference":
        filters["docstatus"]=1
        if link_doctype=="Payment Entry" and party:filters.update({"party_type":"Supplier","party":party,"payment_type":"Pay"})
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
    # Purchase Order / Purchase Receipt are intentionally left out here -- this
    # portal has no module for either doctype, so a count with nowhere to
    # drill into would be a dead end rather than a real Connection.
    if doctype=="Supplier":
        return {
            "purchase_invoices": frappe.db.count("Purchase Invoice",{"supplier":name}),
            "payments": frappe.db.count("Payment Entry",{"party_type":"Supplier","party":name}),
        }
    if doctype=="Purchase Invoice":
        return {
            "payments": len(frappe.get_all("Payment Entry Reference",filters={"reference_doctype":"Purchase Invoice","reference_name":name,"docstatus":1},distinct=True,pluck="parent")),
            "journal_entries": len(frappe.get_all("Journal Entry Account",filters={"reference_type":"Purchase Invoice","reference_name":name,"docstatus":1},distinct=True,pluck="parent")),
            "purchase_returns": frappe.db.count("Purchase Invoice",{"return_against":name,"docstatus":1}),
            "purchase_orders": len(frappe.get_all("Purchase Invoice Item",filters={"parent":name,"purchase_order":["not in",["",None]],"docstatus":["<",2]},distinct=True,pluck="purchase_order")),
        }
    if doctype=="Payment Entry":
        return {"journal_entries": len(frappe.get_all("Journal Entry Account",filters={"reference_type":"Payment Entry","reference_name":name},distinct=True,pluck="parent"))}
    if doctype=="Customer":
        return {
            "sales_invoices": frappe.db.count("Sales Invoice",{"customer":name}),
            "payments": frappe.db.count("Payment Entry",{"party_type":"Customer","party":name}),
            "dunning": frappe.db.count("Dunning",{"customer":name}),
        }
    return {}
