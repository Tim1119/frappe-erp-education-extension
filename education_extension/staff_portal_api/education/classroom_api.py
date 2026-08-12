import frappe
import json
from frappe import _
from frappe.utils import cint

@frappe.whitelist()
def get_classrooms(
    page=1,
    page_size=20,
    search=None,
):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    or_filters = []

    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["room_name", "like", f"%{search}%"],
            ["room_number", "like", f"%{search}%"],
        ]

    rows = frappe.get_all(
        "Room",
        fields=[
            "name",
            "room_name",
            "room_number",
            "seating_capacity",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="modified desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count(
        "Room",
        filters=filters,
    )

    return {
        "rows": rows,
        "count": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (
            (total + page_size - 1) // page_size
            if page_size else 1
        ),
    }

@frappe.whitelist()
def get_classroom(name):
    if not name:
        frappe.throw(_("Classroom name is required"))

    doc = frappe.get_doc("Room", name)
    return doc.as_dict()

@frappe.whitelist()
def create_classroom(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.new_doc("Room")
    
    doc.room_name = data.get("room_name")
    doc.room_number = data.get("room_number")
    doc.seating_capacity = data.get("seating_capacity")
    
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def update_classroom(name, data):
    if not name:
        frappe.throw(_("Classroom name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Room", name)
    
    if "room_name" in data:
        doc.room_name = data.get("room_name")
    if "room_number" in data:
        doc.room_number = data.get("room_number")
    if "seating_capacity" in data:
        doc.seating_capacity = data.get("seating_capacity")
    
    doc.save()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def delete_classroom(name):
    if not name:
        frappe.throw(_("Classroom name is required"))

    frappe.delete_doc("Room", name)
    frappe.db.commit()

    return {"message": "Classroom deleted"}

@frappe.whitelist()
def get_doctype_count(doctype, filters=None):
    try:
        if filters:
            if isinstance(filters, str):
                filters = json.loads(filters)
            count = frappe.db.count(doctype, filters=filters)
        else:
            count = frappe.db.count(doctype)
        return count
    except Exception as e:
        frappe.log_error(f"Error getting count for {doctype}: {str(e)}", "Classroom API")
        return 0