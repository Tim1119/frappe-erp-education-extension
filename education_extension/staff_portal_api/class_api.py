import frappe
import json
from frappe import _
from frappe.utils import cint

@frappe.whitelist()
def get_classes(
    page=1,
    page_size=20,
    search=None,
    department=None,
):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    or_filters = []

    if department:
        filters["department"] = department

    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["program_name", "like", f"%{search}%"],
            ["program_abbreviation", "like", f"%{search}%"],
        ]

    rows = frappe.get_all(
        "Program",
        fields=[
            "name",
            "program_name",
            "program_abbreviation",
            "department",
            "hero_image",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="modified desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count(
        "Program",
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
def get_class(name):
    if not name:
        frappe.throw(_("Program name is required"))

    doc = frappe.get_doc("Program", name)
    
    result = doc.as_dict()
    # Ensure courses child table is properly formatted
    if result.get('courses'):
        if not isinstance(result['courses'], list):
            try:
                result['courses'] = frappe.parse_json(result['courses'])
            except:
                result['courses'] = []
    else:
        result['courses'] = []
    
    return result

@frappe.whitelist()
def create_class(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.new_doc("Program")
    
    doc.program_name = data.get("program_name")
    doc.program_abbreviation = data.get("program_abbreviation")
    doc.department = data.get("department")
    
    if data.get("hero_image"):
        doc.hero_image = data.get("hero_image")
    
    # Handle courses child table
    if data.get("courses"):
        for course_entry in data.get("courses"):
            if course_entry.get("course"):
                doc.append("courses", {
                    "course": course_entry.get("course"),
                    "course_name": course_entry.get("course_name"),
                    "required": course_entry.get("required", 1),
                })
    
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def update_class(name, data):
    if not name:
        frappe.throw(_("Program name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Program", name)
    
    if "program_name" in data:
        doc.program_name = data.get("program_name")
    if "program_abbreviation" in data:
        doc.program_abbreviation = data.get("program_abbreviation")
    if "department" in data:
        doc.department = data.get("department")
    if "hero_image" in data:
        doc.hero_image = data.get("hero_image")
    
    # Update courses child table
    if "courses" in data:
        doc.set("courses", [])
        for course_entry in data.get("courses", []):
            if course_entry.get("course"):
                doc.append("courses", {
                    "course": course_entry.get("course"),
                    "course_name": course_entry.get("course_name"),
                    "required": course_entry.get("required", 1),
                })
    
    doc.save()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def delete_class(name):
    if not name:
        frappe.throw(_("Program name is required"))

    frappe.delete_doc("Program", name)
    frappe.db.commit()

    return {"message": "Program deleted"}

@frappe.whitelist()
def get_departments():
    """Get all departments for dropdown"""
    try:
        return frappe.get_all(
            "Department",
            fields=["name"],
            order_by="name",
            limit_page_length=500
        )
    except Exception as e:
        frappe.log_error(f"Error fetching departments: {str(e)}", "Class API")
        return []

@frappe.whitelist()
def get_courses():
    """Get all courses for dropdown"""
    try:
        return frappe.get_all(
            "Course",
            fields=["name", "course_name"],
            order_by="course_name",
            limit_page_length=500
        )
    except Exception as e:
        frappe.log_error(f"Error fetching courses: {str(e)}", "Class API")
        return []

@frappe.whitelist()
def get_programs():
    """Get all programs for dropdown"""
    try:
        return frappe.get_all(
            "Program",
            fields=["name"],
            order_by="name",
            limit_page_length=500
        )
    except Exception as e:
        frappe.log_error(f"Error fetching programs: {str(e)}", "Class API")
        return []

@frappe.whitelist()
def get_doctype_count(doctype, filters=None):
    """Get count for a specific doctype with filters"""
    try:
        if filters:
            if isinstance(filters, str):
                filters = json.loads(filters)
            count = frappe.db.count(doctype, filters=filters)
        else:
            count = frappe.db.count(doctype)
        return count
    except Exception as e:
        frappe.log_error(f"Error getting count for {doctype}: {str(e)}", "Class API")
        return 0