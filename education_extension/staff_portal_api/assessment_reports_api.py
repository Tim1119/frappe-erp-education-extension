import frappe


@frappe.whitelist()
def get_academic_years():
    try:
        return frappe.get_all(
            "Academic Year", fields=["name"], order_by="name desc", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching academic years: {str(e)}", "Assessment Reports API")
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
        frappe.log_error(f"Error fetching academic terms: {str(e)}", "Assessment Reports API")
        return []


@frappe.whitelist()
def get_courses():
    try:
        return frappe.get_all(
            "Course", fields=["name", "course_name"],
            order_by="course_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching subjects: {str(e)}", "Assessment Reports API")
        return []


@frappe.whitelist()
def get_student_groups():
    try:
        return frappe.get_all(
            "Student Group", fields=["name", "student_group_name"],
            order_by="student_group_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching class arms: {str(e)}", "Assessment Reports API")
        return []


@frappe.whitelist()
def get_batch_student_groups(academic_year=None):
    """Mirrors final_assessment_grades.js's real get_query on student_group:
    filters: { group_based_on: 'Batch', academic_year: <selected> }. Only
    Batch-based Class Arms are valid here -- Course/Activity-based groups
    are not offered, matching the real Desk filter exactly."""
    try:
        filters = {"group_based_on": "Batch"}
        if academic_year:
            filters["academic_year"] = academic_year
        return frappe.get_all(
            "Student Group", fields=["name", "student_group_name"],
            filters=filters, order_by="student_group_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching batch class arms: {str(e)}", "Assessment Reports API")
        return []


@frappe.whitelist()
def get_assessment_groups():
    try:
        return frappe.get_all(
            "Assessment Group", fields=["name", "assessment_group_name", "is_group"],
            order_by="lft", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching assessment groups: {str(e)}", "Assessment Reports API")
        return []


@frappe.whitelist()
def get_leaf_assessment_groups():
    """Mirrors assessment_plan_status.js's real get_query on
    assessment_group: filters: { is_group: 0 } -- only leaf (non-container)
    groups are valid here."""
    try:
        return frappe.get_all(
            "Assessment Group", fields=["name", "assessment_group_name"],
            filters={"is_group": 0}, order_by="assessment_group_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching leaf assessment groups: {str(e)}", "Assessment Reports API")
        return []
