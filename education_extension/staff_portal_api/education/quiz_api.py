import frappe
import json
from frappe import _
from frappe.utils import cint

# ==================== QUIZ ENDPOINTS ====================

@frappe.whitelist()
def get_quizzes(
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
            ["title", "like", f"%{search}%"],
        ]

    rows = frappe.get_all(
        "Quiz",
        fields=[
            "name",
            "title",
            "passing_score",
            "max_attempts",
            "grading_basis",
            "is_time_bound",
            "duration",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="modified desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count(
        "Quiz",
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
def get_quiz(name):
    if not name:
        frappe.throw(_("Quiz name is required"))

    doc = frappe.get_doc("Quiz", name)
    
    result = doc.as_dict()
    if result.get('question'):
        if not isinstance(result['question'], list):
            try:
                result['question'] = frappe.parse_json(result['question'])
            except:
                result['question'] = []
    else:
        result['question'] = []
    
    return result

@frappe.whitelist()
def create_quiz(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.new_doc("Quiz")
    
    doc.title = data.get("title")
    doc.passing_score = data.get("passing_score", 75)
    doc.max_attempts = data.get("max_attempts", 1)
    doc.grading_basis = data.get("grading_basis", "Latest Highest Score")
    doc.is_time_bound = data.get("is_time_bound", 0)
    
    # Handle duration - store as number (seconds)
    duration = data.get("duration", 0)
    if duration:
        doc.duration = int(duration)
    else:
        doc.duration = 0
    
    # Add questions
    if data.get("question"):
        for question_entry in data.get("question"):
            if question_entry.get("question_link"):
                doc.append("question", {
                    "question_link": question_entry.get("question_link"),
                    "question": question_entry.get("question"),
                })
    
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def update_quiz(name, data):
    if not name:
        frappe.throw(_("Quiz name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Quiz", name)
    
    if "title" in data:
        doc.title = data.get("title")
    if "passing_score" in data:
        doc.passing_score = data.get("passing_score")
    if "max_attempts" in data:
        doc.max_attempts = data.get("max_attempts")
    if "grading_basis" in data:
        doc.grading_basis = data.get("grading_basis")
    if "is_time_bound" in data:
        doc.is_time_bound = data.get("is_time_bound", 0)
    
    # Handle duration - store as number (seconds)
    if "duration" in data:
        duration = data.get("duration", 0)
        if duration:
            doc.duration = int(duration)
        else:
            doc.duration = 0
    
    # Update questions
    if "question" in data:
        doc.set("question", [])
        for question_entry in data.get("question", []):
            if question_entry.get("question_link"):
                doc.append("question", {
                    "question_link": question_entry.get("question_link"),
                    "question": question_entry.get("question"),
                })
    
    doc.save()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def delete_quiz(name):
    if not name:
        frappe.throw(_("Quiz name is required"))

    frappe.delete_doc("Quiz", name)
    frappe.db.commit()

    return {"message": "Quiz deleted"}


# ==================== QUESTION ENDPOINTS ====================

@frappe.whitelist()
def get_questions():
    """Get all questions for dropdown"""
    try:
        return frappe.get_all(
            "Question",
            fields=["name", "question"],
            order_by="name",
            limit_page_length=500
        )
    except Exception as e:
        frappe.log_error(f"Error fetching questions: {str(e)}", "Quiz API")
        return []

@frappe.whitelist()
def get_question(name):
    if not name:
        frappe.throw(_("Question name is required"))

    doc = frappe.get_doc("Question", name)
    
    result = doc.as_dict()
    if result.get('options'):
        if not isinstance(result['options'], list):
            try:
                result['options'] = frappe.parse_json(result['options'])
            except:
                result['options'] = []
    else:
        result['options'] = []
    
    return result

@frappe.whitelist()
def create_question(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.new_doc("Question")
    
    doc.question = data.get("question")
    
    # Add options
    if data.get("options"):
        for option_entry in data.get("options"):
            if option_entry.get("option"):
                doc.append("options", {
                    "option": option_entry.get("option"),
                    "is_correct": option_entry.get("is_correct", 0),
                })
    
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def update_question(name, data):
    if not name:
        frappe.throw(_("Question name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Question", name)
    
    if "question" in data:
        doc.question = data.get("question")
    
    # Update options
    if "options" in data:
        doc.set("options", [])
        for option_entry in data.get("options", []):
            if option_entry.get("option"):
                doc.append("options", {
                    "option": option_entry.get("option"),
                    "is_correct": option_entry.get("is_correct", 0),
                })
    
    doc.save()
    frappe.db.commit()

    return doc.as_dict()

@frappe.whitelist()
def delete_question(name):
    if not name:
        frappe.throw(_("Question name is required"))

    frappe.delete_doc("Question", name)
    frappe.db.commit()

    return {"message": "Question deleted"}

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
        frappe.log_error(f"Error getting count for {doctype}: {str(e)}", "Quiz API")
        return 0