import frappe
from frappe import _


@frappe.whitelist()
def get_student_reports_with_program():
	email = frappe.session.user
	if email == "Guest":
		frappe.throw(_("Authentication required"), frappe.AuthenticationError)
	student = frappe.db.get_value("Student", {"user": email}, "name")
	if not student:
		return []
	reports = frappe.db.get_list(
		"School Term Result",
		filters={"student": student},
		fields=[
			"name", "student", "student_name", "program", "academic_year",
			"academic_term", "assessment_group", "total_marks_obtained",
			"total_max_marks", "overall_grade", "term_average", "class_arm_position",
		],
		order_by="academic_year desc, academic_term desc",
	)
	return reports


@frappe.whitelist()
def get_school_print_format():
	primary = frappe.db.get_single_value("Education Settings", "primary_print_format") or "Standard"
	secondary = frappe.db.get_single_value("Education Settings", "secondary_print_format") or "Standard"
	return {"primary_print_format": primary, "secondary_print_format": secondary}


@frappe.whitelist()
def get_individual_awards():
	email = frappe.session.user
	if email == "Guest":
		frappe.throw(_("Authentication required"), frappe.AuthenticationError)
	student = frappe.db.get_value("Student", {"user": email}, "name")
	if not student:
		return []
	awards = frappe.db.sql("""
		SELECT name, certificate_title, certificate_type, certificate_date,
		       description, academic_year, certificate_file, awardee
		FROM `tabIndividual Certificate`
		WHERE awardee = %(student)s
		ORDER BY certificate_date DESC
	""", {"student": student}, as_dict=True)
	return awards


@frappe.whitelist()
def download_certificate(doctype, award):
	if doctype == "Individual Certificate":
		file_url = frappe.db.get_value("Individual Certificate", award, "certificate_file")
		if file_url:
			frappe.local.response.update({"type": "redirect", "location": file_url})
		else:
			frappe.throw(_("No certificate file found"))
	else:
		frappe.throw(_("Invalid doctype"))


@frappe.whitelist()
def get_student_bulk_certificates():
	email = frappe.session.user
	if email == "Guest":
		frappe.throw(_("Authentication required"), frappe.AuthenticationError)
	student = frappe.db.get_value("Student", {"user": email}, "name")
	if not student:
		return []
	certificates = frappe.db.sql("""
		SELECT DISTINCT
			bcg.name, bcg.certificate_title, bcg.certificate_type,
			bcg.certificate_date, bcg.description, bcg.certificate_file,
			bcg.class_arm as student_group
		FROM `tabBulk Certificate Generator` bcg
		INNER JOIN `tabBulk Certificate Student` bcs ON bcg.name = bcs.parent
		WHERE bcs.student = %(student)s
			AND bcs.select = 1
			AND bcg.docstatus = 1
		ORDER BY bcg.certificate_date DESC
	""", {"student": student}, as_dict=True)
	return certificates


@frappe.whitelist()
def get_bulk_certificate_filters():
	email = frappe.session.user
	if email == "Guest":
		frappe.throw(_("Authentication required"), frappe.AuthenticationError)
	student = frappe.db.get_value("Student", {"user": email}, "name")
	if not student:
		return {"years": [], "categories": [], "student_groups": []}
	years = frappe.db.sql("""
		SELECT DISTINCT YEAR(bcg.certificate_date) as year
		FROM `tabBulk Certificate Generator` bcg
		INNER JOIN `tabBulk Certificate Student` bcs ON bcg.name = bcs.parent
		WHERE bcs.student = %(student)s AND bcs.select = 1 AND bcg.docstatus = 1
		ORDER BY year DESC
	""", {"student": student}, as_dict=True)
	categories = frappe.db.sql("""
		SELECT DISTINCT bcg.certificate_type as category
		FROM `tabBulk Certificate Generator` bcg
		INNER JOIN `tabBulk Certificate Student` bcs ON bcg.name = bcs.parent
		WHERE bcs.student = %(student)s AND bcs.select = 1 AND bcg.docstatus = 1
		ORDER BY category
	""", {"student": student}, as_dict=True)
	student_groups = frappe.db.sql("""
		SELECT DISTINCT bcg.class_arm as student_group
		FROM `tabBulk Certificate Generator` bcg
		INNER JOIN `tabBulk Certificate Student` bcs ON bcg.name = bcs.parent
		WHERE bcs.student = %(student)s AND bcs.select = 1 AND bcg.docstatus = 1
		ORDER BY student_group
	""", {"student": student}, as_dict=True)
	return {
		"years": [str(y.year) for y in years if y.year],
		"categories": [c.category for c in categories if c.category],
		"student_groups": [sg.student_group for sg in student_groups if sg.student_group],
	}