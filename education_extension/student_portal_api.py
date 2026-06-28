import frappe
from frappe import _


@frappe.whitelist()
def get_student_reports_with_program():
	"""Returns all School Term Results for the logged-in student."""
	email = frappe.session.user
	if email == "Guest":
		frappe.throw(_("Authentication required"), frappe.AuthenticationError)

	student = frappe.db.get_value("Student", {"user": email}, "name")
	if not student:
		return []

	reports = frappe.db.get_list(
		"School Term Result",
		filters={"student": student, "docstatus": 1},
		fields=[
			"name",
			"student",
			"student_name",
			"program",
			"academic_year",
			"academic_term",
			"assessment_group",
			"total_marks_obtained",
			"total_max_marks",
			"overall_grade",
			"term_average",
			"class_arm_position",
		],
		order_by="academic_year desc, academic_term desc",
	)
	return reports


@frappe.whitelist()
def get_school_print_format():
	"""Returns primary and secondary print formats from School Settings."""
	primary = frappe.db.get_single_value(
		"Education Settings", "primary_print_format"
	) or "Standard"
	secondary = frappe.db.get_single_value(
		"Education Settings", "secondary_print_format"
	) or "Standard"
	return {
		"primary_print_format": primary,
		"secondary_print_format": secondary,
	}


@frappe.whitelist()
def get_individual_awards():
	"""Returns Individual Certificates for the logged-in student."""
	email = frappe.session.user
	if email == "Guest":
		frappe.throw(_("Authentication required"), frappe.AuthenticationError)

	student = frappe.db.get_value("Student", {"user": email}, "name")
	if not student:
		return []

	awards = frappe.db.get_list(
		"Individual Certificate",
		filters={"student": student, "docstatus": 1},
		fields=[
			"name",
			"certificate_title",
			"certificate_date",
			"description",
			"certificate_type",
			"academic_year",
			"certificate_file",
		],
		order_by="certificate_date desc",
	)
	return awards


@frappe.whitelist()
def download_certificate(doctype, award):
	"""Returns the file URL for a certificate download."""
	if doctype == "Individual Certificate":
		file_url = frappe.db.get_value("Individual Certificate", award, "certificate_file")
		if file_url:
			frappe.local.response.update({
				"type": "redirect",
				"location": file_url,
			})
		else:
			frappe.throw(_("No certificate file found"))
	else:
		frappe.throw(_("Invalid doctype"))


@frappe.whitelist()
def get_student_bulk_certificates():
	"""Returns Bulk Certificates for student groups the logged-in student belongs to."""
	email = frappe.session.user
	if email == "Guest":
		frappe.throw(_("Authentication required"), frappe.AuthenticationError)

	student = frappe.db.get_value("Student", {"user": email}, "name")
	if not student:
		return []

	# Get student groups the student belongs to
	student_groups = frappe.db.get_list(
		"Student Group Student",
		filters={"student": student, "active": 1},
		pluck="parent",
	)

	if not student_groups:
		return []

	certificates = frappe.db.get_list(
		"Bulk Certificate",
		filters={"student_group": ["in", student_groups], "docstatus": 1},
		fields=[
			"name",
			"certificate_title",
			"certificate_date",
			"description",
			"certificate_type",
			"academic_year",
			"student_group",
			"certificate_file",
		],
		order_by="certificate_date desc",
	)
	return certificates


@frappe.whitelist()
def get_bulk_certificate_filters():
	"""Returns available filter options for bulk certificates."""
	email = frappe.session.user
	if email == "Guest":
		frappe.throw(_("Authentication required"), frappe.AuthenticationError)

	student = frappe.db.get_value("Student", {"user": email}, "name")
	if not student:
		return {"years": [], "categories": [], "student_groups": []}

	student_groups = frappe.db.get_list(
		"Student Group Student",
		filters={"student": student, "active": 1},
		pluck="parent",
	)

	if not student_groups:
		return {"years": [], "categories": [], "student_groups": []}

	certificates = frappe.db.get_list(
		"Bulk Certificate",
		filters={"student_group": ["in", student_groups], "docstatus": 1},
		fields=["certificate_date", "certificate_type", "student_group", "academic_year"],
	)

	years = sorted(
		list(set(str(c.academic_year) for c in certificates if c.academic_year)),
		reverse=True,
	)
	categories = sorted(list(set(c.certificate_type for c in certificates if c.certificate_type)))
	groups = sorted(list(set(c.student_group for c in certificates if c.student_group)))

	return {
		"years": years,
		"categories": categories,
		"student_groups": groups,
	}