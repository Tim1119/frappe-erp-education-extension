import frappe
from frappe.utils import cint


@frappe.whitelist()
def get_team_updates(page=1, page_size=20, search=None, sender=None, date_from=None, date_to=None, group=None):
    page, page_size = cint(page), cint(page_size)
    filters = {"reference_doctype": "Daily Work Summary", "communication_type": "Communication", "sent_or_received": "Received"}
    if group:
        summaries = frappe.get_all("Daily Work Summary", filters={"daily_work_summary_group": group}, pluck="name", limit_page_length=0)
        if not summaries:
            return {"rows": [], "count": 0, "page": page, "page_size": page_size, "total_pages": 0}
        filters["reference_name"] = ["in", summaries]
    if sender:
        filters["sender"] = sender
    if date_from and date_to:
        filters["creation"] = ["between", [date_from, f"{date_to} 23:59:59"]]
    elif date_from:
        filters["creation"] = [">=", date_from]
    elif date_to:
        filters["creation"] = ["<=", f"{date_to} 23:59:59"]
    or_filters = [["content", "like", f"%{search}%"], ["text_content", "like", f"%{search}%"], ["sender", "like", f"%{search}%"]] if search else []
    fields = ["name", "content", "text_content", "sender", "creation", "reference_name", "subject"]
    rows = frappe.get_all("Communication", fields=fields, filters=filters, or_filters=or_filters, order_by="creation desc", start=(page - 1) * page_size, page_length=page_size)
    for row in rows:
        employee = frappe.db.get_value("Employee", {"user_id": row.sender}, ["name", "employee_name"], as_dict=True) or {}
        row["employee"] = employee.get("name")
        row["sender_name"] = employee.get("employee_name") or frappe.db.get_value("User", row.sender, "full_name") or row.sender
        row["display_content"] = row.text_content or row.content or ""
    total = len(frappe.get_all("Communication", filters=filters, or_filters=or_filters, pluck="name", limit_page_length=0))
    return {"rows": rows, "count": total, "page": page, "page_size": page_size, "total_pages": (total + page_size - 1) // page_size if page_size else 1}


@frappe.whitelist()
def get_senders():
    try:
        return frappe.get_all("Communication", fields=["sender as name"], filters={"reference_doctype": "Daily Work Summary", "sent_or_received": "Received"}, group_by="sender", order_by="sender", limit_page_length=500)
    except Exception as exc:
        frappe.log_error(str(exc), "Team Updates API")
        return []
