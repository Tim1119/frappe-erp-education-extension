import frappe


@frappe.whitelist()
def get_years():
    """Reuses the report's own already-whitelisted get_year_list() --
    the real distinct years present in actual Student Attendance data
    (frappe.db.get_list("Student Attendance", pluck="date")), not a
    generic "past N years" list."""
    from education.education.report.student_monthly_attendance_sheet.student_monthly_attendance_sheet import (
        get_year_list,
    )

    try:
        return get_year_list() or []
    except Exception as e:
        frappe.log_error(f"Error fetching attendance years: {str(e)}", "Student Monthly Attendance Sheet API")
        return []


@frappe.whitelist()
def get_student_groups():
    try:
        return frappe.get_list(
            "Student Group", fields=["name", "student_group_name"],
            order_by="student_group_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching class arms: {str(e)}", "Student Monthly Attendance Sheet API")
        return []
