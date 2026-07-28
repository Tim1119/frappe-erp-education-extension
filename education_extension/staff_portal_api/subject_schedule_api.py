import json

import frappe
from frappe import _
from frappe.utils import cint


@frappe.whitelist()
def get_subject_schedules(
    page=1,
    page_size=20,
    search=None,
    student_group=None,
    instructor=None,
    course=None,
    room=None,
):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    if student_group:
        filters["student_group"] = student_group
    if instructor:
        filters["instructor"] = instructor
    if course:
        filters["course"] = course
    if room:
        filters["room"] = room

    or_filters = []
    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["title", "like", f"%{search}%"],
        ]

    rows = frappe.get_all(
        "Course Schedule",
        fields=[
            "name",
            "title",
            "student_group",
            "instructor",
            "instructor_name",
            "course",
            "room",
            "schedule_date",
            "from_time",
            "to_time",
            "class_schedule_color",
            "color",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="creation desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count("Course Schedule", filters=filters)

    return {
        "rows": rows,
        "count": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (
            (total + page_size - 1) // page_size
            if page_size else 1
        ),
    }


@frappe.whitelist()
def get_subject_schedule(name):
    if not name:
        frappe.throw(_("Subject Schedule name is required"))

    doc = frappe.get_doc("Course Schedule", name)
    return doc.as_dict()


@frappe.whitelist()
def get_connections(subject_schedule):
    """course_schedule.json's own "links" array is empty -- these
    Connections come from course_schedule_dashboard.py's get_data()
    instead, a separate Frappe mechanism (see CLAUDE.md section 4):
    {"fieldname": "course_schedule", "transactions": [{"label": "Attendance",
    "items": ["Student Attendance"]}]}. Student Attendance really does have
    its own "course_schedule" Link field, confirmed against its JSON."""
    if not subject_schedule:
        frappe.throw(_("Subject Schedule name is required"))

    try:
        return {
            "student_attendance": frappe.db.count(
                "Student Attendance", {"course_schedule": subject_schedule}
            ),
        }
    except Exception as e:
        frappe.log_error(
            f"Error fetching connections for {subject_schedule}: {str(e)}",
            "Subject Schedule API",
        )
        return {}


@frappe.whitelist()
def create_subject_schedule(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc({
        "doctype": "Course Schedule",
        "student_group": data.get("student_group"),
        "instructor": data.get("instructor"),
        "course": data.get("course"),
        "schedule_date": data.get("schedule_date"),
        "room": data.get("room"),
        "from_time": data.get("from_time"),
        "to_time": data.get("to_time"),
        "class_schedule_color": data.get("class_schedule_color", "blue"),
    })

    # doc.validate() runs automatically on insert:
    #  - instructor_name auto-filled from Instructor
    #  - title auto-computed as "<course> by <instructor_name>" (set_title)
    #  - validate_course(): if the Class Arm's own Group Based On is
    #    "Course", the course field is silently forced to the Class Arm's
    #    configured course, overriding whatever was submitted here
    #  - validate_date(): schedule_date must fall within the Class Arm's
    #    Academic Term dates (or Academic Year dates if no term is set)
    #  - validate_time(): From Time cannot be later than To Time
    #  - validate_overlap(): live cross-doctype conflict check against
    #    other Course Schedules AND Assessment Plans sharing the same
    #    Class Arm / Teacher / Classroom on the same date -- this is a
    #    real SQL time-range overlap query (see education/education/utils.py
    #    get_overlap_for), too live-data-dependent to mirror client-side,
    #    left entirely server-side like Class/Subject Enrollment's own
    #    duplicate checks. Errors surface via getErrorMessage() as-is.
    #  - before_save() -> set_hex_color(): "color" is always derived from
    #    class_schedule_color via a fixed lookup table, never set directly
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def update_subject_schedule(name, data):
    if not name:
        frappe.throw(_("Subject Schedule name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Course Schedule", name)

    for field in (
        "student_group", "instructor", "course", "schedule_date",
        "room", "from_time", "to_time", "class_schedule_color",
    ):
        if field in data:
            doc.set(field, data[field])

    doc.save()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def delete_subject_schedule(name):
    if not name:
        frappe.throw(_("Subject Schedule name is required"))

    frappe.delete_doc("Course Schedule", name)
    frappe.db.commit()

    return {"message": "Subject Schedule deleted"}


@frappe.whitelist()
def get_student_groups():
    try:
        return frappe.get_all(
            "Student Group",
            fields=[
                "name", "student_group_name", "group_based_on",
                "course", "program", "academic_year", "academic_term",
            ],
            order_by="student_group_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching class arms: {str(e)}", "Subject Schedule API")
        return []


@frappe.whitelist()
def get_instructors():
    try:
        return frappe.get_all(
            "Instructor", fields=["name", "instructor_name"],
            order_by="instructor_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching teachers: {str(e)}", "Subject Schedule API")
        return []


@frappe.whitelist()
def get_courses():
    try:
        return frappe.get_all(
            "Course", fields=["name", "course_name"],
            order_by="course_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching subjects: {str(e)}", "Subject Schedule API")
        return []


@frappe.whitelist()
def get_instructors_for_student_group(student_group):
    """Mirrors course_schedule.js's real onload set_query('instructor', ...),
    whose data comes from education.education.api.get_instructors():
    frappe.get_all("Student Group Instructor", {"parent": student_group},
    pluck="instructor"). Returns [] if the Class Arm has no assigned
    teachers -- the caller falls back to the full unfiltered teacher list
    in that case, matching Desk's own "if (frm.instructors.length) ...
    else return" (no filter applied)."""
    if not student_group:
        return []
    try:
        assigned = frappe.get_all(
            "Student Group Instructor",
            filters={"parent": student_group},
            pluck="instructor",
        )
        if not assigned:
            return []
        return frappe.get_all(
            "Instructor",
            filters={"name": ["in", assigned]},
            fields=["name", "instructor_name"],
            order_by="instructor_name",
        )
    except Exception as e:
        frappe.log_error(f"Error fetching assigned teachers for {student_group}: {str(e)}", "Subject Schedule API")
        return []


@frappe.whitelist()
def get_courses_for_program(program=None):
    """Subjects available for the selected Class Arm's own Class -- mirrors
    course_schedule.js's real onload set_query('course', ...), which calls
    program_enrollment.get_program_courses() filtered by Program Course's
    own parent=program child-table rows (same pattern as
    class_enrollment_api.py's get_courses_for_program). Real Desk behavior
    shows NO course options at all until a Program is known -- there is no
    unfiltered fallback here, unlike the teacher filter above."""
    if not program:
        return []
    try:
        return frappe.get_all(
            "Program Course",
            filters={"parent": program},
            fields=["course", "course_name"],
            order_by="idx",
        )
    except Exception as e:
        frappe.log_error(f"Error fetching subjects for program: {str(e)}", "Subject Schedule API")
        return []


@frappe.whitelist()
def get_rooms():
    try:
        return frappe.get_all(
            "Room", fields=["name", "room_name"],
            order_by="room_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching classrooms: {str(e)}", "Subject Schedule API")
        return []


@frappe.whitelist()
def get_academic_term_bounds(academic_term):
    """Real term_start_date/term_end_date -- mirrors validate_date()'s
    Academic Term branch for the client-side schedule-date hint."""
    if not academic_term:
        return {}
    try:
        return frappe.db.get_value(
            "Academic Term", academic_term,
            ["term_start_date", "term_end_date"], as_dict=True,
        ) or {}
    except Exception as e:
        frappe.log_error(f"Error fetching academic term bounds: {str(e)}", "Subject Schedule API")
        return {}


@frappe.whitelist()
def get_academic_year_bounds(academic_year):
    """Real year_start_date/year_end_date -- mirrors validate_date()'s
    Academic Year branch (used only when the Class Arm has no Academic
    Term set) for the client-side schedule-date hint."""
    if not academic_year:
        return {}
    try:
        return frappe.db.get_value(
            "Academic Year", academic_year,
            ["year_start_date", "year_end_date"], as_dict=True,
        ) or {}
    except Exception as e:
        frappe.log_error(f"Error fetching academic year bounds: {str(e)}", "Subject Schedule API")
        return {}
