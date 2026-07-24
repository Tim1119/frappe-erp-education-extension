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
                    "assessment_criteria_group": criteria_entry.get("assessment_criteria_group"),
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
                    "assessment_criteria_group": criteria_entry.get("assessment_criteria_group"),
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
    
    
import frappe
import json
from frappe import _
from frappe.utils import cint

# ... existing methods ...

@frappe.whitelist()
def create_topic(data):
    """Create a new Topic"""
    if isinstance(data, str):
        data = json.loads(data)
    
    # Check if topic already exists
    if frappe.db.exists("Topic", data.get("topic_name")):
        frappe.throw(_("Topic '{0}' already exists").format(data.get("topic_name")))
    
    doc = frappe.new_doc("Topic")
    doc.topic_name = data.get("topic_name")
    doc.description = data.get("description", "")
    
    # Handle topic content if provided
    if data.get("topic_content"):
        for content in data.get("topic_content"):
            if content.get("content"):
                doc.append("topic_content", {
                    "content": content.get("content"),
                })
    
    doc.insert()
    frappe.db.commit()
    
    return doc.as_dict()

@frappe.whitelist()
def create_assessment_criteria(data):
    """Create a new Assessment Criteria"""
    if isinstance(data, str):
        data = json.loads(data)
    
    # Check if assessment criteria already exists
    if frappe.db.exists("Assessment Criteria", data.get("assessment_criteria")):
        frappe.throw(_("Assessment Criteria '{0}' already exists").format(data.get("assessment_criteria")))
    
    doc = frappe.new_doc("Assessment Criteria")
    doc.assessment_criteria = data.get("assessment_criteria")
    doc.assessment_criteria_group = data.get("assessment_criteria_group", "")
    
    doc.insert()
    frappe.db.commit()
    
    return doc.as_dict()

@frappe.whitelist()
def get_topics():
    try:
        return frappe.get_all("Topic", fields=["name", "topic_name"], order_by="topic_name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching topics: {str(e)}", "Subject API")
        return []

@frappe.whitelist()
def get_assessment_criteria():
    try:
        return frappe.get_all("Assessment Criteria", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching assessment criteria: {str(e)}", "Subject API")
        return []

# ... rest of existing methods ...