import json

import frappe
from frappe import _


@frappe.whitelist()
def schedule_course(data, days):
    if isinstance(data, str):
        data = json.loads(data)
    if isinstance(days, str):
        days = json.loads(days)

    if not days:
        frappe.throw(_("Please select at least one day to schedule the course."))

    # Course Scheduling Tool is a Single doctype -- Desk itself never saves
    # it (course_scheduling_tool.js calls frm.disable_save()); the field
    # values only ever live in memory for the duration of this one call.
    doc = frappe.get_doc("Course Scheduling Tool")
    doc.update({
        "student_group": data.get("student_group"),
        "course": data.get("course"),
        "program": data.get("program"),
        "academic_year": data.get("academic_year"),
        "academic_term": data.get("academic_term"),
        "instructor": data.get("instructor"),
        "room": data.get("room"),
        "from_time": data.get("from_time"),
        "to_time": data.get("to_time"),
        "course_start_date": data.get("course_start_date"),
        "course_end_date": data.get("course_end_date"),
        "reschedule": data.get("reschedule", 0),
        "class_schedule_color": data.get("class_schedule_color"),
    })

    # doc.schedule_course(days) is the REAL, unmodified controller logic
    # (course_scheduling_tool.py) -- not reimplemented here:
    #  - validate_mandatory()/validate_date(): required-field checks and
    #    course_start_date <= course_end_date
    #  - if the Class Arm's own Group Based On is "Course", course gets
    #    forced to the Class Arm's configured Subject (same rule as
    #    Course Schedule's own validate_course())
    #  - if reschedule is checked, deletes existing Course Schedule
    #    records in range on the selected days first
    #  - loops every date in [course_start_date, course_end_date) --
    #    note course_end_date itself is NOT included, a real quirk of the
    #    controller's own "while date < self.course_end_date" -- whose
    #    weekday matches a selected day, creating + saving a real Course
    #    Schedule for each. Each .save() runs Course Schedule's own full
    #    validate() chain, including the live validate_overlap() conflict
    #    check already documented for the Subject Schedule module, so
    #    conflicts are caught per-date, not skipped. Only OverlapError is
    #    caught per-date though -- any OTHER validation failure (e.g. a
    #    bad from_time/to_time order) raises uncaught and aborts the
    #    whole call, which is exactly why the frontend mirrors those
    #    checks client-side before ever calling this.
    result = doc.schedule_course(days)
    frappe.db.commit()

    return result
