# school_term_result.py
import frappe
from frappe.model.document import Document
from education_extension.education_extension.school_term_result_utils import populate_student_result
class SchoolTermResult(Document):
    """
    School Term Result Document
    Handles individual result creation with automatic population of:
    - Student info, attendance, class stats, grades, positions
    
    Uses reusable populate_student_result() from utils
    """
    
    def before_insert(self):
        """Called before document is inserted into database"""
        self.validate_before_populate()
        populate_student_result(self)
    
    def validate(self):
        """Called on save/submit"""
        # Any additional validations beyond what populate_student_result does
        pass
    
    def validate_before_populate(self):
        """Pre-population validation"""
        if not (self.student and self.assessment_group and self.academic_year and self.academic_term):
            frappe.throw("Student, Assessment Group, Academic Year, and Academic Term are required.")