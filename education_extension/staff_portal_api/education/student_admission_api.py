import frappe
import json
from frappe import _
from frappe.utils import cint, today


@frappe.whitelist()
def get_student_admissions(
    page=1,
    page_size=20,
    search=None,
    class_name=None,
    academic_year=None,
):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    or_filters = []

    if class_name:
        admissions_with_program = frappe.get_all(
            "Student Admission Program",
            filters={"program": class_name, "parenttype": "Student Admission"},
            fields=["parent"],
        )
        admission_names = [a.parent for a in admissions_with_program]
        if admission_names:
            filters["name"] = ["in", admission_names]
        else:
            return {"rows": [], "count": 0, "page": page, "page_size": page_size, "total_pages": 0}

    if academic_year:
        filters["academic_year"] = academic_year

    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["title", "like", f"%{search}%"],
            ["academic_year", "like", f"%{search}%"],
        ]

    rows = frappe.get_all(
        "Student Admission",
        fields=[
            "name",
            "title",
            "route",
            "published",
            "enable_admission_application",
            "academic_year",
            "admission_start_date",
            "admission_end_date",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="modified desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    # attach program list for display
    for row in rows:
        programs = frappe.get_all(
            "Student Admission Program",
            filters={"parent": row.name, "parenttype": "Student Admission"},
            fields=["program"],
            order_by="idx",
        )
        row.programs = [p.program for p in programs if p.program]
        row.program = ", ".join(row.programs) if row.programs else ""

    total = frappe.db.count("Student Admission", filters=filters)

    return {
        "rows": rows,
        "count": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size else 1,
    }


@frappe.whitelist()
def get_student_admission(name):
    if not name:
        frappe.throw(_("Student Admission name is required"))

    doc = frappe.get_doc("Student Admission", name)
    result = doc.as_dict()

    if result.get("program_details"):
        if not isinstance(result["program_details"], list):
            try:
                result["program_details"] = frappe.parse_json(result["program_details"])
            except Exception:
                result["program_details"] = []
    else:
        result["program_details"] = []

    if result["program_details"]:
        result["program"] = result["program_details"][0].get("program", "")

    return result


@frappe.whitelist()
def create_student_admission(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.new_doc("Student Admission")

    doc.title = data.get("title")
    doc.academic_year = data.get("academic_year")
    doc.admission_start_date = data.get("admission_start_date")
    doc.admission_end_date = data.get("admission_end_date")
    doc.published = data.get("published", 0)
    doc.enable_admission_application = data.get("enable_admission_application", 0)
    doc.introduction = data.get("introduction")

    if data.get("program_details"):
        for entry in data.get("program_details"):
            if entry.get("program"):
                doc.append("program_details", {
                    "program": entry.get("program"),
                    "applicant_naming_series": entry.get("applicant_naming_series"),
                    "min_age": entry.get("min_age") or None,
                    "max_age": entry.get("max_age") or None,
                    "application_fee": entry.get("application_fee") or None,
                    "description": entry.get("description"),
                })

    doc.insert()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def update_student_admission(name, data):
    if not name:
        frappe.throw(_("Student Admission name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Student Admission", name)

    if "title" in data:
        doc.title = data.get("title")
    if "academic_year" in data:
        doc.academic_year = data.get("academic_year")
    if "admission_start_date" in data:
        doc.admission_start_date = data.get("admission_start_date")
    if "admission_end_date" in data:
        doc.admission_end_date = data.get("admission_end_date")
    if "published" in data:
        doc.published = data.get("published", 0)
    if "enable_admission_application" in data:
        doc.enable_admission_application = data.get("enable_admission_application", 0)
    if "introduction" in data:
        doc.introduction = data.get("introduction")

    if "program_details" in data:
        doc.set("program_details", [])
        for entry in data.get("program_details", []):
            if entry.get("program"):
                doc.append("program_details", {
                    "program": entry.get("program"),
                    "applicant_naming_series": entry.get("applicant_naming_series"),
                    "min_age": entry.get("min_age") or None,
                    "max_age": entry.get("max_age") or None,
                    "application_fee": entry.get("application_fee") or None,
                    "description": entry.get("description"),
                })

    doc.save()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def delete_student_admission(name):
    if not name:
        frappe.throw(_("Student Admission name is required"))

    frappe.delete_doc("Student Admission", name)
    frappe.db.commit()

    return {"message": "Student Admission deleted"}


@frappe.whitelist()
def get_programs():
    try:
        return frappe.get_all("Program", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching programs: {str(e)}", "Student Admission API")
        return []


@frappe.whitelist()
def get_academic_years():
    try:
        return frappe.get_all("Academic Year", fields=["name"], order_by="name desc", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching academic years: {str(e)}", "Student Admission API")
        return []


@frappe.whitelist()
def create_academic_year(data):
    if isinstance(data, str):
        data = json.loads(data)

    if frappe.db.exists("Academic Year", data.get("academic_year_name")):
        frappe.throw(_("Academic Year '{0}' already exists").format(data.get("academic_year_name")))

    doc = frappe.new_doc("Academic Year")
    doc.academic_year_name = data.get("academic_year_name")
    doc.year_start_date = data.get("year_start_date")
    doc.year_end_date = data.get("year_end_date")
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def get_doctype_count(doctype, filters=None):
    try:
        if filters:
            if isinstance(filters, str):
                filters = json.loads(filters)
            return frappe.db.count(doctype, filters=filters)
        return frappe.db.count(doctype)
    except Exception as e:
        frappe.log_error(f"Error getting count for {doctype}: {str(e)}", "Student Admission API")
        return 0