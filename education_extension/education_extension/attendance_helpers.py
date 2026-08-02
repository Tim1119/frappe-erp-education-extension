"""
attendance_helpers.py
Shared holiday-aware attendance calculation for School Term Result.

Place at: education_extension/education_extension/attendance_helpers.py
"""

import frappe
from datetime import date, timedelta


def count_weekdays(start_date, end_date):
    """Count Mon-Fri days between two dates (inclusive)."""
    if not start_date or not end_date:
        return 0

    if isinstance(start_date, str):
        start_date = date.fromisoformat(str(start_date))
    if isinstance(end_date, str):
        end_date = date.fromisoformat(str(end_date))

    count = 0
    current = start_date
    while current <= end_date:
        if current.weekday() < 5:  # Mon=0 … Fri=4
            count += 1
        current += timedelta(days=1)
    return count


def get_weekday_holidays_in_range(start_date, end_date):
    """
    Find holidays from the Holiday List that:
      1. Fall within [start_date, end_date]
      2. Land on a weekday (Mon-Fri)

    Returns:
        tuple: (holiday_list_name or None, list[dict] of weekday holidays)
    """
    if not start_date or not end_date:
        return None, []

    if isinstance(start_date, str):
        start_date = date.fromisoformat(str(start_date))
    if isinstance(end_date, str):
        end_date = date.fromisoformat(str(end_date))

    # Find Holiday Lists whose date range overlaps with the term period.
    holiday_lists = frappe.db.sql("""
        SELECT name
        FROM `tabHoliday List`
        WHERE from_date <= %s AND to_date >= %s
    """, (end_date, start_date), as_dict=True)

    if not holiday_lists:
        return None, []

    hl_names = [hl.name for hl in holiday_lists]
    # Use the first matching list name for display
    holiday_list_name = ", ".join(hl_names)

    # Get all holiday rows within the term date range
    holidays = frappe.db.sql("""
        SELECT h.holiday_date, h.description
        FROM `tabHoliday` h
        WHERE h.parent IN %s
          AND h.holiday_date BETWEEN %s AND %s
        ORDER BY h.holiday_date
    """, (hl_names, start_date, end_date), as_dict=True)

    # Keep only weekday holidays (exclude Sat=5, Sun=6)
    weekday_holidays = []
    for h in holidays:
        hd = h.holiday_date
        if isinstance(hd, str):
            hd = date.fromisoformat(hd)
        if hd.weekday() < 5:
            weekday_holidays.append({
                "holiday_date": hd,
                "description": h.description
            })

    return holiday_list_name, weekday_holidays


def calculate_attendance_with_holidays(doc):
    """
    Holiday-aware attendance calculation.

    If a Holiday List covering the term exists:
      school_opened = total_workdays - weekday_holidays
    If no Holiday List found (fallback):
      school_opened = present + absent + leave  (old behaviour)
      + sets holiday_list_used = "" so frontend can show a warning

    Sets on doc:
      - holiday_list_used:               name of the Holiday List, or "" if none found
      - total_workdays:                  Mon-Fri count in term
      - weekday_holidays_count:          Holidays on weekdays during term
      - weekday_holiday_details:         Human-readable list for the report card
      - number_of_times_school_opened:   calculated school days
      - number_of_times_present:         from Student Attendance
      - number_of_times_absent:          from Student Attendance
      - number_of_times_on_leave:        from Student Attendance
      - attendance_percentage:           present / school_opened * 100
    """
    start_date = doc.term_start_date
    end_date = doc.term_end_date

    # ── Calendar-based school days ──
    total_workdays = count_weekdays(start_date, end_date)
    holiday_list_name, weekday_holidays = get_weekday_holidays_in_range(start_date, end_date)

    weekday_holidays_count = len(weekday_holidays)

    # Build a readable summary for the report card
    # e.g. "01 May - Workers' Day\n12 Jun - Democracy Day"
    holiday_lines = []
    for h in weekday_holidays:
        hd = h["holiday_date"]
        if isinstance(hd, date):
            formatted = hd.strftime("%d %b")
        else:
            formatted = str(hd)
        holiday_lines.append(f"{formatted} - {h['description']}")

    doc.holiday_list_used = holiday_list_name or ""
    doc.total_workdays = total_workdays
    doc.weekday_holidays_count = weekday_holidays_count
    doc.weekday_holiday_details = "\n".join(holiday_lines) if holiday_lines else ""

    # ── Student's own attendance records ──
    att_filters = {
        "student": doc.student,
        "date": ["between", [start_date, end_date]]
    }

    try:
        doc.number_of_times_present = frappe.db.count(
            "Student Attendance",
            filters={**att_filters, "status": "Present"}
        )
    except Exception:
        doc.number_of_times_present = 0

    try:
        doc.number_of_times_absent = frappe.db.count(
            "Student Attendance",
            filters={**att_filters, "status": "Absent"}
        )
    except Exception:
        doc.number_of_times_absent = 0

    try:
        doc.number_of_times_on_leave = frappe.db.count(
            "Student Attendance",
            filters={**att_filters, "status": "Leave"}
        )
    except Exception:
        doc.number_of_times_on_leave = 0

    # ── School days opened ──
    if holiday_list_name:
        # Holiday list found → calendar-based calculation
        doc.number_of_times_school_opened = total_workdays - weekday_holidays_count
    else:
        # No holiday list → fallback to attendance-based count
        doc.number_of_times_school_opened = (
            (doc.number_of_times_present or 0)
            + (doc.number_of_times_absent or 0)
            + (doc.number_of_times_on_leave or 0)
        )

    # ── Attendance percentage ──
    doc.attendance_percentage = 0
    school_opened = doc.number_of_times_school_opened or 0
    if school_opened > 0:
        doc.attendance_percentage = round(
            ((doc.number_of_times_present or 0) / school_opened) * 100, 2
        )