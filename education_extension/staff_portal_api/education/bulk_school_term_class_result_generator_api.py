import frappe
from frappe import _

# Real doctype (education_extension app): "Bulk School Term Class Result
# Generator" -- re-confirmed fresh for this build, not assumed carried
# over from the earlier (differently-scoped) investigation: no issingle,
# no is_submittable in its own JSON (a normal, persisted, listable
# doctype, autoname format:BULK-RSLT-{academic_year}-{academic_term}-
# {####}), real fields exactly assessment_group/academic_year/
# academic_term/student_group (labelled "Class Arm")/date_of_result_issue,
# no child table. Its own .py controller is still a bare `pass` and its
# own .js client script is still genuinely empty (0 lines) -- confirmed
# again, not assumed. No doc_events hook targets it either. The doctype
# is purely a data container recording each generation run; all real
# logic lives in the separate, standalone whitelisted function
# education_extension.education_extension.api.generate_class_results(docname),
# which expects an already-created record of this doctype and is not
# wired to any button anywhere in the real app.
#
# Real mechanism: generate_class_results(docname) loads that record,
# pulls its Class Arm's full roster (Student Group Student), and for each
# student creates+.insert()s a new real "School Term Result" (a separate
# real doctype). All actual computation -- subjects/assessment components
# from Assessment Result, attendance from Student Attendance, class/arm
# positions, overall grade via School Settings' grading scale, and
# previous-term comparison via string-parsing the Assessment Group's own
# name -- happens in School Term Result's own before_insert() hook, not
# in this function.
#
# Real, load-bearing atomicity gap: frappe.db.commit() runs INSIDE the
# per-student loop, right after each .insert(), with no per-student
# try/except. One student's failure (most commonly
# school_term_result_utils.py's "No Assessment Results found for student
# X. Cannot create result.") kills the loop immediately -- every student
# processed before that point stays permanently created, everyone after
# is silently never attempted, and the real function itself reports none
# of this (a single frappe.msgprint only on full success, nothing at all
# on a partial abort). generate_class_results() below reconciles this
# honestly after calling the real function, by querying which of the
# roster's students now have a matching School Term Result -- not
# reimplementing the real loop, just reading back its real effect.
#
# Real duplicate-generation gap: School Term Result's own autoname is
# series-based (RSLT-(...)-####), not field-based, so nothing in the real
# code stops re-running generation for the same Class Arm/Assessment
# Group/Academic Year/Term from creating a SECOND result per student.
# check_existing_results() below is a real pre-check (not present in the
# actual Frappe app at all) added specifically so the frontend can warn
# and require confirmation before that happens, rather than only
# describing the risk in passive help text.
#
# Real permission mismatch, still not fixed here (core app config): this
# doctype grants create/read/write to both "System Manager" and
# "Academics User", but "School Term Result" (the record type it actually
# creates) grants access only to "System Manager" -- re-confirmed fresh
# from the real JSON just now. An Academics-User-only account would
# create the Generator record fine, then hit a real PermissionError on
# the first student's .insert() inside generate_class_results(). Not
# bypassed via ignore_permissions; the real error is left to surface as
# -is via getErrorMessage() on the frontend. This is why the module stays
# admin-only (not added to TEACHER_NAV).


@frappe.whitelist()
def check_existing_results(assessment_group, academic_year, academic_term, student_group):
    """Real pre-check with no equivalent in the actual Frappe app --
    queries which of the Class Arm's real students already have a School
    Term Result for this exact Assessment Group/Academic Year/Academic
    Term, so the frontend can warn before creating duplicates (the real
    generate_class_results() has no such guard)."""
    roster = frappe.get_all(
        "Student Group Student", filters={"parent": student_group},
        fields=["student", "student_name"], order_by="idx",
    )
    existing = []
    for row in roster:
        result_name = frappe.db.get_value(
            "School Term Result",
            {
                "student": row.student,
                "assessment_group": assessment_group,
                "academic_year": academic_year,
                "academic_term": academic_term,
            },
            "name",
            order_by="creation desc",
        )
        if result_name:
            existing.append({"student": row.student, "student_name": row.student_name, "school_term_result": result_name})

    return {"total": len(roster), "existing_count": len(existing), "existing": existing}


@frappe.whitelist()
def generate_class_results(assessment_group, academic_year, academic_term, student_group, date_of_result_issue):
    """Creates the real "Bulk School Term Class Result Generator" record
    this mechanism requires to exist first, then calls the real,
    unmodified generate_class_results() on it directly -- reused as-is,
    not reimplemented. See module docstring above for the real atomicity
    behavior this reconciles after the call."""
    generator_doc = frappe.new_doc("Bulk School Term Class Result Generator")
    generator_doc.assessment_group = assessment_group
    generator_doc.academic_year = academic_year
    generator_doc.academic_term = academic_term
    generator_doc.student_group = student_group
    generator_doc.date_of_result_issue = date_of_result_issue
    generator_doc.insert()
    frappe.db.commit()

    from education_extension.education_extension.api import generate_class_results as real_generate_class_results

    error = None
    try:
        real_generate_class_results(generator_doc.name)
    except Exception as e:
        error = str(e)

    roster = frappe.get_all(
        "Student Group Student", filters={"parent": student_group},
        fields=["student", "student_name"], order_by="idx",
    )
    created = []
    missing = []
    for row in roster:
        result_name = frappe.db.get_value(
            "School Term Result",
            {
                "student": row.student,
                "assessment_group": assessment_group,
                "academic_year": academic_year,
                "academic_term": academic_term,
            },
            "name",
            order_by="creation desc",
        )
        if result_name:
            created.append({"student": row.student, "student_name": row.student_name, "school_term_result": result_name})
        else:
            missing.append({"student": row.student, "student_name": row.student_name})

    return {
        "generator": generator_doc.name,
        "total": len(roster),
        "count": len(created),
        "created": created,
        "missing": missing,
        "error": error,
    }


@frappe.whitelist()
def get_assessment_groups():
    """Leaf nodes only (is_group=0) -- Assessment Group is a Tree
    doctype; only leaf nodes (a specific term/exam period) are ever
    referenced by real Assessment Result rows."""
    try:
        return frappe.get_all(
            "Assessment Group", filters={"is_group": 0},
            fields=["name", "assessment_group_name"], order_by="name",
        )
    except Exception as e:
        frappe.log_error(f"Error fetching assessment groups: {str(e)}", "Bulk School Term Class Result Generator API")
        return []


@frappe.whitelist()
def get_academic_years():
    try:
        return frappe.get_all(
            "Academic Year", fields=["name"], order_by="year_start_date desc", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching academic years: {str(e)}", "Bulk School Term Class Result Generator API")
        return []


@frappe.whitelist()
def get_academic_terms(academic_year=None):
    try:
        filters = {}
        if academic_year:
            filters["academic_year"] = academic_year
        return frappe.get_all(
            "Academic Term", fields=["name", "title"],
            filters=filters, order_by="term_start_date desc", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching academic terms: {str(e)}", "Bulk School Term Class Result Generator API")
        return []


@frappe.whitelist()
def get_student_groups():
    try:
        return frappe.get_all(
            "Student Group", fields=["name", "student_group_name"],
            filters={"disabled": 0}, order_by="student_group_name", limit_page_length=500,
        )
    except Exception as e:
        frappe.log_error(f"Error fetching class arms: {str(e)}", "Bulk School Term Class Result Generator API")
        return []
