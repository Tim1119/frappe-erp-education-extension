import frappe


@frappe.whitelist()
def get_academic_years():
    try:
        return frappe.get_list(
            "Academic Year", fields=["name"], order_by="name desc", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching academic years: {str(e)}", "Student Guardian Contacts API")
        return []


@frappe.whitelist()
def get_programs():
    try:
        return frappe.get_list("Program", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching classes: {str(e)}", "Student Guardian Contacts API")
        return []


@frappe.whitelist()
def get_student_batches():
    try:
        return frappe.get_list("Student Batch Name", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching batches: {str(e)}", "Student Guardian Contacts API")
        return []
