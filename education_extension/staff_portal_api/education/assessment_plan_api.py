import json

import frappe
from frappe import _
from frappe.utils import cint


@frappe.whitelist()
def get_assessment_plans(
    page=1,
    page_size=20,
    search=None,
    student_group=None,
    assessment_group=None,
    academic_term=None,
    grading_scale=None,
    room=None,
    course=None,
    supervisor=None,
):
    page = cint(page)
    page_size = cint(page_size)

    filters = {}
    if student_group:
        filters["student_group"] = student_group
    if assessment_group:
        filters["assessment_group"] = assessment_group
    if academic_term:
        filters["academic_term"] = academic_term
    if grading_scale:
        filters["grading_scale"] = grading_scale
    if room:
        filters["room"] = room
    if course:
        filters["course"] = course
    if supervisor:
        filters["supervisor"] = supervisor

    or_filters = []
    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["assessment_name", "like", f"%{search}%"],
        ]

    rows = frappe.get_all(
        "Assessment Plan",
        fields=[
            "name",
            "assessment_name",
            "student_group",
            "assessment_group",
            "course",
            "academic_term",
            "schedule_date",
            "from_time",
            "to_time",
            "maximum_assessment_score",
            "docstatus",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="creation desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count("Assessment Plan", filters=filters)

    return {
        "rows": rows,
        "count": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size else 1,
    }


@frappe.whitelist()
def get_assessment_plan(name):
    if not name:
        frappe.throw(_("Assessment Plan name is required"))

    doc = frappe.get_doc("Assessment Plan", name)
    return doc.as_dict()


@frappe.whitelist()
def create_assessment_plan(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc({
        "doctype": "Assessment Plan",
        "student_group": data.get("student_group"),
        "assessment_name": data.get("assessment_name"),
        "assessment_group": data.get("assessment_group"),
        "grading_scale": data.get("grading_scale"),
        "course": data.get("course"),
        "schedule_date": data.get("schedule_date"),
        "room": data.get("room"),
        "examiner": data.get("examiner"),
        "from_time": data.get("from_time"),
        "to_time": data.get("to_time"),
        "supervisor": data.get("supervisor"),
        "maximum_assessment_score": frappe.utils.flt(data.get("maximum_assessment_score")),
    })
    # program / academic_year / academic_term are intentionally NOT set here
    # -- their fetch_from ("student_group.program" etc) has no fetch_if_empty,
    # so Frappe's own _validate_links() unconditionally overwrites them from
    # student_group on every save regardless of what's sent. They're
    # display-only/derived in the frontend for that reason.

    for row in data.get("assessment_criteria", []):
        if row.get("assessment_criteria"):
            doc.append("assessment_criteria", {
                "assessment_criteria": row.get("assessment_criteria"),
                "maximum_score": frappe.utils.flt(row.get("maximum_score")),
            })

    # doc.validate() runs automatically on insert: schedule overlap checks
    # against Course Schedule/Assessment Plan (student_group/instructor/
    # room/supervisor), sum(assessment_criteria.maximum_score) ==
    # maximum_assessment_score, and duplicate-criteria-vs-other-submitted-
    # plans -- all live-query checks, not duplicated here; errors surface
    # via getErrorMessage().
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def update_assessment_plan(name, data):
    if not name:
        frappe.throw(_("Assessment Plan name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Assessment Plan", name)

    for field in (
        "student_group", "assessment_name", "assessment_group", "grading_scale",
        "course", "schedule_date", "room", "examiner", "from_time", "to_time",
        "supervisor",
    ):
        if field in data:
            doc.set(field, data[field])
    if "maximum_assessment_score" in data:
        doc.set("maximum_assessment_score", frappe.utils.flt(data["maximum_assessment_score"]))

    if "assessment_criteria" in data:
        doc.set("assessment_criteria", [])
        for row in data.get("assessment_criteria", []):
            if row.get("assessment_criteria"):
                doc.append("assessment_criteria", {
                    "assessment_criteria": row.get("assessment_criteria"),
                    "maximum_score": frappe.utils.flt(row.get("maximum_score")),
                })

    # Assessment Plan has NO allow_on_submit fields at all (checked the real
    # JSON -- none of its fields carry that flag), so once submitted, every
    # field is locked by Frappe itself; doc.save() throws if anything here
    # actually changed. The frontend blocks reaching this form at all for a
    # submitted record (see AssessmentPlanFormPage.jsx's redirect guard).
    doc.save()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def delete_assessment_plan(name):
    if not name:
        frappe.throw(_("Assessment Plan name is required"))

    doc = frappe.get_doc("Assessment Plan", name)

    if doc.docstatus == 1:
        frappe.throw(_("Cannot delete a submitted document. Please cancel it first."))

    doc.delete()
    frappe.db.commit()

    return {"message": "Assessment Plan deleted"}


@frappe.whitelist()
def submit_assessment_plan(name):
    if not name:
        frappe.throw(_("Assessment Plan name is required"))

    doc = frappe.get_doc("Assessment Plan", name)

    if doc.docstatus == 1:
        frappe.throw(_("Document is already submitted"))
    if doc.docstatus == 2:
        frappe.throw(_("Cannot submit a cancelled document"))

    doc.submit()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def cancel_assessment_plan(name):
    if not name:
        frappe.throw(_("Assessment Plan name is required"))

    doc = frappe.get_doc("Assessment Plan", name)

    if doc.docstatus == 2:
        frappe.throw(_("Document is already cancelled"))
    if doc.docstatus == 0:
        frappe.throw(_("Cannot cancel a draft document"))

    doc.cancel()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def get_connections(assessment_plan):
    """Mirrors assessment_plan_dashboard.py's get_data(): fieldname
    'assessment_plan', transactions group 'Assessment' -> Assessment Result.
    (Its 'reports' entry, Assessment Plan Status, isn't a count-based
    connection -- see AssessmentPlanProfilePage.jsx.)"""
    if not assessment_plan:
        frappe.throw(_("Assessment Plan name is required"))

    return {
        "assessment_results": frappe.db.count(
            "Assessment Result", {"assessment_plan": assessment_plan}
        ),
    }


@frappe.whitelist()
def get_student_group_details(student_group):
    """Mirrors the real fetch_from targets of student_group on Assessment
    Plan (course, program, academic_year, academic_term) so the frontend
    can preview the same values Frappe will unconditionally set server-side
    on save -- program/academic_year/academic_term always get overwritten
    from here (no fetch_if_empty); course is only a suggestion (fetch_if_empty,
    user can override)."""
    if not student_group:
        return None
    return frappe.db.get_value(
        "Student Group",
        student_group,
        ["course", "program", "academic_year", "academic_term"],
        as_dict=True,
    )


@frappe.whitelist()
def get_course_default_grading_scale(course):
    """Mirrors grading_scale's fetch_from: course.default_grading_scale."""
    if not course:
        return None
    return frappe.db.get_value("Course", course, "default_grading_scale")


@frappe.whitelist()
def get_criteria_template(course, maximum_assessment_score=0):
    """Mirrors assessment_plan.js's course/maximum_assessment_score trigger:
    calls the real education.education.api.get_assessment_criteria(course)
    (reads the Course's own Course Assessment Criteria child table) and
    scales each row's weightage against the given max score, exactly as
    the client script does: maximum_score = (weightage / 100) * max_score."""
    if not course:
        return []

    from education.education.api import get_assessment_criteria

    max_score = frappe.utils.flt(maximum_assessment_score)
    rows = get_assessment_criteria(course)
    return [
        {
            "assessment_criteria": row.get("assessment_criteria"),
            "maximum_score": (frappe.utils.flt(row.get("weightage")) / 100) * max_score,
        }
        for row in rows
    ]


@frappe.whitelist()
def get_student_groups():
    try:
        return frappe.get_all(
            "Student Group", fields=["name", "student_group_name"],
            order_by="student_group_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching class arms: {str(e)}", "Assessment Plan API")
        return []


@frappe.whitelist()
def get_leaf_assessment_groups():
    """Mirrors assessment_plan.js's real set_query on assessment_group:
    filters: { is_group: 0 } -- only leaf (non-container) groups."""
    try:
        return frappe.get_all(
            "Assessment Group", fields=["name", "assessment_group_name"],
            filters={"is_group": 0}, order_by="assessment_group_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching assessment groups: {str(e)}", "Assessment Plan API")
        return []


@frappe.whitelist()
def get_submitted_grading_scales():
    """Mirrors assessment_plan.js's real set_query on grading_scale:
    filters: { docstatus: 1 } -- only submitted grading scales."""
    try:
        return frappe.get_all(
            "Grading Scale", fields=["name", "grading_scale_name"],
            filters={"docstatus": 1}, order_by="grading_scale_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching grading scales: {str(e)}", "Assessment Plan API")
        return []


@frappe.whitelist()
def get_courses_for_program(program=None):
    """Mirrors assessment_plan.js's real set_query on course: filtered to
    the Program's own Program Course rows (education.education.doctype.
    program_enrollment.program_enrollment.get_program_courses), not the
    global Course list."""
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
        frappe.log_error(f"Error fetching courses for program: {str(e)}", "Assessment Plan API")
        return []


@frappe.whitelist()
def get_academic_terms(academic_year=None):
    """Mirrors assessment_plan.js's real set_query on academic_term:
    filters: { academic_year: frm.doc.academic_year }."""
    try:
        filters = {}
        if academic_year:
            filters["academic_year"] = academic_year
        return frappe.get_all(
            "Academic Term", fields=["name"], filters=filters,
            order_by="name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching academic terms: {str(e)}", "Assessment Plan API")
        return []


@frappe.whitelist()
def get_classrooms():
    try:
        return frappe.get_all(
            "Room", fields=["name", "room_name"],
            order_by="room_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching classrooms: {str(e)}", "Assessment Plan API")
        return []


@frappe.whitelist()
def get_instructors():
    try:
        return frappe.get_all(
            "Instructor", fields=["name", "instructor_name"],
            order_by="instructor_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching teachers: {str(e)}", "Assessment Plan API")
        return []


@frappe.whitelist()
def get_assessment_criteria_options():
    try:
        return frappe.get_all(
            "Assessment Criteria", fields=["name"],
            order_by="name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching assessment criteria: {str(e)}", "Assessment Plan API")
        return []
