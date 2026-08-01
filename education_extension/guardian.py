# Copyright (c) 2015, Frappe Technologies and contributors
# For license information, please see license.txt


import json

import frappe
from frappe import _
from frappe.email.doctype.email_group.email_group import add_subscribers
from frappe.model.mapper import get_mapped_doc
from frappe.utils import cstr, flt, getdate, today
from frappe.utils.dateutils import get_dates_from_timegrain


def get_course(program):
	"""Return list of courses for a particular program
	:param program: Program
	"""
	courses = frappe.db.sql(
		"""select course, course_name from `tabProgram Course` where parent=%s""",
		(program),
		as_dict=1,
	)
	return courses


@frappe.whitelist()
def enroll_student(source_name):
	"""Creates a Student Record and returns a Program Enrollment.

	:param source_name: Student Applicant.
	"""
	frappe.publish_realtime("enroll_student_progress", {"progress": [1, 4]}, user=frappe.session.user)
	student = get_mapped_doc(
		"Student Applicant",
		source_name,
		{
			"Student Applicant": {
				"doctype": "Student",
				"field_map": {
					"name": "student_applicant",
				},
			}
		},
		ignore_permissions=True,
	)
	student.save()

	student_applicant = frappe.db.get_value(
		"Student Applicant",
		source_name,
		["student_category", "program", "academic_year"],
		as_dict=True,
	)
	program_enrollment = frappe.new_doc("Program Enrollment")
	program_enrollment.student = student.name
	program_enrollment.student_category = student_applicant.student_category
	program_enrollment.student_name = student.student_name
	program_enrollment.program = student_applicant.program
	program_enrollment.academic_year = student_applicant.academic_year
	program_enrollment.save()

	frappe.publish_realtime("enroll_student_progress", {"progress": [2, 4]}, user=frappe.session.user)
	return program_enrollment


@frappe.whitelist()
def check_attendance_records_exist(course_schedule=None, student_group=None, date=None):
	"""Check if Attendance Records are made against the specified Course Schedule or Student Group for given date.

	:param course_schedule: Course Schedule.
	:param student_group: Student Group.
	:param date: Date.
	"""
	if course_schedule:
		return frappe.get_list("Student Attendance", filters={"course_schedule": course_schedule})
	else:
		return frappe.get_list("Student Attendance", filters={"student_group": student_group, "date": date})


@frappe.whitelist()
def mark_attendance(students_present, students_absent, course_schedule=None, student_group=None, date=None):
	"""Creates Multiple Attendance Records.

	:param students_present: Students Present JSON.
	:param students_absent: Students Absent JSON.
	:param course_schedule: Course Schedule.
	:param student_group: Student Group.
	:param date: Date.
	"""
	if student_group:
		academic_year = frappe.db.get_value("Student Group", student_group, "academic_year")
		if academic_year:
			year_start_date, year_end_date = frappe.db.get_value(
				"Academic Year", academic_year, ["year_start_date", "year_end_date"]
			)
			if getdate(date) < getdate(year_start_date) or getdate(date) > getdate(year_end_date):
				frappe.throw(
					_("Attendance cannot be marked outside of Academic Year {0}").format(academic_year)
				)

	present = json.loads(students_present)
	absent = json.loads(students_absent)

	for d in present:
		make_attendance_records(
			d["student"], d["student_name"], "Present", course_schedule, student_group, date
		)

	for d in absent:
		make_attendance_records(
			d["student"], d["student_name"], "Absent", course_schedule, student_group, date
		)

	frappe.db.commit()
	frappe.msgprint(_("Attendance has been marked successfully."))


def make_attendance_records(
	student, student_name, status, course_schedule=None, student_group=None, date=None
):
	"""Creates/Update Attendance Record.

	:param student: Student.
	:param student_name: Student Name.
	:param course_schedule: Course Schedule.
	:param status: Status (Present/Absent/Leave).
	"""
	student_attendance = frappe.get_doc(
		{
			"doctype": "Student Attendance",
			"student": student,
			"course_schedule": course_schedule,
			"student_group": student_group,
			"date": date,
		}
	)
	if not student_attendance:
		student_attendance = frappe.new_doc("Student Attendance")
	student_attendance.student = student
	student_attendance.student_name = student_name
	student_attendance.course_schedule = course_schedule
	student_attendance.student_group = student_group
	student_attendance.date = date
	student_attendance.status = status
	student_attendance.save()
	student_attendance.submit()


@frappe.whitelist()
def get_student_guardians(student):
	"""Returns List of Guardians of a Student.

	:param student: Student.
	"""
	guardians = frappe.get_all("Student Guardian", fields=["guardian"], filters={"parent": student})
	return guardians


@frappe.whitelist()
def get_student_group_students(student_group, include_inactive=0):
	"""Returns List of student, student_name in Student Group.

	:param student_group: Student Group.
	"""
	if include_inactive:
		students = frappe.get_all(
			"Student Group Student",
			fields=["student", "student_name"],
			filters={"parent": student_group},
			order_by="group_roll_number",
		)
	else:
		students = frappe.get_all(
			"Student Group Student",
			fields=["student", "student_name"],
			filters={"parent": student_group, "active": 1},
			order_by="group_roll_number",
		)
	return students


@frappe.whitelist()
def get_fee_structure(program, academic_term=None):
	"""Returns Fee Structure.

	:param program: Program.
	:param academic_term: Academic Term.
	"""
	fee_structure = frappe.db.get_values(
		"Fee Structure",
		{"program": program, "academic_term": academic_term},
		"name",
		as_dict=True,
	)
	return fee_structure[0].name if fee_structure else None


@frappe.whitelist()
def get_fee_components(fee_structure):
	"""Returns Fee Components.

	:param fee_structure: Fee Structure.
	"""
	if fee_structure:
		fs = frappe.get_all(
			"Fee Component",
			fields=["fees_category", "description", "amount"],
			filters={"parent": fee_structure},
			order_by="idx",
		)
		return fs


@frappe.whitelist()
def get_fee_schedule(program, student_category=None):
	"""Returns Fee Schedule.

	:param program: Program.
	:param student_category: Student Category
	"""
	fs = frappe.get_all(
		"Program Fee",
		fields=["academic_term", "fee_schedule", "due_date", "amount"],
		filters={"parent": program, "student_category": student_category},
		order_by="idx",
	)
	return fs


@frappe.whitelist()
def collect_fees(fees, amt):
	paid_amount = flt(amt) + flt(frappe.db.get_value("Fees", fees, "paid_amount"))
	total_amount = flt(frappe.db.get_value("Fees", fees, "total_amount"))
	frappe.db.set_value("Fees", fees, "paid_amount", paid_amount)
	frappe.db.set_value("Fees", fees, "outstanding_amount", (total_amount - paid_amount))
	return paid_amount


@frappe.whitelist()
def get_course_schedule_events(start, end, filters=None):
	"""Returns events for Course Schedule Calendar view rendering.

	:param start: Start date-time.
	:param end: End date-time.
	:param filters: Filters (JSON).
	"""
	from frappe.desk.calendar import get_event_conditions

	conditions = get_event_conditions("Course Schedule", filters)

	data = frappe.db.sql(
		"""select name, course, color,
			timestamp(schedule_date, from_time) as from_time,
			timestamp(schedule_date, to_time) as to_time,
			room, student_group, 0 as 'allDay'
		from `tabCourse Schedule`
		where ( schedule_date between %(start)s and %(end)s )
		{conditions}""".format(conditions=conditions),
		{"start": start, "end": end},
		as_dict=True,
		update={"allDay": 0},
	)

	return data


@frappe.whitelist()
def get_assessment_criteria(course):
	"""Returns Assessmemt Criteria and their Weightage from Course Master.

	:param Course: Course
	"""
	return frappe.get_all(
		"Course Assessment Criteria",
		fields=["assessment_criteria", "weightage"],
		filters={"parent": course},
		order_by="idx",
	)


@frappe.whitelist()
def get_assessment_students(assessment_plan, student_group):
	student_list = get_student_group_students(student_group)
	for i, student in enumerate(student_list):
		result = get_result(student.student, assessment_plan)
		if result:
			student_result = {}
			for d in result.details:
				student_result.update({d.assessment_criteria: [cstr(d.score), d.grade]})
			student_result.update(
				{"total_score": [cstr(result.total_score), result.grade], "comment": result.comment}
			)
			student.update(
				{
					"assessment_details": student_result,
					"docstatus": result.docstatus,
					"name": result.name,
				}
			)
		else:
			student.update({"assessment_details": None})
	return student_list


@frappe.whitelist()
def get_assessment_details(assessment_plan):
	"""Returns Assessment Criteria  and Maximum Score from Assessment Plan Master.

	:param Assessment Plan: Assessment Plan
	"""
	return frappe.get_all(
		"Assessment Plan Criteria",
		fields=["assessment_criteria", "maximum_score", "docstatus"],
		filters={"parent": assessment_plan},
		order_by="idx",
	)


@frappe.whitelist()
def get_result(student, assessment_plan):
	"""Returns Submitted Result of given student for specified Assessment Plan

	:param Student: Student
	:param Assessment Plan: Assessment Plan
	"""
	results = frappe.get_all(
		"Assessment Result",
		filters={
			"student": student,
			"assessment_plan": assessment_plan,
			"docstatus": ("!=", 2),
		},
	)
	if results:
		return frappe.get_doc("Assessment Result", results[0])
	else:
		return None


@frappe.whitelist()
def get_grade(grading_scale, percentage):
	"""Returns Grade based on the Grading Scale and Score.

	:param Grading Scale: Grading Scale
	:param Percentage: Score Percentage Percentage
	"""
	grading_scale_intervals = {}
	if not hasattr(frappe.local, "grading_scale"):
		grading_scale = frappe.get_all(
			"Grading Scale Interval",
			fields=["grade_code", "threshold"],
			filters={"parent": grading_scale},
		)
		frappe.local.grading_scale = grading_scale
	for d in frappe.local.grading_scale:
		grading_scale_intervals.update({d.threshold: d.grade_code})
	intervals = sorted(grading_scale_intervals.keys(), key=float, reverse=True)
	for interval in intervals:
		if flt(percentage) >= interval:
			grade = grading_scale_intervals.get(interval)
			break
		else:
			grade = ""
	return grade


@frappe.whitelist()
def mark_assessment_result(assessment_plan, scores):
	student_score = json.loads(scores)
	assessment_details = []
	for criteria in student_score.get("assessment_details"):
		assessment_details.append(
			{
				"assessment_criteria": criteria,
				"score": flt(student_score["assessment_details"][criteria]),
			}
		)
	assessment_result = get_assessment_result_doc(student_score["student"], assessment_plan)
	assessment_result.update(
		{
			"student": student_score.get("student"),
			"assessment_plan": assessment_plan,
			"comment": student_score.get("comment"),
			"total_score": student_score.get("total_score"),
			"details": assessment_details,
		}
	)
	assessment_result.save()
	details = {}
	for d in assessment_result.details:
		details.update({d.assessment_criteria: d.grade})
	assessment_result_dict = {
		"name": assessment_result.name,
		"student": assessment_result.student,
		"total_score": assessment_result.total_score,
		"grade": assessment_result.grade,
		"details": details,
	}
	return assessment_result_dict


@frappe.whitelist()
def submit_assessment_results(assessment_plan, student_group):
	total_result = 0
	student_list = get_student_group_students(student_group)
	for i, student in enumerate(student_list):
		doc = get_result(student.student, assessment_plan)
		if doc and doc.docstatus == 0:
			total_result += 1
			doc.submit()
	return total_result


def get_assessment_result_doc(student, assessment_plan):
	assessment_result = frappe.get_all(
		"Assessment Result",
		filters={
			"student": student,
			"assessment_plan": assessment_plan,
			"docstatus": ("!=", 2),
		},
	)
	if assessment_result:
		doc = frappe.get_doc("Assessment Result", assessment_result[0])
		if doc.docstatus == 0:
			return doc
		elif doc.docstatus == 1:
			frappe.msgprint(_("Result already Submitted"))
			return None
	else:
		return frappe.new_doc("Assessment Result")


@frappe.whitelist()
def update_email_group(doctype, name):
	if not frappe.db.exists("Email Group", name):
		email_group = frappe.new_doc("Email Group")
		email_group.title = name
		email_group.save()
	email_list = []
	students = []
	if doctype == "Student Group":
		students = get_student_group_students(name)
	for stud in students:
		for guard in get_student_guardians(stud.student):
			email = frappe.db.get_value("Guardian", guard.guardian, "email_address")
			if email:
				email_list.append(email)
	add_subscribers(name, email_list)


@frappe.whitelist()
def get_current_enrollment(student, academic_year=None):
	# If academic_year is not passed, use today's date
	compare_date = getdate(academic_year) if academic_year else getdate(today())

	program_enrollment_list = frappe.db.sql(
		"""
		SELECT
			pe.name AS program_enrollment, pe.student_name, pe.program, pe.student_batch_name AS student_batch,
			pe.student_category, pe.academic_term, pe.academic_year
		FROM
			`tabProgram Enrollment` pe
		JOIN
			`tabAcademic Year` ay ON pe.academic_year = ay.name
		WHERE
			pe.student = %s
			AND ay.year_end_date >= %s
		ORDER BY
			pe.creation
		""",
		(student, compare_date),
		as_dict=1,
	)

	if program_enrollment_list:
		return program_enrollment_list[0]
	else:
		return None


@frappe.whitelist()
def get_instructors(student_group):
	return frappe.get_all("Student Group Instructor", {"parent": student_group}, pluck="instructor")


@frappe.whitelist()
def get_user_info():
	if frappe.session.user == "Guest":
		frappe.throw("Authentication failed", exc=frappe.AuthenticationError)

	current_user = frappe.db.get_list(
		"User",
		fields=["name", "email", "enabled", "user_image", "full_name", "user_type"],
		filters={"name": frappe.session.user},
	)[0]
	current_user["session_user"] = True
	return current_user


@frappe.whitelist()
def get_student_info():
	email = frappe.session.user
	if email == "Administrator":
		return
	student_info = frappe.db.get_list(
		"Student",
		fields=["*"],
		filters={"user": email},
	)[0]

	current_program = get_current_enrollment(student_info.name)
	if current_program:
		student_groups = get_student_groups(student_info.name, current_program.program)
		student_info["student_groups"] = student_groups
		student_info["current_program"] = current_program
	return student_info


@frappe.whitelist()
def get_student_programs(student):
	# student = 'EDU-STU-2023-00043'
	programs = frappe.db.get_list(
		"Program Enrollment",
		fields=["program", "name"],
		filters={"docstatus": 1, "student": student},
	)
	return programs


def get_student_groups(student, program_name):
	# student = 'EDU-STU-2023-00043'

	student_group = frappe.qb.DocType("Student Group")
	student_group_students = frappe.qb.DocType("Student Group Student")

	student_group_query = (
		frappe.qb.from_(student_group)
		.inner_join(student_group_students)
		.on(student_group.name == student_group_students.parent)
		.select((student_group_students.parent).as_("label"))
		.where(student_group_students.student == student)
		.where(student_group.program == program_name)
		.run(as_dict=1)
	)

	return student_group_query


@frappe.whitelist()
def get_course_list_based_on_program(program_name):
	program = frappe.get_doc("Program", program_name)

	course_list = []

	for course in program.courses:
		course_list.append(course.course)
	return course_list


@frappe.whitelist()
def get_course_schedule_for_student(program_name, student_groups):
	student_groups = [sg.get("label") for sg in student_groups]

	schedule = frappe.db.get_list(
		"Course Schedule",
		fields=[
			"schedule_date",
			"room",
			"class_schedule_color",
			"course",
			"from_time",
			"to_time",
			"instructor",
			"title",
			"name",
		],
		filters={"program": program_name, "student_group": ["in", student_groups]},
		order_by="schedule_date asc",
	)
	return schedule


@frappe.whitelist()
def apply_leave(leave_data, program_name):
	attendance_based_on_course_schedule = frappe.db.get_single_value(
		"Education Settings", "attendance_based_on_course_schedule"
	)
	if attendance_based_on_course_schedule:
		apply_leave_based_on_course_schedule(leave_data, program_name)
	else:
		apply_leave_based_on_student_group(leave_data, program_name)


def apply_leave_based_on_course_schedule(leave_data, program_name):
	course_schedule_in_leave_period = frappe.db.get_list(
		"Course Schedule",
		fields=["name", "schedule_date"],
		filters={
			"program": program_name,
			"schedule_date": [
				"between",
				[leave_data.get("from_date"), leave_data.get("to_date")],
			],
		},
		order_by="schedule_date asc",
	)
	if not course_schedule_in_leave_period:
		frappe.throw(_("No classes found in the leave period"))
	for course_schedule in course_schedule_in_leave_period:
		# check if attendance record does not exist for the student on the course schedule
		if not frappe.db.exists(
			"Student Attendance",
			{"course_schedule": course_schedule.get("name"), "docstatus": 1},
		):
			make_attendance_records(
				leave_data.get("student"),
				leave_data.get("student_name"),
				"Leave",
				course_schedule.get("name"),
				None,
				course_schedule.get("schedule_date"),
			)


def apply_leave_based_on_student_group(leave_data, program_name):
	student_groups = get_student_groups(leave_data.get("student"), program_name)
	leave_dates = get_dates_from_timegrain(leave_data.get("from_date"), leave_data.get("to_date"))
	for student_group in student_groups:
		for leave_date in leave_dates:
			make_attendance_records(
				leave_data.get("student"),
				leave_data.get("student_name"),
				"Leave",
				None,
				student_group.get("label"),
				leave_date,
			)


@frappe.whitelist()
def get_student_invoices(student):
	student_sales_invoices = []

	sales_invoice_list = frappe.db.get_list(
		"Sales Invoice",
		filters={
			"student": student,
			"status": ["in", ["Paid", "Unpaid", "Overdue", "Partly Paid"]],
			"docstatus": 1,
		},
		fields=[
			"name",
			"status",
			"student",
			"due_date",
			"fee_schedule",
			"outstanding_amount",
			"currency",
			"grand_total",
		],
		order_by="status desc",
	)

	for si in sales_invoice_list:
		student_program_invoice_status = {}
		student_program_invoice_status["status"] = si.status
		student_program_invoice_status["program"] = get_program_from_fee_schedule(si.fee_schedule)
		symbol = get_currency_symbol(si.get("currency", "INR"))
		student_program_invoice_status["amount"] = symbol + " " + str(si.outstanding_amount)
		student_program_invoice_status["invoice"] = si.name
		if si.status == "Paid":
			student_program_invoice_status["amount"] = symbol + " " + str(si.grand_total)
			student_program_invoice_status["payment_date"] = (
				get_posting_date_from_payment_entry_against_sales_invoice(si.name)
			)
			student_program_invoice_status["due_date"] = "-"
		else:
			student_program_invoice_status["due_date"] = si.due_date
			student_program_invoice_status["payment_date"] = "-"

		student_sales_invoices.append(student_program_invoice_status)

	print_format = get_fees_print_format() or "Standard"

	return {"invoices": student_sales_invoices, "print_format": print_format}


def get_currency_symbol(currency):
	return frappe.db.get_value("Currency", currency, "symbol") or currency


def get_posting_date_from_payment_entry_against_sales_invoice(sales_invoice):
	payment_entry = frappe.qb.DocType("Payment Entry")
	payment_entry_reference = frappe.qb.DocType("Payment Entry Reference")

	q = (
		frappe.qb.from_(payment_entry)
		.inner_join(payment_entry_reference)
		.on(payment_entry.name == payment_entry_reference.parent)
		.select(payment_entry.posting_date)
		.where(payment_entry_reference.reference_name == sales_invoice)
	).run(as_dict=1)

	if len(q) > 0:
		payment_date = q[0].get("posting_date")
		return payment_date


def get_fees_print_format():
	return frappe.db.get_value(
		"Property Setter",
		dict(property="default_print_format", doc_type="Sales Invoice"),
		"value",
	)


def get_program_from_fee_schedule(fee_schedule):

	program = frappe.db.get_value("Fee Schedule", filters={"name": fee_schedule}, fieldname=["program"])
	return program


@frappe.whitelist()
def get_school_abbr_logo():
	abbr = frappe.db.get_single_value("Education Settings", "school_college_name_abbreviation")
	logo = frappe.db.get_single_value("Education Settings", "school_college_logo")
	return {"name": abbr, "logo": logo}


@frappe.whitelist()
def get_student_attendance(student, student_group):
	return frappe.db.get_list(
		"Student Attendance",
		filters={"student": student, "student_group": student_group, "docstatus": 1},
		fields=["date", "status", "name"],
	)


# Add these functions to your education/education/api.py file

import frappe
from frappe import _
from frappe.utils.print_format import download_pdf
import json


@frappe.whitelist()
def get_individual_awards():
	"""Return all individual certificates for the current logged-in student"""
	try:
		# Get student record from current user
		student = frappe.db.get_value("Student", {"user": frappe.session.user}, "name")
		if not student:
			frappe.throw("No student record found for current user")

		awards = frappe.get_all(
			"Individual Certificate",
			filters={"awardee": student},
			fields=[
				"name",
				"certificate_title",
				"certificate_type",
				"certificate_date",
				"description",
				"academic_year",
				"certificate_file",
			],
		)
		return awards

	except Exception as e:
		frappe.log_error(f"Error in getting individual awards: {str(e)}")
		frappe.throw(f"Error loading awards: {str(e)}")


@frappe.whitelist()
def get_general_awards():
	"""Return all general certificates for the current student's groups"""
	try:
		# Get student record from current user
		student = frappe.db.get_value("Student", {"user": frappe.session.user}, "name")

		if not student:
			return []  # Return empty list instead of throwing error

		# First get student groups
		student_groups = frappe.db.sql(
			"""
            SELECT DISTINCT parent
            FROM `tabStudent Group Student`
            WHERE student = %s
        """,
			(student,),
			as_list=True,
		)

		if not student_groups:
			return []

		# Flatten the list
		group_list = [g[0] for g in student_groups]

		# Then get certificates using frappe.get_all (safer than raw SQL)
		awards = frappe.get_all(
			"General Certificate",
			filters={"student_group": ["in", group_list]},
			fields=[
				"name",
				"certificate_title",
				"certificate_type",
				"certificate_date",
				"student_group",
				"description",
				"academic_year",
				"certificate_file",
			],
			order_by="certificate_date desc",
		)

		return awards

	except Exception as e:
		frappe.log_error(f"Error in getting general awards: {str(e)}", "General Awards Error")
		return []  # Return empty list instead of throwing


@frappe.whitelist()
def get_student_reports_with_program():
	"""
	Get existing School Term Result reports for the current student,
	including program field
	"""
	try:
		student = frappe.db.get_value("Student", {"user": frappe.session.user}, "name")
		if not student:
			frappe.throw("No student record found for current user")

		reports = frappe.get_all(
			"School Term Result",
			filters={"student": student},
			fields=[
				"name",
				"academic_year",
				"assessment_group",
				"academic_term",
				"program",
				"total_marks_obtained",
				"total_max_marks",
				"term_average",
				"overall_grade",
				"class_position",
				"class_arm_position",
				"creation",
				"modified",
			],
			order_by="academic_year desc, assessment_group",
		)
		return reports

	except Exception as e:
		frappe.log_error(f"Error in get_student_reports_with_program: {str(e)}")
		frappe.throw(f"Error loading reports: {str(e)}")


# @frappe.whitelist()
# def get_school_print_format():
#     """Get the configured print format from School Settings"""
#     settings = frappe.get_doc('School Settings', 'School Settings')
#     return {"print_format": settings.print_format}


def has_academic_permission():
	"""
	Check if current user has academic permissions
	"""
	user_roles = frappe.get_roles(frappe.session.user)
	academic_roles = [
		"Academics User",
		"Education Manager",
		"Student",
		"Instructor",
		"Academic Admin",
		"School Admin",
	]

	return any(role in academic_roles for role in user_roles)


@frappe.whitelist()
def get_student_bulk_certificates():
	"""
	Get all bulk certificates that include the current logged-in student
	Returns certificates from Bulk Certificate Generator where the student is listed
	"""
	try:
		# Get student record from current user
		student = frappe.db.get_value("Student", {"user": frappe.session.user}, "name")

		if not student:
			return []

		# Get all Bulk Certificate Generator documents where this student appears
		# and the certificate was generated for them
		certificates = frappe.db.sql(
			"""
            SELECT DISTINCT
                bcg.name,
                bcg.certificate_title,
                bcg.certificate_type,
                bcg.certificate_date,
                bcg.description,
                bcg.certificate_file,
                bcg.class_arm as student_group,
                bcg.creation
            FROM 
                `tabBulk Certificate Generator` bcg
            INNER JOIN 
                `tabBulk Certificate Student` bcs ON bcg.name = bcs.parent
            WHERE 
                bcs.student = %(student)s
                AND bcs.select = 1
                AND bcs.certificate_generated = 1
                AND bcg.docstatus = 1
            ORDER BY 
                bcg.certificate_date DESC, bcg.creation DESC
        """,
			{"student": student},
			as_dict=True,
		)

		return certificates

	except Exception as e:
		frappe.log_error(f"Error in get_student_bulk_certificates: {str(e)}", "Bulk Certificates Error")
		return []


@frappe.whitelist()
def get_bulk_certificate_filters():
	"""
	Get available filter options for bulk certificates for the current student
	"""
	try:
		# Get student record from current user
		student = frappe.db.get_value("Student", {"user": frappe.session.user}, "name")

		if not student:
			return {"years": [], "categories": [], "student_groups": []}

		# Get distinct years
		years = frappe.db.sql(
			"""
            SELECT DISTINCT YEAR(bcg.certificate_date) as year
            FROM `tabBulk Certificate Generator` bcg
            INNER JOIN `tabBulk Certificate Student` bcs ON bcg.name = bcs.parent
            WHERE bcs.student = %(student)s
                AND bcs.select = 1
                AND bcs.certificate_generated = 1
                AND bcg.docstatus = 1
            ORDER BY year DESC
        """,
			{"student": student},
			as_dict=True,
		)

		# Get distinct categories (certificate types)
		categories = frappe.db.sql(
			"""
            SELECT DISTINCT bcg.certificate_type as category
            FROM `tabBulk Certificate Generator` bcg
            INNER JOIN `tabBulk Certificate Student` bcs ON bcg.name = bcs.parent
            WHERE bcs.student = %(student)s
                AND bcs.select = 1
                AND bcs.certificate_generated = 1
                AND bcg.docstatus = 1
                AND bcg.certificate_type IS NOT NULL
            ORDER BY category
        """,
			{"student": student},
			as_dict=True,
		)

		# Get distinct student groups
		student_groups = frappe.db.sql(
			"""
            SELECT DISTINCT bcg.class_arm as student_group
            FROM `tabBulk Certificate Generator` bcg
            INNER JOIN `tabBulk Certificate Student` bcs ON bcg.name = bcs.parent
            WHERE bcs.student = %(student)s
                AND bcs.select = 1
                AND bcs.certificate_generated = 1
                AND bcg.docstatus = 1
                AND bcg.class_arm IS NOT NULL
            ORDER BY student_group
        """,
			{"student": student},
			as_dict=True,
		)

		return {
			"years": [str(y.year) for y in years if y.year],
			"categories": [c.category for c in categories if c.category],
			"student_groups": [sg.student_group for sg in student_groups if sg.student_group],
		}

	except Exception as e:
		frappe.log_error(
			f"Error in get_bulk_certificate_filters: {str(e)}", "Bulk Certificates Filters Error"
		)
		return {"years": [], "categories": [], "student_groups": []}


def is_secondary_program(program):
	"""
	Check if a program is a secondary/high school program
	Returns True if program contains keywords indicating secondary education
	"""
	if not program:
		return False

	program_lower = program.lower()
	secondary_keywords = [
		"jss",  # Junior Secondary School
		"ss",  # Senior Secondary
		"secondary",
		"high school",
		"senior",
		"junior secondary",
	]

	return any(keyword in program_lower for keyword in secondary_keywords)


def get_print_format_for_program(program):
	"""
	Get the appropriate print format based on program type
	Returns the print format string to use for the given program
	"""
	try:
		settings = frappe.get_doc("School Settings", "School Settings")

		if is_secondary_program(program):
			print_format = settings.secondary_school_print_format or "Standard"
		else:
			print_format = settings.primary_school_print_format or "Standard"

		return print_format
	except Exception as e:
		frappe.log_error(f"Error getting print format for program {program}: {str(e)}")
		return "Standard"


import frappe
from frappe import _


@frappe.whitelist()
def get_linked_students():
	user = frappe.session.user

	# 1. Strict Exclusion: Block Guests and Administrators
	if user == "Guest" or user == "Administrator":
		return []

	# 2. Verify Guardian Identity
	# We look for a Guardian record where the email matches the logged-in user
	guardian = frappe.db.get_value("Guardian", {"email_address": user}, "name")

	if not guardian:
		# If no Guardian record is found for this email, return empty
		return []

	# 3. Fetch linked students
	# Note: In standard Frappe Education, the relationship is usually
	# stored in the 'Student Guardian' child table inside the 'Student' DocType.
	links = frappe.get_all("Student Guardian", filters={"guardian": guardian}, fields=["parent"])

	student_details = []
	for link in links:
		# Fetch only the necessary fields for the dashboard cards
		student = frappe.db.get_value(
			"Student", link.parent, ["name", "student_name", "image", "blood_group"], as_dict=1
		)
		if student:
			student_details.append(student)

	return student_details


# In your guardian.py - replace get_ward_details with this fuller version


@frappe.whitelist()
def get_ward_details(student_id):
	user = frappe.session.user

	if user == "Guest" or user == "Administrator":
		frappe.throw(_("Access Denied"), frappe.PermissionError)

	guardian = frappe.db.get_value("Guardian", {"email_address": user}, "name")

	if not guardian:
		frappe.throw(_("No guardian record found for this user"), frappe.PermissionError)

	# Verify the link exists before showing details
	is_linked = frappe.db.exists("Student Guardian", {"parent": student_id, "guardian": guardian})

	if not is_linked:
		frappe.throw(_("You do not have permission to view this student's data"), frappe.PermissionError)

	student = frappe.get_doc("Student", student_id)

	# Get current enrollment
	from education.education.api import get_current_enrollment

	enrollment = get_current_enrollment(student_id)

	# Get recent attendance (last 30 records)
	attendance = frappe.get_all(
		"Student Attendance",
		filters={"student": student_id, "docstatus": 1},
		fields=["date", "status", "name"],
		order_by="date desc",
		limit=30,
		ignore_permissions=True,
	)

	# Compute attendance summary
	total = len(attendance)
	present = len([a for a in attendance if a.status == "Present"])
	absent = len([a for a in attendance if a.status == "Absent"])
	on_leave = len([a for a in attendance if a.status == "Leave"])
	attendance_pct = round((present / total) * 100) if total > 0 else 0

	# Get term results
	reports = frappe.get_all(
		"School Term Result",
		filters={"student": student_id},
		fields=[
			"name",
			"academic_year",
			"academic_term",
			"program",
			"total_marks_obtained",
			"total_max_marks",
			"term_average",
			"overall_grade",
			"class_position",
			"class_arm_position",
		],
		order_by="academic_year desc",
		limit=5,
		ignore_permissions=True,
	)

	# Get fee invoices
	invoices = frappe.db.get_list(
		"Sales Invoice",
		filters={
			"student": student_id,
			"status": ["in", ["Paid", "Unpaid", "Overdue", "Partly Paid"]],
			"docstatus": 1,
		},
		fields=["name", "status", "grand_total", "outstanding_amount", "due_date", "currency"],
		order_by="due_date desc",
		limit=10,
		ignore_permissions=True,
	)

	return {
		"student": {
			"name": student.name,
			"student_name": student.student_name,
			"image": student.image,
			"blood_group": student.blood_group,
			"date_of_birth": str(student.date_of_birth) if student.date_of_birth else None,
			"gender": student.gender,
		},
		"enrollment": enrollment,
		"attendance": {
			"records": attendance,
			"summary": {
				"total": total,
				"present": present,
				"absent": absent,
				"on_leave": on_leave,
				"percentage": attendance_pct,
			},
		},
		"reports": reports,
		"invoices": invoices,
	}


@frappe.whitelist()
def get_ward_schedule(student_id):
	user = frappe.session.user
	if user == "Guest" or user == "Administrator":
		frappe.throw(_("Access Denied"), frappe.PermissionError)

	guardian = frappe.db.get_value("Guardian", {"email_address": user}, "name")
	if not guardian or not frappe.db.exists("Student Guardian", {"parent": student_id, "guardian": guardian}):
		frappe.throw(_("Permission Denied"), frappe.PermissionError)

	from education.education.api import get_current_enrollment, get_student_groups

	enrollment = get_current_enrollment(student_id)
	if not enrollment:
		return {"schedule": [], "enrollment": None}

	student_groups = get_student_groups(student_id, enrollment.program)
	group_names = [sg.get("label") for sg in student_groups]

	schedule = (
		frappe.db.get_list(
			"Course Schedule",
			filters={"student_group": ["in", group_names]} if group_names else {"name": ""},
			fields=[
				"name",
				"course",
				"schedule_date",
				"from_time",
				"to_time",
				"room",
				"instructor",
				"student_group",
			],
			order_by="schedule_date asc, from_time asc",
			ignore_permissions=True,
		)
		if group_names
		else []
	)

	return {"schedule": schedule, "enrollment": enrollment}


@frappe.whitelist()
def get_ward_grades(student_id):
	user = frappe.session.user
	if user == "Guest" or user == "Administrator":
		frappe.throw(_("Access Denied"), frappe.PermissionError)

	guardian = frappe.db.get_value("Guardian", {"email_address": user}, "name")
	if not guardian or not frappe.db.exists("Student Guardian", {"parent": student_id, "guardian": guardian}):
		frappe.throw(_("Permission Denied"), frappe.PermissionError)

	results = frappe.get_all(
		"Assessment Result",
		filters={"student": student_id, "docstatus": 1},
		fields=["name", "assessment_plan", "total_score", "grade", "creation"],
		order_by="creation desc",
		limit=20,
		ignore_permissions=True,
	)

	enriched = []
	for r in results:
		plan = (
			frappe.db.get_value(
				"Assessment Plan",
				r.assessment_plan,
				["assessment_name", "course", "maximum_score", "academic_term", "academic_year"],
				as_dict=True,
				ignore_permissions=True,
			)
			or {}
		)
		enriched.append({**r, **plan})

	return enriched


# @frappe.whitelist()
# def get_ward_fees(student_id):
# 	user = frappe.session.user
# 	if user == "Guest" or user == "Administrator":
# 		frappe.throw(_("Access Denied"), frappe.PermissionError)

# 	guardian = frappe.db.get_value("Guardian", {"email_address": user}, "name")
# 	if not guardian or not frappe.db.exists("Student Guardian", {"parent": student_id, "guardian": guardian}):
# 		frappe.throw(_("Permission Denied"), frappe.PermissionError)

# 	invoices = frappe.db.get_list(
# 		"Sales Invoice",
# 		filters={
# 			"student": student_id,
# 			"status": ["in", ["Paid", "Unpaid", "Overdue", "Partly Paid"]],
# 			"docstatus": 1,
# 		},
# 		fields=[
# 			"name",
# 			"status",
# 			"grand_total",
# 			"outstanding_amount",
# 			"due_date",
# 			"currency",
# 			"posting_date",
# 			"fee_schedule",
# 		],
# 		order_by="due_date desc",
# 		ignore_permissions=True,
# 	)

# 	# Enrich with program name from fee schedule — same as student portal
# 	from education.education.api import get_program_from_fee_schedule

# 	for inv in invoices:
# 		inv["program"] = get_program_from_fee_schedule(inv.get("fee_schedule")) or "—"

# 	total_outstanding = sum(float(i.outstanding_amount or 0) for i in invoices)
# 	total_paid = sum(float(i.grand_total or 0) for i in invoices if i.status == "Paid")

# 	return {
# 		"invoices": invoices,
# 		"summary": {
# 			"total_outstanding": total_outstanding,
# 			"total_paid": total_paid,
# 		},
# 	}


@frappe.whitelist()
def get_ward_fees(student_id):
	user = frappe.session.user
	if user == "Guest" or user == "Administrator":
		frappe.throw(_("Access Denied"), frappe.PermissionError)

	guardian = frappe.db.get_value("Guardian", {"email_address": user}, "name")
	if not guardian or not frappe.db.exists("Student Guardian", {"parent": student_id, "guardian": guardian}):
		frappe.throw(_("Permission Denied"), frappe.PermissionError)

	invoices = frappe.db.get_list(
		"Sales Invoice",
		filters={
			"student": student_id,
			"status": ["in", ["Paid", "Unpaid", "Overdue", "Partly Paid"]],
			"docstatus": 1,
		},
		fields=[
			"name",
			"status",
			"grand_total",
			"outstanding_amount",
			"due_date",
			"currency",
			"posting_date",
			"fee_schedule",
		],
		order_by="due_date desc",
		ignore_permissions=True,
	)

	from education.education.api import (
		get_program_from_fee_schedule,
		get_posting_date_from_payment_entry_against_sales_invoice,
	)

	for inv in invoices:
		inv["program"] = get_program_from_fee_schedule(inv.get("fee_schedule")) or "—"

		if inv["status"] == "Paid":
			inv["payment_date"] = get_posting_date_from_payment_entry_against_sales_invoice(inv["name"])
			inv["due_date"] = None  # hide due date for paid invoices
		else:
			inv["payment_date"] = None

	total_outstanding = sum(float(i.outstanding_amount or 0) for i in invoices)
	total_paid = sum(float(i.grand_total or 0) for i in invoices if i.status == "Paid")

	return {
		"invoices": invoices,
		"summary": {
			"total_outstanding": total_outstanding,
			"total_paid": total_paid,
		},
	}


@frappe.whitelist()
def get_ward_attendance(student_id):
	user = frappe.session.user
	if user == "Guest" or user == "Administrator":
		frappe.throw(_("Access Denied"), frappe.PermissionError)

	guardian = frappe.db.get_value("Guardian", {"email_address": user}, "name")
	if not guardian or not frappe.db.exists("Student Guardian", {"parent": student_id, "guardian": guardian}):
		frappe.throw(_("Permission Denied"), frappe.PermissionError)

	attendance = frappe.get_all(
		"Student Attendance",
		filters={"student": student_id, "docstatus": 1},
		fields=["date", "status", "name", "student_group"],
		order_by="date desc",
		limit=60,
		ignore_permissions=True,
	)

	total = len(attendance)
	present = len([a for a in attendance if a.status == "Present"])
	absent = len([a for a in attendance if a.status == "Absent"])
	on_leave = len([a for a in attendance if a.status == "Leave"])
	pct = round((present / total) * 100) if total > 0 else 0

	return {
		"records": attendance,
		"summary": {
			"total": total,
			"present": present,
			"absent": absent,
			"on_leave": on_leave,
			"percentage": pct,
		},
	}


@frappe.whitelist()
def get_ward_reports(student_id):
	user = frappe.session.user
	if user == "Guest" or user == "Administrator":
		frappe.throw(_("Access Denied"), frappe.PermissionError)

	guardian = frappe.db.get_value("Guardian", {"email_address": user}, "name")
	if not guardian or not frappe.db.exists("Student Guardian", {"parent": student_id, "guardian": guardian}):
		frappe.throw(_("Permission Denied"), frappe.PermissionError)

	reports = frappe.get_all(
		"School Term Result",
		filters={"student": student_id},
		fields=[
			"name",
			"academic_year",
			"academic_term",
			"program",
			"total_marks_obtained",
			"total_max_marks",
			"term_average",
			"overall_grade",
			"class_position",
			"class_arm_position",
			"assessment_group",
		],
		order_by="academic_year desc",
		ignore_permissions=True,
	)
	return reports


@frappe.whitelist()
def get_ward_awards(student_id):
	user = frappe.session.user
	if user == "Guest" or user == "Administrator":
		frappe.throw(_("Access Denied"), frappe.PermissionError)

	guardian = frappe.db.get_value("Guardian", {"email_address": user}, "name")
	if not guardian or not frappe.db.exists("Student Guardian", {"parent": student_id, "guardian": guardian}):
		frappe.throw(_("Permission Denied"), frappe.PermissionError)

	# Individual certificates
	individual = frappe.get_all(
		"Individual Certificate",
		filters={"awardee": student_id},
		fields=[
			"name",
			"certificate_title",
			"certificate_type",
			"certificate_date",
			"description",
			"academic_year",
			"certificate_file",
		],
		ignore_permissions=True,
	)

	# Bulk certificates (class-wide)
	bulk = frappe.db.sql(
		"""
        SELECT DISTINCT
            bcg.name, bcg.certificate_title, bcg.certificate_type,
            bcg.certificate_date, bcg.description, bcg.certificate_file,
            bcg.class_arm as student_group
        FROM `tabBulk Certificate Generator` bcg
        INNER JOIN `tabBulk Certificate Student` bcs ON bcg.name = bcs.parent
        WHERE bcs.student = %(student)s
            AND bcs.select = 1
            AND bcs.certificate_generated = 1
            AND bcg.docstatus = 1
        ORDER BY bcg.certificate_date DESC
        """,
		{"student": student_id},
		as_dict=True,
	)

	return {
		"individual": individual,
		"general": bulk,
	}


# @frappe.whitelist()
# def get_ward_grades_table(student_id):
# 	user = frappe.session.user
# 	if user == "Guest" or user == "Administrator":
# 		frappe.throw(_("Access Denied"), frappe.PermissionError)

# 	guardian = frappe.db.get_value("Guardian", {"email_address": user}, "name")
# 	if not guardian or not frappe.db.exists("Student Guardian", {"parent": student_id, "guardian": guardian}):
# 		frappe.throw(_("Permission Denied"), frappe.PermissionError)

# 	from education.education.api import get_student_programs

# 	programs = get_student_programs(student_id)

# 	results = frappe.get_all(
# 		"Assessment Result",
# 		filters={"student": student_id, "docstatus": 1},
# 		fields=[
# 			"name",
# 			"student_group",
# 			"course",
# 			"assessment_group",
# 			"total_score",
# 			"maximum_score",
# 			"grade",
# 			"program",
# 		],
# 		ignore_permissions=True,
# 	)

# 	return {
# 		"programs": programs,
# 		"results": results,
# 	}


@frappe.whitelist()
def get_ward_grades_table(student_id):
	user = frappe.session.user
	if user == "Guest" or user == "Administrator":
		frappe.throw(_("Access Denied"), frappe.PermissionError)

	guardian = frappe.db.get_value("Guardian", {"email_address": user}, "name")
	if not guardian or not frappe.db.exists("Student Guardian", {"parent": student_id, "guardian": guardian}):
		frappe.throw(_("Permission Denied"), frappe.PermissionError)

	# Query directly with ignore_permissions instead of reusing get_student_programs
	raw_programs = frappe.db.get_list(
		"Program Enrollment",
		filters={"student": student_id, "docstatus": 1},
		fields=["program", "name"],
		ignore_permissions=True,
	)

	# Deduplicate by program name
	seen = set()
	programs = []
	for p in raw_programs:
		if p.program not in seen:
			seen.add(p.program)
			programs.append(p)

	results = frappe.get_all(
		"Assessment Result",
		filters={"student": student_id, "docstatus": ("!=", 2)},
		fields=[
			"name",
			"student_group",
			"course",
			"assessment_group",
			"total_score",
			"maximum_score",
			"grade",
			"program",
		],
		ignore_permissions=True,
	)

	return {
		"programs": programs,
		"results": results,
	}


@frappe.whitelist()
def get_school_print_format():
	"""Real call site: frontend/src/pages/ward/WardReport.vue's
	getPrintFormatForProgram() POSTs here with NO body/params at all, then
	reads result.message.primary_print_format /
	result.message.secondary_print_format and picks between them itself
	via its own client-side isSecondaryProgram(report.program) keyword
	check -- this function only needs to report the school's two
	configured formats, not decide between them.

	Reads School Settings' primary_school_print_format /
	secondary_school_print_format (Link to Print Format), falling back to
	"Standard" only when the relevant field is genuinely unset."""
	settings = frappe.get_single("School Settings")
	primary = settings.primary_school_print_format or "Standard"
	secondary = settings.secondary_school_print_format or "Standard"
	return {"primary_print_format": primary, "secondary_print_format": secondary}
