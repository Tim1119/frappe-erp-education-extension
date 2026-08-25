import frappe
from frappe import _

# Real Frappe "Tool" doctype (issingle: 1, hide_toolbar: 1) -- confirmed
# from the real JSON, same pattern as Subject Scheduling Tool and Student
# Attendance Tool. Unlike those two, there is NO single bulk-save button
# in the real UI: education.education.api.mark_assessment_result() is
# called PER STUDENT, automatically, the instant all of that student's
# criteria scores are filled in -- each such call is its own independent
# request/transaction. A SEPARATE, manual "Submit" action
# (submit_assessment_results()) then bulk-submits whichever of those
# already-saved DRAFT results still exist for the group. All real
# functions below are reused directly via thin wrappers, not
# reimplemented.


@frappe.whitelist()
def get_assessment_plans():
    """No docstatus filter here -- confirmed from the real
    assessment_result_tool.js, which (unlike Assessment Result's own
    picker) does not restrict this to submitted plans. Not inventing a
    restriction the real tool doesn't have."""
    try:
        return frappe.get_list(
            "Assessment Plan", fields=["name", "assessment_name"],
            order_by="creation desc", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching assessment plans: {str(e)}", "Assessment Result Tool API")
        return []


@frappe.whitelist()
def get_assessment_plan_details(assessment_plan):
    """Mirrors the real client script's frm.add_fetch('assessment_plan',
    'student_group', 'student_group') plus what's needed for grading
    (grading_scale, maximum_assessment_score are real Assessment Plan
    fields, already confirmed when that module was built)."""
    if not assessment_plan:
        return None
    return frappe.db.get_value(
        "Assessment Plan", assessment_plan,
        ["student_group", "grading_scale", "maximum_assessment_score", "course"],
        as_dict=True,
    )


@frappe.whitelist()
def get_assessment_plan_criteria(assessment_plan):
    """Thin wrapper around the real, already-whitelisted
    education.education.api.get_assessment_details() -- reads the Plan's
    own Assessment Plan Criteria rows directly, not reimplemented."""
    if not assessment_plan:
        return []

    from education.education.api import get_assessment_details

    try:
        return get_assessment_details(assessment_plan) or []
    except Exception as e:
        frappe.log_error(f"Error fetching assessment criteria: {str(e)}", "Assessment Result Tool API")
        return []


@frappe.whitelist()
def get_assessment_students(assessment_plan, student_group):
    """Thin wrapper around the real, already-whitelisted
    education.education.api.get_assessment_students() -- reuses
    get_student_group_students() for the roster (same real function
    already reused for Student Attendance Tool and Assessment Result's
    own Student picker, not rebuilt a third time) and pre-fills each
    student's existing scores/grade/docstatus/name from any real
    Assessment Result already on file for this plan."""
    if not assessment_plan or not student_group:
        return []

    from education.education.api import get_assessment_students as real_get_assessment_students

    try:
        return real_get_assessment_students(assessment_plan, student_group) or []
    except Exception as e:
        frappe.log_error(f"Error fetching roster: {str(e)}", "Assessment Result Tool API")
        return []


@frappe.whitelist()
def get_grading_scale_intervals(grading_scale):
    """Same source data education.education.api.get_grade() itself
    reads, used for a live client-side grade preview per cell -- same
    real shape already used in Assessment Result's own form."""
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
        frappe.log_error(f"Error fetching grading scale intervals: {str(e)}", "Assessment Result Tool API")
        return []


@frappe.whitelist()
def mark_assessment_result(assessment_plan, scores):
    """Thin wrapper around the real, already-whitelisted
    education.education.api.mark_assessment_result() -- reused directly.

    Real behavior worth knowing: internally calls
    get_assessment_result_doc(), which -- unlike Student Attendance
    Tool's make_attendance_records() -- genuinely looks up an existing
    DRAFT (docstatus 0) Assessment Result for this student+plan and
    updates it in place; only creates a fresh one if none exists. It
    calls .save() only (never .submit()), so this always leaves a draft
    -- submission only happens via the separate submit_assessment_results
    call below. Real edge case, unhandled in the underlying app: if a
    result for this student+plan is already SUBMITTED (docstatus 1),
    get_assessment_result_doc() msgprints "Result already Submitted" and
    returns None, and the caller then does None.update(...), which
    raises a plain AttributeError rather than a clean frappe.throw(). The
    frontend here avoids ever hitting this by disabling score entry for
    any student whose loaded row already has docstatus == 1."""
    from education.education.api import mark_assessment_result as real_mark_assessment_result

    return real_mark_assessment_result(assessment_plan=assessment_plan, scores=scores)


@frappe.whitelist()
def submit_assessment_results(assessment_plan, student_group):
    """Thin wrapper around the real, already-whitelisted
    education.education.api.submit_assessment_results() -- reused
    directly. Real behavior: loops the roster, .submit()s every student's
    still-DRAFT (docstatus 0) Assessment Result, returns the count
    submitted. No explicit frappe.db.commit() in this function -- Frappe's
    own request lifecycle auto-commits on a clean return and rolls back
    the whole request on any uncaught exception (frappe/app.py), so if
    submitting student N's result throws, every earlier .submit() call in
    the SAME request is reverted too -- genuinely atomic across the whole
    batch, via the request-level mechanism rather than an explicit
    trailing commit like Student Attendance Tool's mark_attendance()
    uses. Each individual mark_assessment_result() call earlier, by
    contrast, is its OWN separate request/transaction -- one student's
    entry failing has no effect on any other student's already-saved
    draft."""
    from education.education.api import submit_assessment_results as real_submit_assessment_results

    return real_submit_assessment_results(assessment_plan=assessment_plan, student_group=student_group)
