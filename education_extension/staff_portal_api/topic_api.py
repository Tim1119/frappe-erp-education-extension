import frappe
import json
from frappe import _
from frappe.utils import cint

@frappe.whitelist()
def get_topics(
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
            ["topic_name", "like", f"%{search}%"],
            ["description", "like", f"%{search}%"],
        ]

    rows = frappe.get_all(
        "Topic",
        fields=[
            "name",
            "topic_name",
            "description",
            "hero_image",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="modified desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count(
        "Topic",
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
def get_topic(name):
    if not name:
        frappe.throw(_("Topic name is required"))

    doc = frappe.get_doc("Topic", name)
    
    result = doc.as_dict()
    if result.get('topic_content'):
        if not isinstance(result['topic_content'], list):
            try:
                result['topic_content'] = frappe.parse_json(result['topic_content'])
            except:
                result['topic_content'] = []
    else:
        result['topic_content'] = []
    
    return result

@frappe.whitelist()
def create_topic(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.new_doc("Topic")
    
    doc.topic_name = data.get("topic_name")
    doc.description = data.get("description", "")
    
    if data.get("hero_image"):
        doc.hero_image = data.get("hero_image")
    
    # Add topic content
    if data.get("topic_content"):
        for content_entry in data.get("topic_content"):
            if content_entry.get("content_type") and content_entry.get("content"):
                doc.append("topic_content", {
                    "content_type": content_entry.get("content_type"),
                    "content": content_entry.get("content"),
                })
    
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def update_topic(name, data):
    if not name:
        frappe.throw(_("Topic name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Topic", name)
    
    if "topic_name" in data:
        doc.topic_name = data.get("topic_name")
    if "description" in data:
        doc.description = data.get("description")
    if "hero_image" in data:
        doc.hero_image = data.get("hero_image")
    
    # Update topic content - clear and re-add
    if "topic_content" in data:
        # Clear existing content
        doc.set("topic_content", [])
        # Add new content entries
        for content_entry in data.get("topic_content", []):
            if content_entry.get("content_type") and content_entry.get("content"):
                doc.append("topic_content", {
                    "content_type": content_entry.get("content_type"),
                    "content": content_entry.get("content"),
                })
    
    doc.save()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def delete_topic(name):
    if not name:
        frappe.throw(_("Topic name is required"))

    frappe.delete_doc("Topic", name)
    frappe.db.commit()

    return {"message": "Topic deleted"}

@frappe.whitelist()
def get_courses_without_topic(topic):
    """Get courses that don't have this topic"""
    try:
        from education.education.doctype.topic.topic import get_courses_without_topic
        return get_courses_without_topic(topic)
    except Exception as e:
        frappe.log_error(f"Error getting courses without topic: {str(e)}", "Topic API")
        return []

@frappe.whitelist()
def add_topic_to_courses(topic, courses):
    """Add topic to selected courses"""
    try:
        from education.education.doctype.topic.topic import add_topic_to_courses
        return add_topic_to_courses(topic, courses)
    except Exception as e:
        frappe.log_error(f"Error adding topic to courses: {str(e)}", "Topic API")
        frappe.throw(_("Error adding topic to courses: {0}").format(str(e)))

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
        frappe.log_error(f"Error getting count for {doctype}: {str(e)}", "Topic API")
        return 0