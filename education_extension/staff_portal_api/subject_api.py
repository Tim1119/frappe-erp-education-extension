import frappe
import json
from frappe import _
from frappe.utils import cint

@frappe.whitelist()
def get_subjects(
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
            ["course_name", "like", f"%{search}%"],
            ["description", "like", f"%{search}%"],
        ]

    rows = frappe.get_all(
        "Course",
        fields=[
            "name",
            "course_name",
            "department",
            "description",
            "hero_image",
            "default_grading_scale",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="modified desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count(
        "Course",
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
def get_subject(name):
    if not name:
        frappe.throw(_("Course name is required"))

    doc = frappe.get_doc("Course", name)
    
    result = doc.as_dict()
    
    # Ensure child tables are properly formatted
    if result.get('topics'):
        if not isinstance(result['topics'], list):
            try:
                result['topics'] = frappe.parse_json(result['topics'])
            except:
                result['topics'] = []
    else:
        result['topics'] = []
    
    if result.get('assessment_criteria'):
        if not isinstance(result['assessment_criteria'], list):
            try:
                result['assessment_criteria'] = frappe.parse_json(result['assessment_criteria'])
            except:
                result['assessment_criteria'] = []
    else:
        result['assessment_criteria'] = []
    
    return result

@frappe.whitelist()
def get_subject_connections(course):
    """Get all connection counts for a course"""
    if not course:
        frappe.throw(_("Course name is required"))
    
    try:
        # 1. Class count: Programs that have this course in their Program Course child table
        class_count = frappe.db.count("Program Course", {
            "course": course
        })
        
        # 2. Subject Enrollment count: Program Enrollments for programs that have this course
        enrollment_count = frappe.db.sql("""
            SELECT COUNT(DISTINCT pe.name) as count
            FROM `tabProgram Enrollment` pe
            INNER JOIN `tabProgram Course` pc ON pc.parent = pe.program
            WHERE pc.course = %s AND pe.docstatus = 1
        """, (course,), as_dict=True)[0].get("count", 0)
        
        # 3. Subject Schedule count
        schedule_count = frappe.db.count("Course Schedule", {
            "course": course
        })
        
        # 4. Student count: Unique students enrolled in programs with this course
        student_count = frappe.db.sql("""
            SELECT COUNT(DISTINCT pe.student) as count
            FROM `tabProgram Enrollment` pe
            INNER JOIN `tabProgram Course` pc ON pc.parent = pe.program
            WHERE pc.course = %s AND pe.docstatus = 1
        """, (course,), as_dict=True)[0].get("count", 0)
        
        # 5. Class Arm count: Student Groups with this course
        class_arm_count = frappe.db.count("Student Group", {
            "course": course
        })
        
        # 6. Assessment Plan count
        assessment_plan_count = frappe.db.count("Assessment Plan", {
            "course": course
        })
        
        # 7. Assessment Result count
        assessment_result_count = frappe.db.count("Assessment Result", {
            "course": course
        })

        return {
            "classes": class_count,
            "student_enrollments": enrollment_count,
            "subject_schedules": schedule_count,
            "students": student_count,
            "class_arms": class_arm_count,
            "assessment_plans": assessment_plan_count,
            "assessment_results": assessment_result_count,
        }
        
    except Exception as e:
        frappe.log_error(f"Error fetching connections for course {course}: {str(e)}", "Subject API")
        return {
            "classes": 0,
            "student_enrollments": 0,
            "subject_schedules": 0,
            "students": 0,
            "class_arms": 0,
            "assessment_plans": 0,
            "assessment_results": 0,
        }

@frappe.whitelist()
def create_subject(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.new_doc("Course")
    
    doc.course_name = data.get("course_name")
    doc.department = data.get("department")
    doc.description = data.get("description")
    doc.default_grading_scale = data.get("default_grading_scale")
    
    if data.get("hero_image"):
        doc.hero_image = data.get("hero_image")
    
    # Handle topics child table
    if data.get("topics"):
        for topic_entry in data.get("topics"):
            if topic_entry.get("topic"):
                doc.append("topics", {
                    "topic": topic_entry.get("topic"),
                    "topic_name": topic_entry.get("topic_name"),
                })
    
    # Handle assessment criteria child table
    if data.get("assessment_criteria"):
        for criteria_entry in data.get("assessment_criteria"):
            if criteria_entry.get("assessment_criteria"):
                doc.append("assessment_criteria", {
                    "assessment_criteria": criteria_entry.get("assessment_criteria"),
                    "weightage": criteria_entry.get("weightage", 0),
                })
    
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def update_subject(name, data):
    if not name:
        frappe.throw(_("Course name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Course", name)
    
    if "course_name" in data:
        doc.course_name = data.get("course_name")
    if "department" in data:
        doc.department = data.get("department")
    if "description" in data:
        doc.description = data.get("description")
    if "default_grading_scale" in data:
        doc.default_grading_scale = data.get("default_grading_scale")
    if "hero_image" in data:
        doc.hero_image = data.get("hero_image")
    
    # Update topics child table
    if "topics" in data:
        doc.set("topics", [])
        for topic_entry in data.get("topics", []):
            if topic_entry.get("topic"):
                doc.append("topics", {
                    "topic": topic_entry.get("topic"),
                    "topic_name": topic_entry.get("topic_name"),
                })
    
    # Update assessment criteria child table
    if "assessment_criteria" in data:
        doc.set("assessment_criteria", [])
        for criteria_entry in data.get("assessment_criteria", []):
            if criteria_entry.get("assessment_criteria"):
                doc.append("assessment_criteria", {
                    "assessment_criteria": criteria_entry.get("assessment_criteria"),
                    "weightage": criteria_entry.get("weightage", 0),
                })
    
    doc.save()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def delete_subject(name):
    if not name:
        frappe.throw(_("Course name is required"))

    frappe.delete_doc("Course", name)
    frappe.db.commit()

    return {"message": "Course deleted"}

@frappe.whitelist()
def create_topic(data):
    if isinstance(data, str):
        data = json.loads(data)
    
    if frappe.db.exists("Topic", data.get("topic_name")):
        frappe.throw(_("Topic '{0}' already exists").format(data.get("topic_name")))
    
    doc = frappe.new_doc("Topic")
    doc.topic_name = data.get("topic_name")
    doc.description = data.get("description", "")
    
    doc.insert()
    frappe.db.commit()
    
    return doc.as_dict()

@frappe.whitelist()
def create_assessment_criteria(data):
    if isinstance(data, str):
        data = json.loads(data)
    
    if frappe.db.exists("Assessment Criteria", data.get("assessment_criteria")):
        frappe.throw(_("Assessment Criteria '{0}' already exists").format(data.get("assessment_criteria")))
    
    doc = frappe.new_doc("Assessment Criteria")
    doc.assessment_criteria = data.get("assessment_criteria")
    doc.assessment_criteria_group = data.get("assessment_criteria_group", "")
    
    doc.insert()
    frappe.db.commit()
    
    return doc.as_dict()

@frappe.whitelist()
def get_departments():
    try:
        return frappe.get_all("Department", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching departments: {str(e)}", "Subject API")
        return []

@frappe.whitelist()
def get_topics():
    try:
        return frappe.get_all("Topic", fields=["name", "topic_name"], order_by="topic_name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching topics: {str(e)}", "Subject API")
        return []

@frappe.whitelist()
def get_grading_scales():
    try:
        return frappe.get_all("Grading Scale", fields=["name"], filters={"docstatus": 1}, order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching grading scales: {str(e)}", "Subject API")
        return []

@frappe.whitelist()
def get_assessment_criteria():
    try:
        return frappe.get_all("Assessment Criteria", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching assessment criteria: {str(e)}", "Subject API")
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
        frappe.log_error(f"Error getting count for {doctype}: {str(e)}", "Subject API")
        return 0