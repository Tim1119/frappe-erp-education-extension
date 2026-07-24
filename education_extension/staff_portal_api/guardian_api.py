import frappe
import json
from frappe import _
from frappe.utils import cint

@frappe.whitelist()
def get_guardians(
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
            ["guardian_name", "like", f"%{search}%"],
            ["email_address", "like", f"%{search}%"],
            ["mobile_number", "like", f"%{search}%"],
        ]

    rows = frappe.get_all(
        "Guardian",
        fields=[
            "name",
            "guardian_name",
            "email_address",
            "mobile_number",
            "alternate_number",
            "date_of_birth",
            "education",
            "occupation",
            "designation",
            "work_address",
            "image",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="modified desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count(
        "Guardian",
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
def get_guardian(name):
    if not name:
        frappe.throw(_("Guardian name is required"))

    doc = frappe.get_doc("Guardian", name)
    
    result = doc.as_dict()
    # Ensure child tables are properly formatted
    if result.get('students'):
        if not isinstance(result['students'], list):
            try:
                result['students'] = frappe.parse_json(result['students'])
            except:
                result['students'] = []
    else:
        result['students'] = []
    
    if result.get('interests'):
        if not isinstance(result['interests'], list):
            try:
                result['interests'] = frappe.parse_json(result['interests'])
            except:
                result['interests'] = []
    else:
        result['interests'] = []
    
    return result

@frappe.whitelist()
def create_guardian(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.new_doc("Guardian")
    
    # Set fields
    doc.guardian_name = data.get("guardian_name")
    doc.email_address = data.get("email_address")
    doc.mobile_number = data.get("mobile_number")
    doc.alternate_number = data.get("alternate_number")
    doc.date_of_birth = data.get("date_of_birth")
    doc.education = data.get("education")
    doc.occupation = data.get("occupation")
    doc.designation = data.get("designation")
    doc.work_address = data.get("work_address")
    doc.image = data.get("image")
    
    # Handle students child table
    if data.get("students"):
        for student_entry in data.get("students"):
            if student_entry.get("student"):
                doc.append("students", {
                    "student": student_entry.get("student"),
                    "student_name": student_entry.get("student_name"),
                })
    
    # Handle interests child table
    if data.get("interests"):
        for interest_entry in data.get("interests"):
            if interest_entry.get("interest"):
                doc.append("interests", {
                    "interest": interest_entry.get("interest"),
                })
    
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def update_guardian(name, data):
    if not name:
        frappe.throw(_("Guardian name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Guardian", name)
    
    # Update fields
    if "guardian_name" in data:
        doc.guardian_name = data.get("guardian_name")
    if "email_address" in data:
        doc.email_address = data.get("email_address")
    if "mobile_number" in data:
        doc.mobile_number = data.get("mobile_number")
    if "alternate_number" in data:
        doc.alternate_number = data.get("alternate_number")
    if "date_of_birth" in data:
        doc.date_of_birth = data.get("date_of_birth")
    if "education" in data:
        doc.education = data.get("education")
    if "occupation" in data:
        doc.occupation = data.get("occupation")
    if "designation" in data:
        doc.designation = data.get("designation")
    if "work_address" in data:
        doc.work_address = data.get("work_address")
    if "image" in data:
        doc.image = data.get("image")
    
    # Update students child table
    if "students" in data:
        doc.set("students", [])
        for student_entry in data.get("students", []):
            if student_entry.get("student"):
                doc.append("students", {
                    "student": student_entry.get("student"),
                    "student_name": student_entry.get("student_name"),
                })
    
    # Update interests child table
    if "interests" in data:
        doc.set("interests", [])
        for interest_entry in data.get("interests", []):
            if interest_entry.get("interest"):
                doc.append("interests", {
                    "interest": interest_entry.get("interest"),
                })
    
    doc.save()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def delete_guardian(name):
    if not name:
        frappe.throw(_("Guardian name is required"))

    frappe.delete_doc("Guardian", name)
    frappe.db.commit()

    return {"message": "Guardian deleted"}

@frappe.whitelist()
def get_students():
    """Get all students for dropdown"""
    try:
        students = frappe.get_all(
            "Student",
            fields=["name", "student_name"],
            order_by="student_name",
            limit_page_length=500
        )
        return students
    except Exception as e:
        frappe.log_error(f"Error fetching students: {str(e)}", "Guardian API")
        return []