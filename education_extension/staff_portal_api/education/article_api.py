import frappe
import json
from frappe import _
from frappe.utils import cint

@frappe.whitelist()
def get_articles(
    page=1,
    page_size=20,
    search=None,
    topic=None,
):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    or_filters = []

    if topic:
        # Filter articles that are linked to this topic
        # Articles are linked to Topics through Topic Content
        # We need to find articles that appear in Topic Content
        topic_contents = frappe.get_all(
            "Topic Content",
            filters={"content": ["like", f"%{topic}%"]},
            fields=["parent"]
        )
        # This is a simplified approach - you may need to adjust based on your data model
        # Since Article doesn't have a direct link to Topic, we'll use the title field
        # Alternatively, you could use a different approach based on your data model
        pass

    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["title", "like", f"%{search}%"],
            ["author", "like", f"%{search}%"],
            ["content", "like", f"%{search}%"],
        ]

    rows = frappe.get_list(
        "Article",
        fields=[
            "name",
            "title",
            "author",
            "content",
            "publish_date",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="modified desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count(
        "Article",
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
def get_article(name):
    if not name:
        frappe.throw(_("Article name is required"))

    doc = frappe.get_doc("Article", name)
    return doc.as_dict()

@frappe.whitelist()
def create_article(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.new_doc("Article")
    
    doc.title = data.get("title")
    doc.author = data.get("author")
    doc.content = data.get("content")
    doc.publish_date = data.get("publish_date")
    
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def update_article(name, data):
    if not name:
        frappe.throw(_("Article name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Article", name)
    
    if "title" in data:
        doc.title = data.get("title")
    if "author" in data:
        doc.author = data.get("author")
    if "content" in data:
        doc.content = data.get("content")
    if "publish_date" in data:
        doc.publish_date = data.get("publish_date")
    
    doc.save()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def delete_article(name):
    if not name:
        frappe.throw(_("Article name is required"))

    frappe.delete_doc("Article", name)
    frappe.db.commit()

    return {"message": "Article deleted"}

@frappe.whitelist()
def get_topics():
    try:
        return frappe.get_list("Topic", fields=["name", "topic_name"], order_by="topic_name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching topics: {str(e)}", "Article API")
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
        frappe.log_error(f"Error getting count for {doctype}: {str(e)}", "Article API")
        return 0