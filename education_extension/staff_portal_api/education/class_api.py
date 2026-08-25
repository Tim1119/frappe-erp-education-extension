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
    course=None,
):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    or_filters = []

    if department:
        filters["department"] = department

    if course:
        # Filter programs that have this course in their Program Course child table
        program_courses = frappe.get_all(
            "Program Course",
            filters={"course": course},
            fields=["parent"]
        )
        program_names = [pc.parent for pc in program_courses]
        if program_names:
            filters["name"] = ["in", program_names]
        else:
            # If no programs have this course, return empty
            return {
                "rows": [],
                "count": 0,
                "page": page,
                "page_size": page_size,
                "total_pages": 0,
            }

    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["program_name", "like", f"%{search}%"],
            ["program_abbreviation", "like", f"%{search}%"],
        ]

    rows = frappe.get_list(
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
    try:
        return frappe.get_list("Department", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching departments: {str(e)}", "Class API")
        return []

@frappe.whitelist()
def get_courses():
    try:
        return frappe.get_list("Course", fields=["name", "course_name"], order_by="course_name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching courses: {str(e)}", "Class API")
        return []

@frappe.whitelist()
def get_programs():
    try:
        return frappe.get_list("Program", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching programs: {str(e)}", "Class API")
        return []

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
        frappe.log_error(f"Error getting count for {doctype}: {str(e)}", "Class API")
        return 0

@frappe.whitelist()
def get_class_connections(program):
    """Get all connection counts for a program (class)"""
    if not program:
        frappe.throw(_("Program name is required"))
    
    try:
        # 1. Student count: Students enrolled in this program
        student_count = frappe.db.sql("""
            SELECT COUNT(DISTINCT pe.student) as count
            FROM `tabProgram Enrollment` pe
            WHERE pe.program = %s AND pe.docstatus = 1
        """, (program,), as_dict=True)[0].get("count", 0)
        
        # 2. Student Applicant count
        student_applicant_count = frappe.db.count("Student Applicant", {
            "program": program
        })
        
        # 3. Student Group (Class Arm) count
        class_arm_count = frappe.db.count("Student Group", {
            "program": program
        })
        
        # 4. Student Log count
        student_log_count = frappe.db.count("Student Log", {
            "program": program
        })
        
        # 5. Assessment Plan count
        assessment_plan_count = frappe.db.count("Assessment Plan", {
            "program": program
        })
        
        # 6. Assessment Result count
        assessment_result_count = frappe.db.count("Assessment Result", {
            "program": program
        })
        
        # 7. Fee Structure count
        fee_structure_count = frappe.db.count("Fee Structure", {
            "program": program
        })
        
        # 8. Fee Schedule count
        fee_schedule_count = frappe.db.count("Fee Schedule", {
            "program": program
        })

        return {
            "students": student_count,
            "student_applicants": student_applicant_count,
            "class_arms": class_arm_count,
            "student_logs": student_log_count,
            "assessment_plans": assessment_plan_count,
            "assessment_results": assessment_result_count,
            "fee_structures": fee_structure_count,
            "fee_schedules": fee_schedule_count,
        }
        
    except Exception as e:
        frappe.log_error(f"Error fetching connections for program {program}: {str(e)}", "Class API")
        return {
            "students": 0,
            "student_applicants": 0,
            "class_arms": 0,
            "student_logs": 0,
            "assessment_plans": 0,
            "assessment_results": 0,
            "fee_structures": 0,
            "fee_schedules": 0,
        }