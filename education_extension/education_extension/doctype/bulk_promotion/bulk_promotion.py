# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import getdate

# Try the new import first, fallback to old import for compatibility
try:
    from hrms.hr.utils import validate_active_employee
except ImportError:
    from erpnext.hr.utils import validate_active_employee


class BulkPromotion(Document):
    def validate(self):
        if not self.grade:
            frappe.throw(_("Please select the current Grade."))
        if not self.new_grade:
            frappe.throw(_("Please select the New Grade."))
        if self.new_grade == self.grade:
            frappe.throw(_("New Grade must be different from Current Grade."))
        if not self.employees:
            frappe.throw(_("Please select at least one employee to promote."))

    def before_submit(self):
        if getdate(self.promotion_date) > getdate():
            frappe.throw(
                _("Bulk Promotion cannot be submitted before the Promotion Date"),
                frappe.DocstatusTransitionError,
            )

    def on_submit(self):
        success_log = []
        error_log = []

        for emp in self.employees:
            try:
                # Validate employee status
                validate_active_employee(emp.employee)

                # Get employee details using db query (doesn't lock the document)
                employee_company = emp.company or frappe.db.get_value("Employee", emp.employee, "company")
                employee_ctc = emp.current_ctc or frappe.db.get_value("Employee", emp.employee, "ctc")

                # Create Employee Promotion document
                promotion = frappe.new_doc("Employee Promotion")
                promotion.employee = emp.employee
                promotion.promotion_date = self.promotion_date
                promotion.company = employee_company
                promotion.current_ctc = employee_ctc
                promotion.revised_ctc = emp.revised_ctc or None

                # Add promotion details as a child table row
                promotion.append("promotion_details", {
                    "fieldname": "grade",
                    "current": self.grade,
                    "new": self.new_grade
                })

                promotion.insert(ignore_permissions=True)
                
                # Submit the promotion - this will automatically update the employee
                # via the Employee Promotion's on_submit method
                promotion.submit()

                # Commit after each promotion to avoid conflicts
                frappe.db.commit()

                success_log.append("{0} promoted to {1}".format(emp.employee_name or emp.employee, self.new_grade))

            except Exception as e:
                frappe.db.rollback()
                error_log.append("{0}: {1}".format(emp.employee_name or emp.employee, str(e)))

        # Display summary message
        message = ""
        if success_log:
            message += "<b>Successful Promotions:</b><br>" + "<br>".join(success_log) + "<br><br>"
        if error_log:
            message += "<b>Failed Promotions:</b><br>" + "<br>".join(error_log)

        if message:
            frappe.msgprint(message, title="Bulk Promotion Results", indicator="green" if not error_log else "orange")


@frappe.whitelist()
def get_employees_by_grade(grade):
    """Return active employees currently in the selected grade."""
    employees = frappe.get_all(
        "Employee",
        filters={"grade": grade, "status": "Active"},
        fields=["name", "employee_name", "department", "grade", "company", "ctc"]
    )
    return employees