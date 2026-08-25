import frappe
import json
import re
from frappe import _
from frappe.utils import cint

@frappe.whitelist()
def get_videos(
    page=1,
    page_size=20,
    search=None,
    provider=None,
):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    or_filters = []

    if provider:
        filters["provider"] = provider

    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["title", "like", f"%{search}%"],
            ["description", "like", f"%{search}%"],
            ["url", "like", f"%{search}%"],
        ]

    rows = frappe.get_list(
        "Video",
        fields=[
            "name",
            "title",
            "provider",
            "url",
            "publish_date",
            "duration",
            "like_count",
            "view_count",
            "comment_count",
            "image",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="modified desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count(
        "Video",
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
def get_video(name):
    if not name:
        frappe.throw(_("Video name is required"))

    doc = frappe.get_doc("Video", name)
    return doc.as_dict()

@frappe.whitelist()
def create_video(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.new_doc("Video")
    
    doc.title = data.get("title")
    doc.provider = data.get("provider")
    doc.url = data.get("url")
    doc.publish_date = data.get("publish_date")
    doc.description = data.get("description")
    
    # Duration - store as number (seconds)
    duration = data.get("duration")
    if duration:
        doc.duration = int(duration) if str(duration).isdigit() else 0
    else:
        doc.duration = 0
    
    # Extract YouTube video ID if provider is YouTube
    if doc.provider == "YouTube" and doc.url:
        doc.youtube_video_id = get_id_from_url(doc.url)
    
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def update_video(name, data):
    if not name:
        frappe.throw(_("Video name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Video", name)
    
    if "title" in data:
        doc.title = data.get("title")
    if "provider" in data:
        doc.provider = data.get("provider")
    if "url" in data:
        doc.url = data.get("url")
        if doc.provider == "YouTube":
            doc.youtube_video_id = get_id_from_url(doc.url)
    if "publish_date" in data:
        doc.publish_date = data.get("publish_date")
    if "description" in data:
        doc.description = data.get("description")
    
    # Duration - store as number (seconds)
    if "duration" in data:
        duration = data.get("duration")
        if duration:
            doc.duration = int(duration) if str(duration).isdigit() else 0
        else:
            doc.duration = 0
    
    doc.save()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def delete_video(name):
    if not name:
        frappe.throw(_("Video name is required"))

    frappe.delete_doc("Video", name)
    frappe.db.commit()

    return {"message": "Video deleted"}

@frappe.whitelist()
def get_video_providers():
    """Get all video providers for dropdown"""
    try:
        providers = frappe.db.sql("""
            SELECT DISTINCT provider 
            FROM `tabVideo` 
            WHERE provider IS NOT NULL AND provider != ''
            ORDER BY provider
        """, as_dict=True)
        return providers
    except Exception as e:
        frappe.log_error(f"Error fetching video providers: {str(e)}", "Video API")
        return []

@frappe.whitelist()
def get_id_from_url(url):
    """
    Returns video id from url
    :param url: String URL
    """
    if not isinstance(url, str):
        frappe.throw(_("URL can only be a string"), title=_("Invalid URL"))

    pattern = re.compile(r'[a-z\:\//\.]+(youtube|youtu)\.(com|be)/(watch\?v=|embed/|.+\?v=)?([^"&?\s]{11})?')
    match = pattern.match(url)
    if match:
        return match.groups()[-1]
    return ""

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
        frappe.log_error(f"Error getting count for {doctype}: {str(e)}", "Video API")
        return 0