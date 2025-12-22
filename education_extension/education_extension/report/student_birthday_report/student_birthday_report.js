// Copyright (c) 2024, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.query_reports["Student Birthday Report"] = {
	"filters": [
		{
			"fieldname": "view_type",
			"label": __("View By"),
			"fieldtype": "Select",
			"options": "Upcoming Birthdays\nSpecific Month\nAll Students",
			"default": "Upcoming Birthdays",
			"reqd": 1
		},
		{
			"fieldname": "days",
			"label": __("Days Ahead"),
			"fieldtype": "Int",
			"default": 30,
			"depends_on": "eval:frappe.query_report.get_filter_value('view_type')=='Upcoming Birthdays'"
		},
		{
			"fieldname": "month",
			"label": __("Select Month"),
			"fieldtype": "Select",
			"options": "January\nFebruary\nMarch\nApril\nMay\nJune\nJuly\nAugust\nSeptember\nOctober\nNovember\nDecember",
			"depends_on": "eval:frappe.query_report.get_filter_value('view_type')=='Specific Month'"
		},
		{
			"fieldname": "class",
			"label": __("Class (Optional)"),
			"fieldtype": "Link",
			"options": "Student Group"
		}
	],
	
	"formatter": function(value, row, column, data, default_formatter) {
		value = default_formatter(value, row, column, data);
		
		// Highlight today's birthdays
		if (column.fieldname == "days_until_birthday" && data && data.days_until_birthday === 0) {
			value = `<span style="color: #16a34a; font-weight: bold;">${value} 🎉</span>`;
		}
		
		// Highlight this week's birthdays
		if (column.fieldname == "days_until_birthday" && data && data.days_until_birthday > 0 && data.days_until_birthday <= 7) {
			value = `<span style="color: #f59e0b; font-weight: bold;">${value}</span>`;
		}
		
		return value;
	}
};