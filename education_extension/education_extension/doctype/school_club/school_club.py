# Copyright (c) 2024, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe import _

class SchoolClub(Document):
	def validate(self):
		self.validate_instructors()
		self.validate_primary_instructor()
		self.validate_duplicate_instructors()
		self.validate_instructor_already_in_club()
		self.validate_duplicate_students()
		self.validate_student_already_in_club()
	
	def autoname(self):
		"""Set the document name to include club name and academic year"""
		if not self.club_name or not self.academic_year:
			frappe.throw(_("Club Name and Academic Year must be set before saving"))

		club_name_clean = self.club_name.upper().replace(" ", "-")
		year_clean = str(self.academic_year).replace(" ", "")

		base_name = f"{club_name_clean}-{year_clean}"
		name = base_name
		counter = 1

		while frappe.db.exists("School Club", name):
			counter += 1
			name = f"{base_name}-{counter}"

		self.name = name

	def validate_instructors(self):
		"""Ensure at least one instructor is assigned"""
		if not self.club_instructors or len(self.club_instructors) == 0:
			frappe.throw(_("Please assign at least one Instructor/Teacher to this club"))
	
	def validate_primary_instructor(self):
		"""Ensure exactly one primary instructor is designated"""
		primary_count = sum(1 for instructor in self.club_instructors if instructor.is_primary)
		
		if primary_count == 0:
			frappe.throw(_("Please designate one instructor as Primary Instructor (In-Charge)"))
		elif primary_count > 1:
			frappe.throw(_("Only one instructor can be designated as Primary Instructor (In-Charge)"))
	
	def validate_duplicate_instructors(self):
		"""Ensure no duplicate instructors in the same club"""
		instructors = []
		for instructor in self.club_instructors:
			if instructor.instructor in instructors:
				frappe.throw(_(f"Instructor {instructor.instructor} is added multiple times in this club"))
			instructors.append(instructor.instructor)
	
	def validate_instructor_already_in_club(self):
		"""Ensure instructor isn't already in another club for same academic year"""
		for instructor in self.club_instructors:
			existing = frappe.db.sql("""
				SELECT sc.name, sc.club_name 
				FROM `tabSchool Club` sc
				JOIN `tabClub Instructor` ci ON ci.parent = sc.name
				WHERE ci.instructor = %s 
				AND sc.academic_year = %s
				AND sc.name != %s
				AND sc.docstatus < 2
			""", (instructor.instructor, self.academic_year, self.name or 'new'))
			
			if existing:
				frappe.throw(_(
					f"Instructor {instructor.instructor} is already assigned to club '{existing[0][1]}' "
					f"(ID: {existing[0][0]}) for Academic Year {self.academic_year}. "
					f"An instructor can only be assigned to one club per academic year."
				))
	
	def validate_duplicate_students(self):
		"""Ensure no duplicate students in the same club"""
		students = []
		for member in self.club_members:
			if member.student in students:
				frappe.throw(_(f"Student {member.student} is added multiple times in this club"))
			students.append(member.student)
	
	def validate_student_already_in_club(self):
		"""Ensure student isn't already in another club for same academic year"""
		for member in self.club_members:
			existing = frappe.db.sql("""
				SELECT sc.name, sc.club_name 
				FROM `tabSchool Club` sc
				JOIN `tabClub Member` cm ON cm.parent = sc.name
				WHERE cm.student = %s 
				AND sc.academic_year = %s
				AND sc.name != %s
				AND sc.docstatus < 2
				AND cm.status = 'Active'
			""", (member.student, self.academic_year, self.name or 'new'))
			
			if existing:
				frappe.throw(_(
					f"Student {member.student} is already enrolled in club '{existing[0][1]}' "
					f"(ID: {existing[0][0]}) for Academic Year {self.academic_year}. "
					f"A student can only join one club per academic year."
				))


# ========== STUDENT METHODS ==========

@frappe.whitelist()
def get_available_students(academic_year, current_club=None):
	"""Get students who are not enrolled in any club for the specified academic year"""
	if not academic_year:
		return []
	
	students_in_clubs = frappe.db.sql("""
		SELECT DISTINCT cm.student
		FROM `tabSchool Club` sc
		JOIN `tabClub Member` cm ON cm.parent = sc.name
		WHERE sc.academic_year = %s
		AND sc.docstatus < 2
		AND cm.status = 'Active'
		AND (sc.name != %s OR %s IS NULL)
	""", (academic_year, current_club, current_club), as_dict=False)
	
	excluded_students = [s[0] for s in students_in_clubs] if students_in_clubs else []
	
	filters = {'enabled': 1}
	if excluded_students:
		filters['name'] = ['not in', excluded_students]
	
	available_students = frappe.get_all(
		'Student',
		filters=filters,
		fields=['name', 'student_name', 'student_email_id'],
		order_by='student_name'
	)
	
	# Add class arm information to each student
	for student in available_students:
		student['class_arm'] = get_student_class_arm(student['name'], academic_year)
	
	return available_students


@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def get_available_students_query(doctype, txt, searchfield, start, page_len, filters):
	"""Custom query for student link field in Club Member child table"""
	academic_year = filters.get('academic_year')
	current_club = filters.get('current_club')
	selected_students = filters.get('selected_students', [])
	
	# Handle string input from filters
	if isinstance(selected_students, str):
		import json
		try:
			selected_students = json.loads(selected_students)
		except:
			selected_students = []
	
	if not academic_year:
		return []
	
	# Get students already in clubs for this academic year
	students_in_clubs = frappe.db.sql("""
		SELECT DISTINCT cm.student
		FROM `tabSchool Club` sc
		JOIN `tabClub Member` cm ON cm.parent = sc.name
		WHERE sc.academic_year = %s
		AND sc.docstatus < 2
		AND cm.status = 'Active'
		AND (sc.name != %s OR %s IS NULL)
	""", (academic_year, current_club, current_club), as_dict=False)
	
	excluded = [s[0] for s in students_in_clubs] if students_in_clubs else []
	
	# Add currently selected students to exclusion list
	if selected_students:
		excluded.extend(selected_students)
	
	# Remove duplicates
	excluded = list(set(excluded))
	
	# Build the base conditions
	conditions = ["enabled = 1"]
	params = []
	
	# Add text search condition
	if txt:
		conditions.append("(name LIKE %s OR student_name LIKE %s)")
		params.extend([f'%{txt}%', f'%{txt}%'])
	
	# Add exclusion condition
	if excluded:
		placeholders = ', '.join(['%s'] * len(excluded))
		conditions.append(f"name NOT IN ({placeholders})")
		params.extend(excluded)
	
	# Build final query
	query = f"""
		SELECT name, student_name, student_email_id
		FROM `tabStudent`
		WHERE {' AND '.join(conditions)}
		ORDER BY student_name
		LIMIT %s, %s
	"""
	
	# Add pagination parameters
	params.extend([start, page_len])
	
	return frappe.db.sql(query, tuple(params))


@frappe.whitelist()
def check_student_eligibility(student, academic_year, current_club=None):
	"""Check if a student is eligible to join a club"""
	existing = frappe.db.sql("""
		SELECT sc.name, sc.club_name 
		FROM `tabSchool Club` sc
		JOIN `tabClub Member` cm ON cm.parent = sc.name
		WHERE cm.student = %s 
		AND sc.academic_year = %s
		AND sc.docstatus < 2
		AND cm.status = 'Active'
		AND (sc.name != %s OR %s IS NULL)
	""", (student, academic_year, current_club, current_club), as_dict=True)
	
	if existing:
		return {
			'eligible': False,
			'message': f"Student is already enrolled in '{existing[0].club_name}' for this academic year"
		}
	
	return {'eligible': True, 'message': 'Student is eligible to join this club'}


@frappe.whitelist()
def get_student_class_arm(student, academic_year):
	"""Get the student's current class arm (Student Group) for the academic year"""
	if not student:
		return None
	
	# Find the student's current class arm for this academic year
	class_arm = frappe.db.sql("""
		SELECT sg.name, sg.student_group_name
		FROM `tabStudent Group` sg
		JOIN `tabStudent Group Student` sgs ON sgs.parent = sg.name
		WHERE sgs.student = %s
		AND sg.academic_year = %s
		AND sg.group_based_on = 'Batch'
		AND sgs.active = 1
		ORDER BY sg.creation DESC
		LIMIT 1
	""", (student, academic_year), as_dict=True)
	
	if class_arm:
		return class_arm[0].name
	
	# If no class arm found for this academic year, try without academic year filter
	class_arm = frappe.db.sql("""
		SELECT sg.name, sg.student_group_name
		FROM `tabStudent Group` sg
		JOIN `tabStudent Group Student` sgs ON sgs.parent = sg.name
		WHERE sgs.student = %s
		AND sg.group_based_on = 'Batch'
		AND sgs.active = 1
		ORDER BY sg.creation DESC
		LIMIT 1
	""", (student,), as_dict=True)
	
	if class_arm:
		return class_arm[0].name
	
	return None


# ========== INSTRUCTOR METHODS ==========

@frappe.whitelist()
def get_available_instructors(academic_year, current_club=None):
	"""Get instructors who are not assigned to any club for the specified academic year"""
	if not academic_year:
		return []
	
	instructors_in_clubs = frappe.db.sql("""
		SELECT DISTINCT ci.instructor
		FROM `tabSchool Club` sc
		JOIN `tabClub Instructor` ci ON ci.parent = sc.name
		WHERE sc.academic_year = %s
		AND sc.docstatus < 2
		AND (sc.name != %s OR %s IS NULL)
	""", (academic_year, current_club, current_club), as_dict=False)
	
	excluded_instructors = [i[0] for i in instructors_in_clubs] if instructors_in_clubs else []
	
	filters = {'status': 'Active'}
	if excluded_instructors:
		filters['name'] = ['not in', excluded_instructors]
	
	available_instructors = frappe.get_all(
		'Instructor',
		filters=filters,
		fields=['name', 'instructor_name', 'department'],
		order_by='instructor_name'
	)
	
	return available_instructors


@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def get_available_instructors_query(doctype, txt, searchfield, start, page_len, filters):
	"""Custom query for instructor link field in Club Instructor child table"""
	academic_year = filters.get('academic_year')
	current_club = filters.get('current_club')
	selected_instructors = filters.get('selected_instructors', [])
	
	# Handle string input from filters
	if isinstance(selected_instructors, str):
		import json
		try:
			selected_instructors = json.loads(selected_instructors)
		except:
			selected_instructors = []
	
	if not academic_year:
		return []
	
	instructors_in_clubs = frappe.db.sql("""
		SELECT DISTINCT ci.instructor
		FROM `tabSchool Club` sc
		JOIN `tabClub Instructor` ci ON ci.parent = sc.name
		WHERE sc.academic_year = %s
		AND sc.docstatus < 2
		AND (sc.name != %s OR %s IS NULL)
	""", (academic_year, current_club, current_club), as_dict=False)
	
	excluded = [i[0] for i in instructors_in_clubs] if instructors_in_clubs else []
	
	# Add currently selected instructors to exclusion list
	if selected_instructors:
		excluded.extend(selected_instructors)
	
	# Remove duplicates
	excluded = list(set(excluded))
	
	# Build the base conditions
	conditions = ["status = 'Active'"]
	params = []
	
	# Add text search condition
	if txt:
		conditions.append("(name LIKE %s OR instructor_name LIKE %s)")
		params.extend([f'%{txt}%', f'%{txt}%'])
	
	# Add exclusion condition
	if excluded:
		placeholders = ', '.join(['%s'] * len(excluded))
		conditions.append(f"name NOT IN ({placeholders})")
		params.extend(excluded)
	
	# Build final query
	query = f"""
		SELECT name, instructor_name, department
		FROM `tabInstructor`
		WHERE {' AND '.join(conditions)}
		ORDER BY instructor_name
		LIMIT %s, %s
	"""
	
	# Add pagination parameters
	params.extend([start, page_len])
	
	return frappe.db.sql(query, tuple(params))


@frappe.whitelist()
def check_instructor_eligibility(instructor, academic_year, current_club=None):
	"""Check if an instructor is eligible to be assigned to a club"""
	existing = frappe.db.sql("""
		SELECT sc.name, sc.club_name 
		FROM `tabSchool Club` sc
		JOIN `tabClub Instructor` ci ON ci.parent = sc.name
		WHERE ci.instructor = %s 
		AND sc.academic_year = %s
		AND sc.docstatus < 2
		AND (sc.name != %s OR %s IS NULL)
	""", (instructor, academic_year, current_club, current_club), as_dict=True)
	
	if existing:
		return {
			'eligible': False,
			'message': f"Instructor is already assigned to '{existing[0].club_name}' for this academic year"
		}
	
	return {'eligible': True, 'message': 'Instructor is eligible to be assigned to this club'}