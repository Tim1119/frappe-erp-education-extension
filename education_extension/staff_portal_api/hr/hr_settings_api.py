import json

import frappe


SKIP_TYPES = {"Section Break", "Column Break", "Tab Break", "HTML", "Button", "Table"}


@frappe.whitelist()
def get_hr_settings():
    doc = frappe.get_single("HR Settings")
    data = doc.as_dict()
    data["can_edit"] = doc.has_permission("write")
    return data


@frappe.whitelist()
def update_hr_settings(data):
    if isinstance(data, str):
        data = json.loads(data)
    doc = frappe.get_single("HR Settings")
    valid_fields = {
        field.fieldname for field in frappe.get_meta("HR Settings").fields
        if field.fieldtype not in SKIP_TYPES and not field.read_only
    }
    for fieldname in valid_fields:
        if fieldname in data:
            doc.set(fieldname, data.get(fieldname))
    doc.save()
    frappe.db.commit()
    return doc.as_dict()


def _safe(fn):
    try:
        return fn()
    except Exception as exc:
        frappe.log_error(str(exc), "HR Settings API")
        return []


@frappe.whitelist()
def get_roles():
    return _safe(lambda: frappe.get_list("Role", fields=["name"], order_by="name", limit_page_length=500))


@frappe.whitelist()
def get_email_templates():
    return _safe(lambda: frappe.get_list("Email Template", fields=["name", "subject"], order_by="name", limit_page_length=500))


@frappe.whitelist()
def get_web_forms():
    return _safe(lambda: frappe.get_list("Web Form", fields=["name", "title"], order_by="title", limit_page_length=500))


@frappe.whitelist()
def get_outgoing_email_accounts():
    """Matches hr_settings.js sender and hiring_sender filters."""
    return _safe(lambda: frappe.get_list("Email Account", fields=["name", "email_id"], filters={"enable_outgoing": 1}, order_by="name", limit_page_length=500))


@frappe.whitelist()
def get_sender_email(email_account):
    if not email_account:
        return ""
    return frappe.db.get_value("Email Account", email_account, "email_id") or ""
