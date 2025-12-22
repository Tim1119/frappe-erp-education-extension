# Copyright (c) 2024, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.utils import getdate, formatdate, today, get_datetime
from datetime import datetime
import calendar


def execute(filters=None):
	columns = get_columns(filters)
	data = get_data(filters)
	chart = get_chart_data(data, filters)
	
	return columns, data, None, chart


def get_columns(filters):
	columns = [
		{
			"fieldname": "student",
			"label": _("Student ID"),
			"fieldtype": "Link",
			"options": "Student",
			"width": 140
		},
		{
			"fieldname": "student_name",
			"label": _("Student Name"),
			"fieldtype": "Data",
			"width": 180
		},
		{
			"fieldname": "date_of_birth",
			"label": _("Date of Birth"),
			"fieldtype": "Date",
			"width": 110
		}
	]
	
	# Add birth month column only if not filtering by specific month
	if not filters or filters.get('view_type') != 'Specific Month':
		columns.append({
			"fieldname": "birth_month",
			"label": _("Birth Month"),
			"fieldtype": "Data",
			"width": 100
		})
	
	columns.extend([
		{
			"fieldname": "birth_day",
			"label": _("Day"),
			"fieldtype": "Data",
			"width": 60
		},
		{
			"fieldname": "age",
			"label": _("Current Age"),
			"fieldtype": "Int",
			"width": 90
		},
		{
			"fieldname": "days_until_birthday",
			"label": _("Days Until"),
			"fieldtype": "Int",
			"width": 100
		},
		{
			"fieldname": "birthday_this_year",
			"label": _("Next Birthday"),
			"fieldtype": "Date",
			"width": 120
		},
		{
			"fieldname": "class_arm",
			"label": _("Class"),
			"fieldtype": "Data",
			"width": 130
		},
		{
			"fieldname": "guardian_name",
			"label": _("Guardian Name"),
			"fieldtype": "Data",
			"width": 160
		},
		{
			"fieldname": "guardian_mobile",
			"label": _("Guardian Mobile"),
			"fieldtype": "Data",
			"width": 120
		},
		{
			"fieldname": "guardian_email",
			"label": _("Guardian Email"),
			"fieldtype": "Data",
			"width": 170
		}
	])
	
	return columns


def get_data(filters):
	from education_extension.education_extension.doctype.student_birthday_reminder.student_birthday_reminder import (
		calculate_age,
		get_student_current_class,
		get_guardian_info
	)
	
	# Parse filters
	view_type = filters.get("view_type", "Upcoming Birthdays") if filters else "Upcoming Birthdays"
	days = filters.get("days", 30) if filters else 30
	month_filter = filters.get("month") if filters else None
	class_filter = filters.get("class") if filters else None
	
	# Ensure days is an integer
	try:
		days = int(days)
	except:
		days = 30
	
	# Month name to number mapping
	month_map = {
		"January": 1, "February": 2, "March": 3, "April": 4,
		"May": 5, "June": 6, "July": 7, "August": 8,
		"September": 9, "October": 10, "November": 11, "December": 12
	}
	
	# Get all active students with birthdays
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
	
	today_date = datetime.now().date()
	data = []
	
	for student in students:
		if not student.date_of_birth:
			continue
		
		dob = get_datetime(student.date_of_birth).date()
		birth_month_num = dob.month
		birth_month_name = calendar.month_name[birth_month_num]
		birth_day = dob.day
		
		# Filter by specific month if "Specific Month" view is selected
		if view_type == "Specific Month":
			if not month_filter or month_map.get(month_filter) != birth_month_num:
				continue
		
		# Calculate this year's birthday
		try:
			this_year_birthday = dob.replace(year=today_date.year)
		except ValueError:
			# Handle leap year birthdays (Feb 29)
			this_year_birthday = dob.replace(year=today_date.year, day=28)
		
		# If birthday has passed this year, check next year
		if this_year_birthday < today_date:
			try:
				this_year_birthday = dob.replace(year=today_date.year + 1)
			except ValueError:
				this_year_birthday = dob.replace(year=today_date.year + 1, day=28)
		
		# Calculate days until birthday
		days_until = (this_year_birthday - today_date).days
		
		# Apply days filter for "Upcoming Birthdays" view
		if view_type == "Upcoming Birthdays" and days_until > days:
			continue
		
		# Get additional information
		guardian_info = get_guardian_info(student.name)
		class_arm = get_student_current_class(student.name)
		
		# Filter by class if specified
		if class_filter:
			student_class = frappe.db.get_value(
				"Student Group Student",
				{"student": student.name, "parent": class_filter, "active": 1},
				"parent"
			)
			if not student_class:
				continue
		
		current_age = calculate_age(student.date_of_birth)
		
		row_data = {
			"student": student.name,
			"student_name": student.student_name,
			"date_of_birth": student.date_of_birth,
			"birth_month": birth_month_name,
			"birth_day": f"{birth_day}{get_day_suffix(birth_day)}",
			"age": current_age,
			"days_until_birthday": days_until,
			"birthday_this_year": this_year_birthday,
			"class_arm": class_arm or "",
			"guardian_name": guardian_info.get('guardian_name', ''),
			"guardian_mobile": guardian_info.get('guardian_mobile', ''),
			"guardian_email": guardian_info.get('guardian_email', '')
		}
		
		data.append(row_data)
	
	# Sort based on view type
	if view_type == "Specific Month":
		# Sort by day of month for specific month view
		data.sort(key=lambda x: get_datetime(x['date_of_birth']).day)
	else:
		# Sort by days until birthday for upcoming view
		data.sort(key=lambda x: x['days_until_birthday'])
	
	return data

	
def get_day_suffix(day):
	"""Get the ordinal suffix for a day (1st, 2nd, 3rd, etc.)"""
	if 10 <= day % 100 <= 20:
		suffix = 'th'
	else:
		suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(day % 10, 'th')
	return suffix


def get_chart_data(data, filters):
	"""Generate chart data for birthday distribution"""
	if not data:
		return None
	
	view_type = filters.get("view_type", "Upcoming Birthdays") if filters else "Upcoming Birthdays"
	
	# For specific month view, show distribution by day
	if view_type == "Specific Month":
		month_filter = filters.get("month")
		if month_filter:
			# Count birthdays by day
			day_counts = {}
			for row in data:
				day = get_datetime(row['date_of_birth']).day
				day_counts[day] = day_counts.get(day, 0) + 1
			
			# Sort by day
			sorted_days = sorted(day_counts.items())
			
			return {
				"data": {
					"labels": [f"Day {day}" for day, count in sorted_days],
					"datasets": [
						{
							"name": "Number of Birthdays",
							"values": [count for day, count in sorted_days]
						}
					]
				},
				"type": "bar",
				"height": 250,
				"colors": ["#667eea"]
			}
	
	# For other views, show distribution by month
	else:
		month_counts = {}
		for row in data:
			month = row.get('birth_month', 'Unknown')
			month_counts[month] = month_counts.get(month, 0) + 1
		
		# Sort by month order
		month_order = ["January", "February", "March", "April", "May", "June",
					   "July", "August", "September", "October", "November", "December"]
		
		sorted_months = [(m, month_counts.get(m, 0)) for m in month_order if month_counts.get(m, 0) > 0]
		
		if sorted_months:
			return {
				"data": {
					"labels": [month for month, count in sorted_months],
					"datasets": [
						{
							"name": "Number of Birthdays",
							"values": [count for month, count in sorted_months]
						}
					]
				},
				"type": "bar",
				"height": 250,
				"colors": ["#764ba2"]
			}
	
	return None