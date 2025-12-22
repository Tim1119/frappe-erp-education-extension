# Copyright (c) 2024, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class ClubMember(Document):
	def before_insert(self):
		"""Set the student's current class arm and student name"""
		self.set_student_details()
	
	def validate(self):
		"""Update class arm and student name if student changes"""
		if self.has_value_changed('student'):
			self.set_student_details()
	
	def set_student_details(self):
		"""Fetch and set the student's name and current class arm (Student Group)"""
		if self.student:
			# Get student details
			student_doc = frappe.get_doc("Student", self.student)
			
			# Set student name
			if hasattr(student_doc, 'student_name') and student_doc.student_name:
				self.student_name = student_doc.student_name
			elif hasattr(student_doc, 'first_name'):
				# Construct full name from first_name, middle_name, last_name
				name_parts = []
				if student_doc.first_name:
					name_parts.append(student_doc.first_name)
				if hasattr(student_doc, 'middle_name') and student_doc.middle_name:
					name_parts.append(student_doc.middle_name)
				if hasattr(student_doc, 'last_name') and student_doc.last_name:
					name_parts.append(student_doc.last_name)
				self.student_name = ' '.join(name_parts)
			
			# Get the academic year from parent School Club
			parent_doc = frappe.get_doc("School Club", self.parent)
			academic_year = parent_doc.academic_year
			
			# Find the student's current class arm for this academic year
			class_arm = frappe.db.sql("""
				SELECT sg.name
				FROM `tabStudent Group` sg
				JOIN `tabStudent Group Student` sgs ON sgs.parent = sg.name
				WHERE sgs.student = %s
				AND sg.academic_year = %s
				AND sg.group_based_on = 'Batch'
				AND sgs.active = 1
				ORDER BY sg.creation DESC
				LIMIT 1
			""", (self.student, academic_year), as_dict=True)
			
			if class_arm:
				self.class_arm = class_arm[0].name
			else:
				# If no class arm found, try without academic year filter
				class_arm = frappe.db.sql("""
					SELECT sg.name
					FROM `tabStudent Group` sg
					JOIN `tabStudent Group Student` sgs ON sgs.parent = sg.name
					WHERE sgs.student = %s
					AND sg.group_based_on = 'Batch'
					AND sgs.active = 1
					ORDER BY sg.creation DESC
					LIMIT 1
				""", (self.student,), as_dict=True)
				
				if class_arm:
					self.class_arm = class_arm[0].name
				else:
					self.class_arm = None