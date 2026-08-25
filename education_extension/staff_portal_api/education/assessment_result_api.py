import json

import frappe
from frappe import _
from frappe.utils import cint, flt

from education_extension.staff_portal_api.permissions import (
    ensure_doctype_permission,
)


@frappe.whitelist()
def get_assessment_results(
    page=1,
    page_size=20,
    search=None,
    assessment_plan=None,
    program=None,
    course=None,
    academic_year=None,
    academic_term=None,
    assessment_group=None,
    grading_scale=None,
    student=None,
    student_group=None,
):
    page = cint(page)
    page_size = cint(page_size)

    ensure_doctype_permission("Assessment Result", "read")

    filters = {}
    if assessment_plan:
        filters["assessment_plan"] = assessment_plan
    if program:
        filters["program"] = program
    if course:
        filters["course"] = course
    if academic_year:
        filters["academic_year"] = academic_year
    if academic_term:
        filters["academic_term"] = academic_term
    if assessment_group:
        filters["assessment_group"] = assessment_group
    if grading_scale:
        filters["grading_scale"] = grading_scale
    if student:
        filters["student"] = student
    if student_group:
        filters["student_group"] = student_group

    or_filters = []
    if search:
        or_filters = [
            ["name", "like", f"%{search}%"],
            ["student_name", "like", f"%{search}%"],
        ]

    rows = frappe.get_list(
        "Assessment Result",
        fields=[
            "name",
            "assessment_plan",
            "student",
            "student_name",
            "course",
            "student_group",
            "total_score",
            "maximum_score",
            "grade",
            "docstatus",
        ],
        filters=filters,
        or_filters=or_filters,
        order_by="creation desc",
        start=(page - 1) * page_size,
        page_length=page_size,
    )

    total = frappe.db.count("Assessment Result", filters=filters)

    return {
        "rows": rows,
        "count": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size else 1,
    }


@frappe.whitelist()
def get_assessment_result(name):
    if not name:
        frappe.throw(_("Assessment Result name is required"))

    doc = frappe.get_doc("Assessment Result", name)
    ensure_doctype_permission("Assessment Result", "read", doc)
    return doc.as_dict()


@frappe.whitelist()
def create_assessment_result(data):
    ensure_doctype_permission("Assessment Result", "create")
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc({
        "doctype": "Assessment Result",
        "assessment_plan": data.get("assessment_plan"),
        "student": data.get("student"),
        "comment": data.get("comment"),
    })
    # program / course / academic_year / academic_term / student_group /
    # assessment_group / grading_scale / maximum_score are intentionally
    # NOT set here -- all of them fetch_from assessment_plan.* with no
    # fetch_if_empty, so Frappe unconditionally overwrites them on every
    # save regardless of what's sent. They're display-only/derived in the
    # frontend for that reason (same treatment as Assessment Plan's own
    # program/academic_year/academic_term).

    for row in data.get("details", []):
        if row.get("assessment_criteria"):
            doc.append("details", {
                "assessment_criteria": row.get("assessment_criteria"),
                "score": flt(row.get("score")),
            })
    # maximum_score and grade per row are also always backend-derived (see
    # validate_maximum_score()/validate_grade() in assessment_result.py) --
    # not sent here either.

    # doc.validate() runs automatically on insert: confirms the student
    # actually belongs to the Assessment Plan's student_group, re-derives
    # each row's maximum_score from the Assessment Plan's own criteria and
    # rejects a score exceeding it, computes total_score/grade per row and
    # overall via the linked Grading Scale, and blocks a duplicate result
    # for the same student+assessment_plan -- all live-query-dependent,
    # not duplicated here; errors surface via getErrorMessage().
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def update_assessment_result(name, data):
    if not name:
        frappe.throw(_("Assessment Result name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Assessment Result", name)
    ensure_doctype_permission("Assessment Result", "write", doc)

    for field in ("assessment_plan", "student", "comment"):
        if field in data:
            doc.set(field, data[field])

    if "details" in data:
        doc.set("details", [])
        for row in data.get("details", []):
            if row.get("assessment_criteria"):
                doc.append("details", {
                    "assessment_criteria": row.get("assessment_criteria"),
                    "score": flt(row.get("score")),
                })

    # Assessment Result has no allow_on_submit fields at all (checked the
    # real JSON -- none carry that flag), so once submitted every field is
    # locked by Frappe itself; the frontend blocks reaching this form for a
    # submitted record (see AssessmentResultFormPage.jsx's redirect guard).
    doc.save()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def delete_assessment_result(name):
    if not name:
        frappe.throw(_("Assessment Result name is required"))

    doc = frappe.get_doc("Assessment Result", name)
    ensure_doctype_permission("Assessment Result", "delete", doc)

    if doc.docstatus == 1:
        frappe.throw(_("Cannot delete a submitted document. Please cancel it first."))

    doc.delete()
    frappe.db.commit()

    return {"message": "Assessment Result deleted"}


@frappe.whitelist()
def submit_assessment_result(name):
    if not name:
        frappe.throw(_("Assessment Result name is required"))

    doc = frappe.get_doc("Assessment Result", name)
    ensure_doctype_permission("Assessment Result", "submit", doc)

    if doc.docstatus == 1:
        frappe.throw(_("Document is already submitted"))
    if doc.docstatus == 2:
        frappe.throw(_("Cannot submit a cancelled document"))

    doc.submit()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def cancel_assessment_result(name):
    if not name:
        frappe.throw(_("Assessment Result name is required"))

    doc = frappe.get_doc("Assessment Result", name)
    ensure_doctype_permission("Assessment Result", "cancel", doc)

    if doc.docstatus == 2:
        frappe.throw(_("Document is already cancelled"))
    if doc.docstatus == 0:
        frappe.throw(_("Cannot cancel a draft document"))

    doc.cancel()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def get_submitted_assessment_plans():
    """Mirrors assessment_result.js's real onload set_query on
    assessment_plan: filters: { docstatus: 1 } -- only submitted plans."""
    try:
        filters = {"docstatus": 1}
        return frappe.get_list(
            "Assessment Plan", fields=["name", "assessment_name"],
            filters=filters, order_by="creation desc", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching assessment plans: {str(e)}", "Assessment Result API")
        return []


@frappe.whitelist()
def get_assessment_plan_details(assessment_plan):
    """Mirrors the real fetch_from targets of assessment_plan on Assessment
    Result (program, course, academic_year, academic_term, student_group,
    assessment_group, grading_scale, maximum_score) so the frontend can
    preview what Frappe will unconditionally set server-side on save."""
    if not assessment_plan:
        return None
    return frappe.db.get_value(
        "Assessment Plan",
        assessment_plan,
        [
            "program", "course", "academic_year", "academic_term",
            "student_group", "assessment_group", "grading_scale",
            "maximum_assessment_score",
        ],
        as_dict=True,
    )


@frappe.whitelist()
def get_assessment_criteria_for_plan(assessment_plan):
    """Real Desk behavior (assessment_result.js's assessment_plan trigger):
    calls education.education.api.get_assessment_details(assessment_plan)
    to read the Plan's own Assessment Plan Criteria rows and clears/
    repopulates the Result's own "details" child table from them -- the
    grid itself has cannot_add_rows = true in Desk, rows only ever come
    from here, never added manually."""
    if not assessment_plan:
        return []

    from education.education.api import get_assessment_details

    rows = get_assessment_details(assessment_plan)
    return [
        {"assessment_criteria": row.get("assessment_criteria"), "maximum_score": row.get("maximum_score")}
        for row in rows
    ]


@frappe.whitelist()
def get_grading_scale_intervals(grading_scale):
    """Same source data education.education.api.get_grade() itself reads,
    used here to compute a live grade preview client-side (highest
    threshold <= percentage) without a round trip per keystroke."""
    if not grading_scale:
        return []
    try:
        return frappe.get_all(
            "Grading Scale Interval",
            fields=["grade_code", "threshold"],
            filters={"parent": grading_scale},
            order_by="threshold desc",
        )
    except Exception as e:
        frappe.log_error(f"Error fetching grading scale intervals: {str(e)}", "Assessment Result API")
        return []


@frappe.whitelist()
def get_students_for_class_arm(student_group):
    """The Student picker on Create Assessment Result must only offer
    students actually enrolled in the Assessment Plan's own Class Arm --
    the same roster Class Arm's own profile page shows ("X enrolled"),
    and the exact same active-only Student Group Student query
    assessment_result.py's validate_student_belongs_to_group() itself
    checks against on save. Reuses the real, already-whitelisted
    education.education.api.get_student_group_students() directly rather
    than re-querying Student Group Student here."""
    if not student_group:
        return []
    from education.education.api import get_student_group_students

    try:
        rows = get_student_group_students(student_group)
        # get_student_group_students() returns {student, student_name} --
        # real Student Group Student fieldnames. Every SearchableSelect
        # picker in this app (including this one) keys off `.name` for
        # both React's list key and onChange's selected value, so without
        # this remap onChange(opt.name) fires with undefined for every row.
        return [
            {"name": row.get("student"), "student_name": row.get("student_name")}
            for row in rows
        ]
    except Exception as e:
        frappe.log_error(f"Error fetching class arm roster: {str(e)}", "Assessment Result API")
        return []


@frappe.whitelist()
def get_programs():
    try:
        return frappe.get_list("Program", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching classes: {str(e)}", "Assessment Result API")
        return []


@frappe.whitelist()
def get_courses():
    try:
        return frappe.get_list(
            "Course", fields=["name", "course_name"],
            order_by="course_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching subjects: {str(e)}", "Assessment Result API")
        return []


@frappe.whitelist()
def get_academic_years():
    try:
        return frappe.get_list(
            "Academic Year", fields=["name"], order_by="name desc", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching academic years: {str(e)}", "Assessment Result API")
        return []


@frappe.whitelist()
def get_academic_terms():
    try:
        return frappe.get_list("Academic Term", fields=["name"], order_by="name", limit_page_length=500)
    except Exception as e:
        frappe.log_error(f"Error fetching academic terms: {str(e)}", "Assessment Result API")
        return []


@frappe.whitelist()
def get_leaf_assessment_groups():
    try:
        return frappe.get_list(
            "Assessment Group", fields=["name", "assessment_group_name"],
            filters={"is_group": 0}, order_by="assessment_group_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching assessment groups: {str(e)}", "Assessment Result API")
        return []


@frappe.whitelist()
def get_submitted_grading_scales():
    try:
        return frappe.get_list(
            "Grading Scale", fields=["name", "grading_scale_name"],
            filters={"docstatus": 1}, order_by="grading_scale_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching grading scales: {str(e)}", "Assessment Result API")
        return []
