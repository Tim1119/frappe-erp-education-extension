import frappe


@frappe.whitelist()
def get_students():
    try:
        return frappe.get_all(
            "Student", fields=["name", "student_name"],
            order_by="student_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching students: {str(e)}", "Student Report Generation Tool API")
        return []


@frappe.whitelist()
def get_programs():
    try:
        return frappe.get_all("Program", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching classes: {str(e)}", "Student Report Generation Tool API")
        return []


@frappe.whitelist()
def get_student_batches():
    try:
        return frappe.get_all("Student Batch Name", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching student batches: {str(e)}", "Student Report Generation Tool API")
        return []


@frappe.whitelist()
def get_academic_years():
    try:
        return frappe.get_all(
            "Academic Year", fields=["name"], order_by="name desc", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching academic years: {str(e)}", "Student Report Generation Tool API")
        return []


@frappe.whitelist()
def get_academic_terms(academic_year=None):
    try:
        filters = {}
        if academic_year:
            filters["academic_year"] = academic_year
        return frappe.get_all(
            "Academic Term", fields=["name"], filters=filters,
            order_by="name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching academic terms: {str(e)}", "Student Report Generation Tool API")
        return []


@frappe.whitelist()
def get_group_assessment_groups():
    """Mirrors student_report_generation_tool.js's real onload
    set_query('assessment_group', ...): filters: { is_group: 1 } -- only
    parent/container groups are valid here (the opposite of Assessment
    Plan Status's leaf-only is_group: 0 filter), since preview_report_card
    expands the selection to all of its child groups server-side."""
    try:
        return frappe.get_all(
            "Assessment Group", fields=["name", "assessment_group_name"],
            filters={"is_group": 1}, order_by="assessment_group_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching assessment groups: {str(e)}", "Student Report Generation Tool API")
        return []


@frappe.whitelist()
def get_letter_heads():
    try:
        return frappe.get_all("Letter Head", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching letter heads: {str(e)}", "Student Report Generation Tool API")
        return []


@frappe.whitelist()
def get_terms_and_conditions():
    try:
        return frappe.get_all(
            "Terms and Conditions", fields=["name", "title"],
            order_by="title", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching terms and conditions: {str(e)}", "Student Report Generation Tool API")
        return []


@frappe.whitelist()
def get_terms_content(terms):
    """Mirrors the real fetch_from on assessment_terms: 'terms.terms' --
    Terms and Conditions' own "terms" field (Text Editor)."""
    if not terms:
        return ""
    try:
        return frappe.db.get_value("Terms and Conditions", terms, "terms") or ""
    except Exception as e:
        frappe.log_error(f"Error fetching terms content for {terms}: {str(e)}", "Student Report Generation Tool API")
        return ""
