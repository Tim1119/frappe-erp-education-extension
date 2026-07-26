import frappe
import json
from frappe import _
from frappe.utils import cint, today

@frappe.whitelist()
def get_student_applicants(
    page=1,
    page_size=20,
    search=None,
    program=None,
    academic_year=None,
    application_status=None,
):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    or_filters = []

    if program:
        filters["program"] = program
    if academic_year:
        filters["academic_year"] = academic_year
    if application_status:
        filters["application_status"] = application_status

    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["first_name", "like", f"%{search}%"],
            ["last_name", "like", f"%{search}%"],
            ["student_email_id", "like", f"%{search}%"],
            ["student_mobile_number", "like", f"%{search}%"],
            ["title", "like", f"%{search}%"],
        ]

    rows = frappe.get_all(
        "Student Applicant",
        fields=[
            "name",
            "first_name",
            "middle_name",
            "last_name",
            "title",
            "program",
            "academic_year",
            "academic_term",
            "application_status",
            "application_date",
            "student_email_id",
            "student_mobile_number",
            "paid",
            "image",
            "gender",
            "date_of_birth",
            "student_category",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="modified desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count(
        "Student Applicant",
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
def get_student_applicant(name):
    if not name:
        frappe.throw(_("Student Applicant name is required"))

    doc = frappe.get_doc("Student Applicant", name)
    
    result = doc.as_dict()
    
    # Ensure child tables are properly formatted
    for child_table in ['guardians', 'siblings']:
        if result.get(child_table):
            if not isinstance(result[child_table], list):
                try:
                    result[child_table] = frappe.parse_json(result[child_table])
                except:
                    result[child_table] = []
        else:
            result[child_table] = []
    
    return result

@frappe.whitelist()
def create_student_applicant(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.new_doc("Student Applicant")
    
    # Personal Information
    doc.first_name = data.get("first_name")
    doc.middle_name = data.get("middle_name")
    doc.last_name = data.get("last_name")
    doc.date_of_birth = data.get("date_of_birth")
    doc.gender = data.get("gender")
    doc.blood_group = data.get("blood_group")
    doc.nationality = data.get("nationality")
    doc.student_category = data.get("student_category")
    
    # Academic Information
    doc.program = data.get("program")
    doc.academic_year = data.get("academic_year")
    doc.academic_term = data.get("academic_term")
    doc.application_date = data.get("application_date", today())
    doc.application_status = data.get("application_status", "Applied")
    doc.paid = data.get("paid", 0)
    
    # Contact Information
    doc.student_email_id = data.get("student_email_id")
    doc.student_mobile_number = data.get("student_mobile_number")
    
    # Address
    doc.address_line_1 = data.get("address_line_1")
    doc.address_line_2 = data.get("address_line_2")
    doc.city = data.get("city")
    doc.state = data.get("state")
    doc.pincode = data.get("pincode")
    doc.country = data.get("country")
    
    # Image
    if data.get("image"):
        doc.image = data.get("image")
    
    # Guardians child table
    if data.get("guardians"):
        for guardian_entry in data.get("guardians"):
            if guardian_entry.get("guardian"):
                doc.append("guardians", {
                    "guardian": guardian_entry.get("guardian"),
                    "guardian_name": guardian_entry.get("guardian_name"),
                    "relation": guardian_entry.get("relation"),
                })
    
    # Siblings child table
    if data.get("siblings"):
        for sibling_entry in data.get("siblings"):
            if sibling_entry.get("full_name"):
                doc.append("siblings", {
                    "full_name": sibling_entry.get("full_name"),
                    "gender": sibling_entry.get("gender"),
                    "program": sibling_entry.get("program"),
                    "date_of_birth": sibling_entry.get("date_of_birth"),
                })
    
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def update_student_applicant(name, data):
    if not name:
        frappe.throw(_("Student Applicant name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Student Applicant", name)
    
    # Personal Information
    if "first_name" in data:
        doc.first_name = data.get("first_name")
    if "middle_name" in data:
        doc.middle_name = data.get("middle_name")
    if "last_name" in data:
        doc.last_name = data.get("last_name")
    if "date_of_birth" in data:
        doc.date_of_birth = data.get("date_of_birth")
    if "gender" in data:
        doc.gender = data.get("gender")
    if "blood_group" in data:
        doc.blood_group = data.get("blood_group")
    if "nationality" in data:
        doc.nationality = data.get("nationality")
    if "student_category" in data:
        doc.student_category = data.get("student_category")
    
    # Academic Information
    if "program" in data:
        doc.program = data.get("program")
    if "academic_year" in data:
        doc.academic_year = data.get("academic_year")
    if "academic_term" in data:
        doc.academic_term = data.get("academic_term")
    if "application_date" in data:
        doc.application_date = data.get("application_date")
    if "application_status" in data:
        doc.application_status = data.get("application_status")
    if "paid" in data:
        doc.paid = data.get("paid", 0)
    
    # Contact Information
    if "student_email_id" in data:
        doc.student_email_id = data.get("student_email_id")
    if "student_mobile_number" in data:
        doc.student_mobile_number = data.get("student_mobile_number")
    
    # Address
    if "address_line_1" in data:
        doc.address_line_1 = data.get("address_line_1")
    if "address_line_2" in data:
        doc.address_line_2 = data.get("address_line_2")
    if "city" in data:
        doc.city = data.get("city")
    if "state" in data:
        doc.state = data.get("state")
    if "pincode" in data:
        doc.pincode = data.get("pincode")
    if "country" in data:
        doc.country = data.get("country")
    
    # Image
    if "image" in data:
        doc.image = data.get("image")
    
    # Guardians child table
    if "guardians" in data:
        doc.set("guardians", [])
        for guardian_entry in data.get("guardians", []):
            if guardian_entry.get("guardian"):
                doc.append("guardians", {
                    "guardian": guardian_entry.get("guardian"),
                    "guardian_name": guardian_entry.get("guardian_name"),
                    "relation": guardian_entry.get("relation"),
                })
    
    # Siblings child table
    if "siblings" in data:
        doc.set("siblings", [])
        for sibling_entry in data.get("siblings", []):
            if sibling_entry.get("full_name"):
                doc.append("siblings", {
                    "full_name": sibling_entry.get("full_name"),
                    "gender": sibling_entry.get("gender"),
                    "program": sibling_entry.get("program"),
                    "date_of_birth": sibling_entry.get("date_of_birth"),
                })
    
    doc.save()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def delete_student_applicant(name):
    if not name:
        frappe.throw(_("Student Applicant name is required"))

    frappe.delete_doc("Student Applicant", name)
    frappe.db.commit()

    return {"message": "Student Applicant deleted"}

@frappe.whitelist()
def get_programs():
    """Get all programs for dropdown"""
    try:
        return frappe.get_all("Program", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching programs: {str(e)}", "Student Applicant API")
        return []

@frappe.whitelist()
def get_academic_years():
    """Get all academic years for dropdown"""
    try:
        return frappe.get_all("Academic Year", fields=["name"], order_by="name desc", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching academic years: {str(e)}", "Student Applicant API")
        return []

@frappe.whitelist()
def get_academic_terms(academic_year=None):
    """Get academic terms for a specific academic year"""
    try:
        filters = {}
        if academic_year:
            filters["academic_year"] = academic_year
        return frappe.get_all("Academic Term", fields=["name"], filters=filters, order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching academic terms: {str(e)}", "Student Applicant API")
        return []

@frappe.whitelist()
def get_genders():
    """Get all genders for dropdown"""
    try:
        return frappe.get_all("Gender", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching genders: {str(e)}", "Student Applicant API")
        return []

@frappe.whitelist()
def get_student_categories():
    """Get all student categories for dropdown"""
    try:
        return frappe.get_all("Student Category", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching student categories: {str(e)}", "Student Applicant API")
        return []

@frappe.whitelist()
def get_guardians():
    """Get all guardians for dropdown"""
    try:
        return frappe.get_all("Guardian", fields=["name", "guardian_name"], order_by="guardian_name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching guardians: {str(e)}", "Student Applicant API")
        return []

@frappe.whitelist()
def create_guardian(data):
    """Create a new guardian"""
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.new_doc("Guardian")
    
    doc.guardian_name = data.get("guardian_name")
    doc.email_address = data.get("email_address")
    doc.mobile_number = data.get("mobile_number")
    doc.alternate_number = data.get("alternate_number")
    doc.date_of_birth = data.get("date_of_birth")
    doc.education = data.get("education")
    doc.occupation = data.get("occupation")
    doc.designation = data.get("designation")
    doc.work_address = data.get("work_address")
    
    if data.get("image"):
        doc.image = data.get("image")
    
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def get_doctype_count(doctype, filters=None):
    """Get count for any doctype with filters"""
    try:
        if filters:
            if isinstance(filters, str):
                filters = json.loads(filters)
            count = frappe.db.count(doctype, filters=filters)
        else:
            count = frappe.db.count(doctype)
        return count
    except Exception as e:
        frappe.log_error(f"Error getting count for {doctype}: {str(e)}", "Student Applicant API")
        return 0