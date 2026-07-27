import frappe
import json
from frappe import _
from frappe.utils import cint

@frappe.whitelist()
def get_class_arms(
    page=1,
    page_size=20,
    search=None,
    program=None,
    academic_year=None,
    academic_term=None,
    course=None,
):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    or_filters = []

    if program:
        filters["program"] = program
    if academic_year:
        filters["academic_year"] = academic_year
    if academic_term:
        filters["academic_term"] = academic_term
    if course:
        filters["course"] = course

    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["program", "like", f"%{search}%"],
            ["student_group_name", "like", f"%{search}%"],
        ]

    rows = frappe.get_all(
        "Student Group",
        fields=[
            "name",
            "student_group_name",
            "program",
            "academic_year",
            "academic_term",
            "disabled",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="modified desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count(
        "Student Group",
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
def get_class_arm(name):
    if not name:
        frappe.throw(_("Class Arm name is required"))

    doc = frappe.get_doc("Student Group", name)
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
    
    if result.get('instructors'):
        if not isinstance(result['instructors'], list):
            try:
                result['instructors'] = frappe.parse_json(result['instructors'])
            except:
                result['instructors'] = []
    else:
        result['instructors'] = []
    
    return result

@frappe.whitelist()
def create_class_arm(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.new_doc("Student Group")
    
    # Set fields
    doc.student_group_name = data.get("student_group_name")
    doc.program = data.get("program")
    doc.academic_year = data.get("academic_year")
    doc.academic_term = data.get("academic_term")
    doc.group_based_on = data.get("group_based_on", "Course")
    doc.course = data.get("course")
    doc.batch = data.get("batch")
    doc.student_category = data.get("student_category")
    doc.max_strength = data.get("max_strength")
    doc.disabled = data.get("disabled", 0)
    
    # Add students
    if data.get("students"):
        for student in data.get("students"):
            if student.get("student"):
                doc.append("students", {
                    "student": student.get("student"),
                    "student_name": student.get("student_name"),
                    "group_roll_number": student.get("group_roll_number"),
                    "active": student.get("active", 1),
                })
    
    # Add instructors
    if data.get("instructors"):
        for instructor in data.get("instructors"):
            if instructor.get("instructor"):
                doc.append("instructors", {
                    "instructor": instructor.get("instructor"),
                    "instructor_name": instructor.get("instructor_name"),
                })
    
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def update_class_arm(name, data):
    if not name:
        frappe.throw(_("Class Arm name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Student Group", name)
    
    # Update fields
    if "student_group_name" in data:
        doc.student_group_name = data.get("student_group_name")
    if "program" in data:
        doc.program = data.get("program")
    if "academic_year" in data:
        doc.academic_year = data.get("academic_year")
    if "academic_term" in data:
        doc.academic_term = data.get("academic_term")
    if "group_based_on" in data:
        doc.group_based_on = data.get("group_based_on")
    if "course" in data:
        doc.course = data.get("course")
    if "batch" in data:
        doc.batch = data.get("batch")
    if "student_category" in data:
        doc.student_category = data.get("student_category")
    if "max_strength" in data:
        doc.max_strength = data.get("max_strength")
    if "disabled" in data:
        doc.disabled = data.get("disabled", 0)
    
    # Update students
    if "students" in data:
        doc.set("students", [])
        for student in data.get("students", []):
            if student.get("student"):
                doc.append("students", {
                    "student": student.get("student"),
                    "student_name": student.get("student_name"),
                    "group_roll_number": student.get("group_roll_number"),
                    "active": student.get("active", 1),
                })
    
    # Update instructors
    if "instructors" in data:
        doc.set("instructors", [])
        for instructor in data.get("instructors", []):
            if instructor.get("instructor"):
                doc.append("instructors", {
                    "instructor": instructor.get("instructor"),
                    "instructor_name": instructor.get("instructor_name"),
                })
    
    doc.save()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def delete_class_arm(name):
    if not name:
        frappe.throw(_("Class Arm name is required"))

    frappe.delete_doc("Student Group", name)
    frappe.db.commit()

    return {"message": "Class Arm deleted"}

@frappe.whitelist()
def get_class_arm_options():
    """Get all options for dropdowns"""
    try:
        programs = frappe.get_all("Program", fields=["name"], order_by="name", limit_page_length=500)
        academic_years = frappe.get_all("Academic Year", fields=["name"], order_by="name desc", limit_page_length=500)
        academic_terms = frappe.get_all("Academic Term", fields=["name"], order_by="name", limit_page_length=500)
        courses = frappe.get_all("Course", fields=["name"], order_by="name", limit_page_length=500)
        batches = frappe.get_all("Student Batch Name", fields=["name"], order_by="name", limit_page_length=500)
        student_categories = frappe.get_all("Student Category", fields=["name"], order_by="name", limit_page_length=500)
        
        # Get students for dropdown
        students = frappe.get_all("Student", fields=["name", "student_name"], order_by="student_name", limit_page_length=500)
        
        # Get instructors for dropdown
        instructors = frappe.get_all("Instructor", fields=["name", "instructor_name"], order_by="instructor_name", limit_page_length=500)
        
        return {
            "programs": programs,
            "academic_years": academic_years,
            "academic_terms": academic_terms,
            "courses": courses,
            "batches": batches,
            "student_categories": student_categories,
            "students": students,
            "instructors": instructors,
        }
    except Exception as e:
        frappe.log_error(f"Error fetching class arm options: {str(e)}", "Class Arms API")
        return {
            "programs": [],
            "academic_years": [],
            "academic_terms": [],
            "courses": [],
            "batches": [],
            "student_categories": [],
            "students": [],
            "instructors": [],
        }

@frappe.whitelist()
def get_students():
    """Get all students for dropdown"""
    try:
        return frappe.get_all("Student", fields=["name", "student_name"], order_by="student_name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching students: {str(e)}", "Class Arms API")
        return []

@frappe.whitelist()
def get_instructors():
    """Get all instructors for dropdown"""
    try:
        return frappe.get_all("Instructor", fields=["name", "instructor_name"], order_by="instructor_name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching instructors: {str(e)}", "Class Arms API")
        return []

@frappe.whitelist()
def get_programs():
    """Get all programs for dropdown"""
    try:
        return frappe.get_all("Program", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching programs: {str(e)}", "Class Arms API")
        return []

@frappe.whitelist()
def get_academic_years():
    """Get all academic years for dropdown"""
    try:
        return frappe.get_all("Academic Year", fields=["name"], order_by="name desc", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching academic years: {str(e)}", "Class Arms API")
        return []

@frappe.whitelist()
def get_academic_terms(academic_year=None):
    """Get all academic terms for dropdown"""
    try:
        filters = {}
        if academic_year:
            filters["academic_year"] = academic_year
        return frappe.get_all("Academic Term", fields=["name"], filters=filters, order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching academic terms: {str(e)}", "Class Arms API")
        return []

@frappe.whitelist()
def get_courses():
    """Get all courses for dropdown"""
    try:
        return frappe.get_all("Course", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching courses: {str(e)}", "Class Arms API")
        return []

@frappe.whitelist()
def get_batches():
    """Get all batches for dropdown"""
    try:
        return frappe.get_all("Student Batch Name", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching batches: {str(e)}", "Class Arms API")
        return []

@frappe.whitelist()
def get_student_categories():
    """Get all student categories for dropdown"""
    try:
        return frappe.get_all("Student Category", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching student categories: {str(e)}", "Class Arms API")
        return []