import frappe

from ._utils import guarded, list_docs, single


DOCTYPE = "Daily Work Summary"


@frappe.whitelist()
@guarded("Daily Work Summary list")
def get_list(page=1, page_size=20, search=None, status=None, daily_work_summary_group=None):
    return list_docs(
        DOCTYPE,
        ["name", "daily_work_summary_group", "status", "email_sent_to", "creation", "modified"],
        page,
        page_size,
        search,
        ["name", "daily_work_summary_group", "email_sent_to"],
        {"status": status, "daily_work_summary_group": daily_work_summary_group},
        "creation desc",
    )


@frappe.whitelist()
@guarded("Daily Work Summary get")
def get_single(name):
    return single(DOCTYPE, name)


@frappe.whitelist()
@guarded("Daily Work Summary groups", list)
def get_groups():
    return frappe.get_all("Daily Work Summary Group", fields=["name"], order_by="name", limit_page_length=500)
