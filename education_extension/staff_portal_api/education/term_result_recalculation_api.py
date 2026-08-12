import frappe
from frappe import _

from education_extension.staff_portal_api.education.bulk_school_term_class_result_generator_api import (
    get_assessment_groups,
    get_academic_years,
    get_academic_terms,
    get_student_groups,
)

# Real doctype: "Term Result Recalculation" (education_extension app) --
# a normal, persisted, listable doctype (no issingle, no is_submittable),
# real fields exactly academic_year/academic_term/assessment_group/
# student_group (all reqd Links) plus two real, read_only tracking
# fields: recalculation_status (Data) and recalculation_log (Small Text).
# Real permissions: "System Manager" only -- same as Bulk School Term
# Class Result Generator, so this stays admin-only / off TEACHER_NAV.
#
# Real, load-bearing autoname quirk: format:{academic_year}-{academic_term}
# -- the docname does NOT include assessment_group or student_group, so
# there is at most ONE real "Term Result Recalculation" record per
# Academic Year+Term combination, regardless of which Class Arm/
# Assessment Group a given run targets. Re-running for the same Year+Term
# with different filters reuses (updates) that same tracking record
# rather than creating a second one -- this is a genuine, deliberate
# constraint of the real schema, not an invented restriction, so the
# wrapper below loads-and-updates an existing record instead of always
# inserting fresh (which would otherwise hit a real DuplicateEntryError
# on the second run for the same period).
#
# Real mechanism, traced from term_result_recalculation.py: the doctype's
# own batch_recalculate_term_results() is a whitelisted INSTANCE method
# (not a standalone function, unlike Bulk School Term Class Result
# Generator's separate generate_class_results()). It queries every real
# "School Term Result" matching the 4 filters (docstatus IN [0, 1]),
# then loops each and calls the separate recalculate_single_result(doc)
# function (also in term_result_recalculation.py) to refresh attendance/
# scores/positions/grades on that SAME existing document in place --
# comments, psychomotor and affective ratings are fields that function
# never touches, so they survive untouched. Genuinely different
# atomicity from the Bulk Generator's own generate_class_results():
# each record here IS wrapped in its own try/except with a per-record
# frappe.db.rollback() + continue on failure, so one student's failure
# does NOT abort the whole batch -- confirmed by reading the real loop,
# not assumed to match the sibling tool. Status/log are saved+committed
# every 10 records and again at the end, so progress is visible even on
# a large run.


@frappe.whitelist()
def get_recalculation_preview(academic_year, academic_term, assessment_group, student_group):
    """Real pre-check with no equivalent in the actual Frappe app --
    counts how many School Term Result records the real
    batch_recalculate_term_results() query would find for these exact
    filters, so the frontend can show "this will recalculate N results"
    before running anything. Mirrors that real query's filters exactly
    (docstatus IN [0, 1]), not a guessed approximation."""
    count = frappe.db.count(
        "School Term Result",
        filters={
            "academic_year": academic_year,
            "academic_term": academic_term,
            "assessment_group": assessment_group,
            "student_group": student_group,
            "docstatus": ["in", [0, 1]],
        },
    )
    return {"count": count}


@frappe.whitelist()
def recalculate_term_results(academic_year, academic_term, assessment_group, student_group):
    """Loads-or-creates the real "Term Result Recalculation" tracking
    record for this Academic Year+Term (see module docstring for why
    that's load-or-create rather than always-create), then calls the
    real, unmodified batch_recalculate_term_results() instance method on
    it directly -- reused as-is, not reimplemented."""
    doc_name = f"{academic_year}-{academic_term}"
    if frappe.db.exists("Term Result Recalculation", doc_name):
        doc = frappe.get_doc("Term Result Recalculation", doc_name)
    else:
        doc = frappe.new_doc("Term Result Recalculation")
        doc.academic_year = academic_year
        doc.academic_term = academic_term

    doc.assessment_group = assessment_group
    doc.student_group = student_group
    doc.save()
    frappe.db.commit()

    status = doc.batch_recalculate_term_results()
    frappe.db.commit()

    # batch_recalculate_term_results() already saved doc.recalculation_status/
    # recalculation_log onto itself repeatedly during the run -- re-fetch
    # rather than trust the in-memory object, since ignore_version=True
    # saves on the School Term Result records it touched don't affect
    # this doc, but being explicit about reading the real persisted state
    # back costs nothing and avoids relying on in-memory staleness.
    doc.reload()
    return {
        "name": doc.name,
        "status": status,
        "recalculation_status": doc.recalculation_status,
        "recalculation_log": doc.recalculation_log,
    }
