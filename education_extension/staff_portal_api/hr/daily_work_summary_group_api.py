import json

import frappe
from frappe import _
from frappe.utils import cint


@frappe.whitelist()
def get_daily_work_summary_groups(page=1, page_size=20, search=None, enabled=None, holiday_list=None):
    page, page_size = cint(page), cint(page_size)
    filters = {}
    if enabled not in (None, ""):
        filters["enabled"] = cint(enabled)
    if holiday_list:
        filters["holiday_list"] = holiday_list
    or_filters = [["name", "like", f"%{search}%"], ["subject", "like", f"%{search}%"]] if search else []
    rows = frappe.get_all("Daily Work Summary Group", fields=["name", "enabled", "send_emails_at", "holiday_list", "subject", "modified"], filters=filters, or_filters=or_filters, order_by="modified desc", start=(page - 1) * page_size, page_length=page_size)
    for row in rows:
        row["user_count"] = frappe.db.count("Daily Work Summary Group User", {"parent": row.name})
        row["can_edit"] = frappe.has_permission("Daily Work Summary Group", "write", doc=row.name)
        row["can_delete"] = frappe.has_permission("Daily Work Summary Group", "delete", doc=row.name)
    total = len(frappe.get_all("Daily Work Summary Group", filters=filters, or_filters=or_filters, pluck="name", limit_page_length=0))
    return {"rows": rows, "count": total, "page": page, "page_size": page_size, "total_pages": (total + page_size - 1) // page_size if page_size else 1}


@frappe.whitelist()
def get_daily_work_summary_group(name):
    doc = frappe.get_doc("Daily Work Summary Group", name)
    data = doc.as_dict()
    data["users"] = [{"user": row.user, "email": row.email} for row in doc.users]
    data["can_edit"] = doc.has_permission("write")
    data["can_delete"] = doc.has_permission("delete")
    return data


def _set_fields(doc, data):
    for field in ("enabled", "send_emails_at", "holiday_list", "subject", "message"):
        if field in data:
            doc.set(field, data.get(field))
    if "users" in data:
        doc.set("users", [])
        seen = set()
        for row in data.get("users") or []:
            user = row.get("user")
            if not user or user in seen:
                continue
            seen.add(user)
            doc.append("users", {"user": user, "email": frappe.db.get_value("User", user, "email") or user})


@frappe.whitelist()
def create_daily_work_summary_group(data):
    if isinstance(data, str):
        data = json.loads(data)
    doc = frappe.new_doc("Daily Work Summary Group")
    doc.name = data.get("name")
    _set_fields(doc, data)
    doc.insert()
    frappe.db.commit()
    return doc.as_dict()


@frappe.whitelist()
def update_daily_work_summary_group(name, data):
    if isinstance(data, str):
        data = json.loads(data)
    doc = frappe.get_doc("Daily Work Summary Group", name)
    _set_fields(doc, data)
    doc.save()
    frappe.db.commit()
    return doc.as_dict()


@frappe.whitelist()
def delete_daily_work_summary_group(name):
    frappe.delete_doc("Daily Work Summary Group", name)
    frappe.db.commit()
    return {"message": _("Daily Work Summary Group deleted")}


def _safe(fn):
    try:
        return fn()
    except Exception as exc:
        frappe.log_error(str(exc), "Daily Work Summary Group API")
        return []


@frappe.whitelist()
def get_users():
    return _safe(lambda: frappe.get_all("User", fields=["name", "full_name", "email", "enabled"], order_by="full_name", limit_page_length=500))


@frappe.whitelist()
def get_holiday_lists():
    return _safe(lambda: frappe.get_all("Holiday List", fields=["name", "from_date", "to_date"], order_by="name", limit_page_length=500))


@frappe.whitelist()
def get_connections(group):
    return {"daily_work_summaries": frappe.db.count("Daily Work Summary", {"daily_work_summary_group": group})}
