frappe.query_reports["School Term Master Report"] = {
    "filters": [
        {
            "fieldname": "academic_year",
            "label": __("Academic Year"),
            "fieldtype": "Link",
            "options": "Academic Year",
            "reqd": 1
        },
        {
            "fieldname": "academic_term",
            "label": __("Academic Term"),
            "fieldtype": "Link",
            "options": "Academic Term",
            "reqd": 1
        },
        {
            "fieldname": "assessment_group",
            "label": __("Assessment Group"),
            "fieldtype": "Link",
            "options": "Assessment Group",
            "reqd": 1
        },
        {
            "fieldname": "student_group",
            "label": __("Class / Student Group"),
            "fieldtype": "Link",
            "options": "Student Group",
            "reqd": 1
        }
    ]
};
