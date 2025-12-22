# Copyright (c) 2024, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import today, add_days, formatdate, get_datetime
from datetime import datetime


class StudentBirthdayReminder(Document):
	pass


def send_birthday_reminders():
	"""
	Scheduled function to check for student birthdays and send reminders
	This should be called daily via a scheduled job
	"""
	
	# Check if birthday reminders are enabled
	if not frappe.db.exists("Student Birthday Reminder", "Student Birthday Reminder"):
		return
	
	settings = frappe.get_doc("Student Birthday Reminder", "Student Birthday Reminder")
	
	if not settings.enabled:
		return
	
	# Calculate the target date based on days_in_advance
	target_date = add_days(today(), settings.days_in_advance or 0)
	
	# Get students with birthdays on target date
	students = get_students_with_birthday(target_date)
	
	if not students:
		return
	
	# Send notifications and emails
	for student in students:
		if settings.send_notification:
			send_notification_alert(student, settings)
		
		if settings.send_email:
			send_email_alert(student, settings)
	
	# Log the birthday reminder
	frappe.logger().info(f"Birthday reminders sent for {len(students)} students")


def get_students_with_birthday(target_date):
	"""
	Get all active students whose birthday falls on the target date
	"""
	target_datetime = get_datetime(target_date)
	target_month = target_datetime.month
	target_day = target_datetime.day
	
	# Get base student fields
	students = frappe.db.sql("""
		SELECT 
			name, 
			student_name, 
			first_name,
			middle_name,
			last_name,
			date_of_birth,
			student_email_id,
			student_mobile_number
		FROM `tabStudent`
		WHERE enabled = 1
		AND date_of_birth IS NOT NULL
		AND MONTH(date_of_birth) = %s
		AND DAY(date_of_birth) = %s
		ORDER BY student_name
	""", (target_month, target_day), as_dict=True)
	
	# Enrich with guardian information
	for student in students:
		guardian_info = get_guardian_info(student.name)
		student.update(guardian_info)
	
	return students


def get_guardian_info(student_id):
	"""
	Get guardian information for a student
	Handles different guardian field structures in ERPNext/Education module
	"""
	guardian_info = {
		'guardian_name': None,
		'guardian_email': None,
		'guardian_mobile': None
	}
	
	try:
		# Get student document
		student_doc = frappe.get_doc("Student", student_id)
		
		# Check for guardians child table
		if hasattr(student_doc, 'guardians') and student_doc.guardians:
			# Get primary guardian (first one)
			primary_guardian = student_doc.guardians[0]
			
			if hasattr(primary_guardian, 'guardian'):
				# Get Guardian document
				guardian_doc = frappe.get_doc("Guardian", primary_guardian.guardian)
				guardian_info['guardian_name'] = guardian_doc.guardian_name if hasattr(guardian_doc, 'guardian_name') else None
				guardian_info['guardian_email'] = guardian_doc.email_address if hasattr(guardian_doc, 'email_address') else None
				guardian_info['guardian_mobile'] = guardian_doc.mobile_number if hasattr(guardian_doc, 'mobile_number') else None
		
		# Fallback to direct fields if they exist
		if not guardian_info['guardian_name'] and hasattr(student_doc, 'guardian_name'):
			guardian_info['guardian_name'] = student_doc.guardian_name
		
		if not guardian_info['guardian_email'] and hasattr(student_doc, 'guardian_email_primary'):
			guardian_info['guardian_email'] = student_doc.guardian_email_primary
			
		if not guardian_info['guardian_mobile'] and hasattr(student_doc, 'guardian_mobile_number'):
			guardian_info['guardian_mobile'] = student_doc.guardian_mobile_number
			
	except Exception as e:
		frappe.log_error(f"Error getting guardian info for {student_id}: {str(e)}")
	
	return guardian_info


def send_notification_alert(student, settings):
	"""
	Send a system notification for student birthday
	"""
	try:
		# Default message if not configured
		message = settings.notification_message or "🎉 It's {student_name}'s birthday today!"
		message = message.format(
			student_name=student.student_name or student.first_name,
			student_id=student.name
		)
		
		# Get users to notify (System Managers and Academics Users)
		users = frappe.get_all(
			"Has Role",
			filters={
				"role": ["in", ["System Manager", "Academics User"]],
				"parenttype": "User"
			},
			fields=["parent"],
			distinct=True
		)
		
		# Send notification to each user
		for user in users:
			notification = frappe.get_doc({
				"doctype": "Notification Log",
				"subject": f"🎂 Birthday: {student.student_name}",
				"email_content": message,
				"for_user": user.parent,
				"document_type": "Student",
				"document_name": student.name,
				"type": "Alert"
			})
			notification.insert(ignore_permissions=True)
		
		frappe.db.commit()
		
	except Exception as e:
		frappe.log_error(f"Failed to send birthday notification for {student.name}: {str(e)}")


def send_email_alert(student, settings):
	"""
	Send email alert for student birthday
	"""
	try:
		recipients = []
		
		# 1. Add the student's email if available
		if student.get('student_email_id'):
			recipients.append(student.student_email_id)
		
		# 2. Add guardian email if available
		if student.get('guardian_email'):
			recipients.append(student.guardian_email)
		
		# 3. Add additional recipients from settings (admins, teachers, etc.)
		if settings.recipients:
			admin_emails = [email.strip() for email in settings.recipients.split(",") if email.strip()]
			recipients.extend(admin_emails)
		
		# Remove duplicates
		recipients = list(set(recipients))
		
		if not recipients:
			frappe.log_error(
				f"No email recipients found for student {student.name}",
				"Birthday Email Skipped"
			)
			return
		
		# Calculate age
		age = calculate_age(student.date_of_birth)
		
		# Get student's current class
		current_class = get_student_current_class(student.name)
		
		# Prepare context for email template
		context = {
			"student_name": student.student_name or f"{student.first_name} {student.get('last_name') or ''}",
			"first_name": student.first_name,
			"student_id": student.name,
			"age": age,
			"date_of_birth": formatdate(student.date_of_birth),
			"guardian_name": student.get('guardian_name') or "Parent/Guardian",
			"school_name": settings.company or "School",
			"class": current_class or "N/A",
			"student_mobile": student.get('student_mobile_number') or "",
			"guardian_mobile": student.get('guardian_mobile') or ""
		}
		
		# Determine if this is going to the student or guardian
		is_student_email = student.get('student_email_id') in recipients
		is_guardian_email = student.get('guardian_email') in recipients
		
		# Use custom template or default
		if settings.email_template:
			email_template = frappe.get_doc("Email Template", settings.email_template)
			subject = frappe.render_template(email_template.subject, context)
			message = frappe.render_template(email_template.response, context)
		else:
			# Use different templates for student vs guardian/admin
			if is_student_email and len(recipients) == 1:
				# Email is only going to the student
				subject = f"🎉 Happy Birthday {context['first_name']}!"
				message = get_student_birthday_email(context)
			else:
				# Email is going to guardian/admin
				subject = f"🎂 Birthday Reminder: {context['student_name']}"
				message = get_guardian_birthday_email(context)
		
		# Send email
		frappe.sendmail(
			recipients=recipients,
			subject=subject,
			message=message,
			reference_doctype="Student",
			reference_name=student.name
		)
		
		# Log successful send
		frappe.logger().info(f"Birthday email sent for {student.name} to {', '.join(recipients)}")
		
	except Exception as e:
		frappe.log_error(
			f"Failed to send birthday email for {student.name}: {str(e)}",
			"Birthday Email Error"
		)


def calculate_age(date_of_birth):
	"""
	Calculate age from date of birth
	"""
	if not date_of_birth:
		return None
	
	today_date = datetime.now().date()
	birth_date = get_datetime(date_of_birth).date()
	
	age = today_date.year - birth_date.year
	
	# Adjust if birthday hasn't occurred this year yet
	if (today_date.month, today_date.day) < (birth_date.month, birth_date.day):
		age -= 1
	
	return age


def get_student_current_class(student):
	"""Get student's current class/student group"""
	current_class = frappe.db.sql("""
		SELECT sg.student_group_name
		FROM `tabStudent Group` sg
		JOIN `tabStudent Group Student` sgs ON sgs.parent = sg.name
		WHERE sgs.student = %s
		AND sg.group_based_on = 'Batch'
		AND sgs.active = 1
		ORDER BY sg.creation DESC
		LIMIT 1
	""", (student,), as_dict=True)
	
	return current_class[0].student_group_name if current_class else None


def get_student_birthday_email(context):
	"""
	Birthday email template for the student themselves
	"""
	return f"""
	<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
		<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
			<h1 style="margin: 0; font-size: 48px;">🎉🎂🎈</h1>
			<h2 style="margin: 20px 0 0 0; font-size: 32px;">Happy Birthday!</h2>
		</div>
		
		<div style="background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px;">
			<h2 style="color: #333; margin-top: 0; text-align: center;">
				Dear {context['first_name']},
			</h2>
			
			<p style="font-size: 18px; color: #555; line-height: 1.8; text-align: center;">
				Wishing you a wonderful birthday filled with joy, laughter, and amazing moments! 🎊
			</p>
			
			<div style="background: white; padding: 30px; border-radius: 10px; margin: 30px 0; text-align: center; border: 2px dashed #667eea;">
				<h3 style="color: #667eea; margin: 0 0 10px 0;">You're turning {context['age']} today!</h3>
				<p style="color: #999; margin: 0; font-size: 14px;">May this year bring you success and happiness!</p>
			</div>
			
			<p style="font-size: 16px; color: #555; line-height: 1.6; text-align: center;">
				From all of us at <strong>{context['school_name']}</strong>, we hope you have an incredible day! 🌟
			</p>
			
			<div style="text-align: center; margin-top: 30px;">
				<p style="font-size: 14px; color: #777;">
					<em>"The more you praise and celebrate your life, the more there is in life to celebrate!"</em>
				</p>
			</div>
		</div>
		
		<div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
			This is an automated birthday wish from {context['school_name']}
		</div>
	</div>
	"""


def get_guardian_birthday_email(context):
	"""
	Birthday reminder email template for guardians and administrators
	"""
	return f"""
	<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
		<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
			<h1 style="margin: 0; font-size: 32px;">🎉 Birthday Reminder 🎉</h1>
		</div>
		
		<div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
			<h2 style="color: #333; margin-top: 0;">Dear {context['guardian_name']},</h2>
			
			<p style="font-size: 16px; color: #555; line-height: 1.6;">
				We would like to wish <strong>{context['student_name']}</strong> a very Happy Birthday! 🎂
			</p>
			
			<div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
				<p style="margin: 5px 0; color: #333;">
					<strong>Student Name:</strong> {context['student_name']}<br>
					<strong>Student ID:</strong> {context['student_id']}<br>
					<strong>Class:</strong> {context['class']}<br>
					<strong>Turning:</strong> {context['age']} years old 🎈
				</p>
			</div>
			
			<p style="font-size: 16px; color: #555; line-height: 1.6;">
				May this special day bring lots of joy, happiness, and wonderful memories. 
				We wish {context['student_name']} continued success in all academic endeavors!
			</p>
			
			<div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
				<p style="margin: 0; color: #856404; font-size: 14px;">
					💡 <strong>Tip:</strong> Make this day extra special by celebrating with family and friends!
				</p>
			</div>
			
			<p style="font-size: 14px; color: #777; margin-top: 30px;">
				Warm regards,<br>
				<strong>{context['school_name']}</strong>
			</p>
		</div>
		
		<div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
			This is an automated birthday reminder from {context['school_name']}
		</div>
	</div>
	"""


@frappe.whitelist()
def get_upcoming_birthdays(days=30):
	"""
	Get list of upcoming birthdays in the next X days
	"""
	from datetime import timedelta
	
	today_date = datetime.now().date()
	upcoming_students = []
	
	# Get all active students with birthdays - only base fields
	students = frappe.get_all(
		"Student",
		filters={"enabled": 1, "date_of_birth": ["!=", ""]},
		fields=[
			"name", 
			"student_name", 
			"date_of_birth", 
			"student_email_id"
		]
	)
	
	for student in students:
		if not student.date_of_birth:
			continue
		
		dob = get_datetime(student.date_of_birth).date()
		
		# Calculate this year's birthday
		this_year_birthday = dob.replace(year=today_date.year)
		
		# If birthday has passed this year, check next year
		if this_year_birthday < today_date:
			this_year_birthday = dob.replace(year=today_date.year + 1)
		
		# Calculate days until birthday
		days_until = (this_year_birthday - today_date).days
		
		if 0 <= days_until <= int(days):
			# Get guardian info
			guardian_info = get_guardian_info(student.name)
			
			student['days_until_birthday'] = days_until
			student['birthday_this_year'] = this_year_birthday
			student['age_turning'] = calculate_age(student.date_of_birth) if days_until == 0 else calculate_age(student.date_of_birth) + 1
			student['guardian_name'] = guardian_info.get('guardian_name')
			student['guardian_email'] = guardian_info.get('guardian_email')
			student['guardian_mobile'] = guardian_info.get('guardian_mobile')
			
			upcoming_students.append(student)
	
	# Sort by days until birthday
	upcoming_students.sort(key=lambda x: x['days_until_birthday'])
	
	return upcoming_students


@frappe.whitelist()
def send_manual_birthday_wish(student):
	"""
	Manually trigger a birthday wish for a specific student
	"""
	if not frappe.db.exists("Student Birthday Reminder", "Student Birthday Reminder"):
		frappe.throw(_("Birthday Reminder settings not found"))
	
	settings = frappe.get_doc("Student Birthday Reminder", "Student Birthday Reminder")
	
	if not settings.enabled:
		frappe.throw(_("Birthday Reminders are not enabled"))
	
	# Get student details with guardian info
	student_data = frappe.db.get_value(
		"Student", 
		student, 
		["name", "student_name", "first_name", "middle_name", "last_name", "date_of_birth", "student_email_id", "student_mobile_number"],
		as_dict=True
	)
	
	if not student_data:
		frappe.throw(_("Student not found"))
	
	# Get guardian info
	guardian_info = get_guardian_info(student)
	student_data.update(guardian_info)
	
	# Send email
	if settings.send_email:
		send_email_alert(student_data, settings)
		frappe.msgprint(_("Birthday email sent successfully!"))
	else:
		frappe.msgprint(_("Email sending is disabled in Birthday Reminder settings"))