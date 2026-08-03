"""
Staff Portal — Dashboard API
=============================

Single endpoint that returns every stat the dashboard needs,
using server-side frappe.db calls (no field-permission issues).
"""

import frappe
from frappe import _
from datetime import date, timedelta


@frappe.whitelist()
def get_dashboard_stats():
    today = date.today()

    students = frappe.db.count("Student")
    teachers = frappe.db.count("Instructor")
    groups = frappe.db.count("Student Group")
    assessments = frappe.db.count("Assessment Plan")
    results = frappe.db.count("Assessment Result")

    att_today = frappe.db.count("Student Attendance", {"date": today})
    present_today = frappe.db.count("Student Attendance", {
        "date": today,
        "status": "Present",
    })

    trend = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        total = frappe.db.count("Student Attendance", {"date": d})
        present = frappe.db.count("Student Attendance", {
            "date": d,
            "status": "Present",
        })
        trend.append({
            "date": str(d),
            "total": total,
            "present": present,
        })

    recent_students = frappe.get_all(
        "Student",
        fields=["name", "student_name", "image", "enabled", "creation"],
        order_by="creation desc",
        limit_page_length=5,
    )

    return {
        "students": students,
        "teachers": teachers,
        "groups": groups,
        "assessments": assessments,
        "results": results,
        "att_today": att_today,
        "present_today": present_today,
        "trend": trend,
        "recent_students": recent_students,
    }