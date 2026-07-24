import frappe
import json
from frappe import _
from frappe.utils import cint

@frappe.whitelist()
def get_teachers(
    page=1,
    page_size=20,
    search=None,
    status=None,
    department=None,
):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}

    if status:
        filters["status"] = status

    if department:
        filters["department"] = department

    or_filters = []

    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["instructor_name", "like", f"%{search}%"],
            ["employee", "like", f"%{search}%"],
        ]

    rows = frappe.get_all(
        "Instructor",
        fields=[
            "name",
            "instructor_name",
            "employee",
            "department",
            "status",
            "gender",
            "image",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="modified desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count(
        "Instructor",
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
def get_teacher(name):
    if not name:
        frappe.throw(_("Instructor name is required"))

    doc = frappe.get_doc("Instructor", name)
    
    result = doc.as_dict()
    if result.get('instructor_log'):
        if not isinstance(result['instructor_log'], list):
            try:
                result['instructor_log'] = frappe.parse_json(result['instructor_log'])
            except:
                result['instructor_log'] = []
    else:
        result['instructor_log'] = []
    
    return result

@frappe.whitelist()
def create_teacher(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.new_doc("Instructor")
    
    doc.instructor_name = data.get("instructor_name")
    doc.employee = data.get("employee")
    doc.department = data.get("department")
    doc.status = data.get("status", "Active")
    doc.gender = data.get("gender")
    doc.image = data.get("image")
    
    if data.get("instructor_log"):
        for log_entry in data.get("instructor_log"):
            if log_entry.get("academic_year") or log_entry.get("program"):
                doc.append("instructor_log", {
                    "academic_year": log_entry.get("academic_year"),
                    "academic_term": log_entry.get("academic_term"),
                    "program": log_entry.get("program"),
                    "course": log_entry.get("course"),
                })
    
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def update_teacher(name, data):
    if not name:
        frappe.throw(_("Instructor name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Instructor", name)
    
    if "instructor_name" in data:
        doc.instructor_name = data.get("instructor_name")
    if "employee" in data:
        doc.employee = data.get("employee")
    if "department" in data:
        doc.department = data.get("department")
    if "status" in data:
        doc.status = data.get("status")
    if "gender" in data:
        doc.gender = data.get("gender")
    if "image" in data:
        doc.image = data.get("image")
    
    if "instructor_log" in data:
        doc.set("instructor_log", [])
        
        for log_entry in data.get("instructor_log", []):
            if log_entry.get("academic_year") or log_entry.get("program"):
                doc.append("instructor_log", {
                    "academic_year": log_entry.get("academic_year"),
                    "academic_term": log_entry.get("academic_term"),
                    "program": log_entry.get("program"),
                    "course": log_entry.get("course"),
                })
    
    doc.save()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def delete_teacher(name):
    if not name:
        frappe.throw(_("Instructor name is required"))

    frappe.delete_doc("Instructor", name)
    frappe.db.commit()

    return {"message": "Instructor deleted"}

@frappe.whitelist()
def get_departments():
    """Get all departments for dropdown"""
    try:
        departments = frappe.get_all(
            "Department",
            fields=["name"],
            order_by="name",
            limit_page_length=500
        )
        return departments
    except Exception as e:
        frappe.log_error(f"Error fetching departments: {str(e)}", "Teacher API")
        return []

@frappe.whitelist()
def get_employees():
    """Get all employees for dropdown"""
    try:
        employees = frappe.get_all(
            "Employee",
            fields=["name", "employee_name"],
            order_by="employee_name",
            limit_page_length=500
        )
        return employees
    except Exception as e:
        frappe.log_error(f"Error fetching employees: {str(e)}", "Teacher API")
        return []

@frappe.whitelist()
def get_academic_years():
    """Get all academic years for dropdown"""
    try:
        years = frappe.get_all(
            "Academic Year",
            fields=["name"],
            order_by="name desc",
            limit_page_length=500
        )
        return years
    except Exception as e:
        frappe.log_error(f"Error fetching academic years: {str(e)}", "Teacher API")
        return []

@frappe.whitelist()
def get_academic_terms():
    """Get all academic terms for dropdown"""
    try:
        terms = frappe.get_all(
            "Academic Term",
            fields=["name"],
            order_by="name",
            limit_page_length=500
        )
        return terms
    except Exception as e:
        frappe.log_error(f"Error fetching academic terms: {str(e)}", "Teacher API")
        return []

@frappe.whitelist()
def get_programs():
    """Get all programs for dropdown"""
    try:
        programs = frappe.get_all(
            "Program",
            fields=["name"],
            order_by="name",
            limit_page_length=500
        )
        return programs
    except Exception as e:
        frappe.log_error(f"Error fetching programs: {str(e)}", "Teacher API")
        return []

@frappe.whitelist()
def get_program_courses(program):
    """Get courses for a specific program"""
    if not program:
        return []
    
    try:
        # Direct SQL query to get courses from Program Course child table
        result = frappe.db.sql("""
            SELECT course, course_name 
            FROM `tabProgram Course` 
            WHERE parent = %s
            ORDER BY idx
        """, (program,), as_dict=True)
        
        # Return the course names
        courses = []
        for row in result:
            # Use course_name if available, otherwise use course
            course_name = row.course_name or row.course
            if course_name:
                courses.append({"name": course_name})
        
        return courses
        
    except Exception as e:
        frappe.log_error(f"Error fetching courses for program {program}: {str(e)}", "Teacher API")
        return []