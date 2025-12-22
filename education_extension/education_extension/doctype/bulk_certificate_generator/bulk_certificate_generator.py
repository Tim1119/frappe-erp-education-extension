# Copyright (c) 2025, Your Organization and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class BulkCertificateGenerator(Document):
    def validate(self):
        # Validate that at least one student is selected
        if not any(student.select for student in self.students):
            frappe.throw("Please select at least one student to generate certificates")
    
    def on_submit(self):
        # Mark certificates as generated for selected students
        self.mark_certificates_generated()
    
    def mark_certificates_generated(self):
        """Mark certificates as generated for all selected students"""
        generated_count = 0
        for student in self.students:
            if student.select and not student.certificate_generated:
                # Update using db_set to bypass submit restrictions
                frappe.db.set_value("Bulk Certificate Student", student.name, {
                    "certificate_generated": 1,
                    "certificate_link": self.name
                })
                
                generated_count += 1
        
        if generated_count > 0:
            frappe.msgprint(f"Certificates marked as generated for {generated_count} student(s)", 
                           alert=True, indicator="green")
        else:
            frappe.msgprint("No new certificates to generate", alert=True, indicator="orange")

@frappe.whitelist()
def get_students(class_arm):
    """Fetch all students from the selected class/student group"""
    if not class_arm:
        return []
    
    # Get all students from the student group
    students = frappe.db.sql("""
        SELECT 
            sgm.student,
            s.student_name,
            s.name as student_id
        FROM 
            `tabStudent Group Student` sgm
        INNER JOIN 
            `tabStudent` s ON sgm.student = s.name
        WHERE 
            sgm.parent = %s
            AND sgm.active = 1
        ORDER BY 
            s.student_name
    """, class_arm, as_dict=True)
    
    return students