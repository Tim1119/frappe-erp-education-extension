from __future__ import division
import frappe
from frappe import _
import math
import html

def execute(filters=None):
    """
    Entry point for Script Report
    filters: dict expected keys:
      - academic_year
      - academic_term
      - assessment_group
      - student_group
    """

    if filters is None:
        filters = {}

    # validate required filters
    required = ["academic_year", "academic_term", "assessment_group", "student_group"]
    if not all(filters.get(f) for f in required):
        return _build_columns([]), []

    # 1) Fetch matching School Term Results
    results = frappe.get_all(
        "School Term Result",
        filters={
            "academic_year": filters.get("academic_year"),
            "academic_term": filters.get("academic_term"),
            "assessment_group": filters.get("assessment_group"),
            "student_group": filters.get("student_group")
        },
        fields=["name", "student", "student_admission_id"],
        order_by="student"
    )

    if not results:
        return _build_columns([]), []

    # 2) Get assessment structure from first result
    first_result_doc = frappe.get_doc("School Term Result", results[0].get("name"))
    assessment_structure = _get_assessment_structure(first_result_doc)
    
    # 3) Determine all unique subjects
    all_subjects = _get_all_subjects(results)

    # 4) Build columns dynamically based on assessment structure
    columns = _build_columns(all_subjects, assessment_structure)

    # 5) Build data rows
    rows = []
    for idx, r in enumerate(results, start=1):
        doc = frappe.get_doc("School Term Result", r.get("name"))

        student_name = frappe.db.get_value("Student", r.get("student"), "student_name") or r.get("student")
        admission_id = r.get("student_admission_id") or ""

        # Build comprehensive assessment map
        assessment_map = _build_comprehensive_assessment_map(doc)

        # build row dict
        row = {
            "idx": idx,
            "student_name": student_name,
            "admission_id": admission_id
        }

        total_marks = 0.0
        total_max_marks = 0.0

        # Process each subject with CA and Exam breakdown
        for subject in all_subjects:
            subject_data = assessment_map.get(subject, {})
            
            # Separate CA (non-exam) and Exam scores
            ca_score = 0.0
            exam_score = 0.0

            # Add detailed criteria scores - separating CA and Exam
            for criteria in assessment_structure.get('criteria', []):
                criteria_name = criteria['criteria_name']
                criteria_data = subject_data.get('criteria', {}).get(criteria_name, {})
                
                score_obtained = float(criteria_data.get('score_obtained', 0))
                maximum_score = float(criteria_data.get('maximum_score', 0))
                
                # Check if criteria is exam-related
                is_exam = _is_exam_criteria(criteria_name)
                
                if is_exam:
                    exam_score += score_obtained
                else:
                    ca_score += score_obtained
                
                # Accumulate totals - only if criteria_data exists
                if criteria_data:
                    total_marks += score_obtained
                    total_max_marks += maximum_score

            # Add CA and Exam totals for this subject
            row[f"ca_{subject}"] = round(ca_score, 1)
            row[f"exam_{subject}"] = round(exam_score, 1)
            
            # Add Total for this subject (CA + Exam)
            subject_total = round(ca_score + exam_score, 1)
            row[f"total_{subject}"] = subject_total

        # Calculate overall values
        num_subjects_with_data = len([s for s in all_subjects if assessment_map.get(s)])
        average = (total_marks / num_subjects_with_data) if num_subjects_with_data > 0 else 0.0

        row["total_marks"] = round(total_marks, 1)
        row["average"] = round(average, 1)
        row["position"] = 0

        rows.append(row)

    # 6) Calculate positions
    rows = _assign_positions(rows)

    # 7) Prepare data for Excel export
    data = rows
    
    # Add message about Excel export
    if rows:
        frappe.msgprint(_("Use the 'Export' button to download as Excel"), alert=True, indicator="blue")
    
    return columns, data


# ---------- Enhanced Helper functions ----------

def _is_exam_criteria(criteria_name):
    """
    Check if a criteria name is exam-related
    Returns True if criteria contains 'exam', 'examination', etc.
    Returns False for CA (continuous assessment) criteria
    """
    exam_keywords = ['exam', 'examination', 'exams', 'test_exam', 'midterm', 'final']
    criteria_lower = criteria_name.lower()
    
    return any(keyword in criteria_lower for keyword in exam_keywords)


def _get_all_subjects(results):
    """Return a stable list of subject IDs (Course names) present in the results"""
    subjects = set()
    for r in results:
        doc = frappe.get_doc("School Term Result", r.get("name"))
        for srow in doc.subjects:
            if srow.subject:
                subjects.add(srow.subject)
    subjects = list(subjects)
    try:
        subjects.sort(key=lambda s: frappe.db.get_value("Course", s, "course_name") or s)
    except Exception:
        subjects.sort()
    return subjects

def _get_assessment_structure(result_doc):
    """
    Extract assessment structure from a School Term Result document
    """
    criteria_map = {}
    
    for comp in getattr(result_doc, "assessment_components", []) or []:
        criteria_name = getattr(comp, "assessment_criteria", None) or getattr(comp, "criteria", None)
        if criteria_name and criteria_name not in criteria_map:
            try:
                criteria_doc = frappe.get_doc("Assessment Criteria", criteria_name)
                criteria_map[criteria_name] = {
                    'criteria_name': criteria_name,
                    'maximum_score': getattr(comp, "maximum_score", None) or getattr(criteria_doc, "maximum_score", 0),
                    'weightage': getattr(comp, "weightage", None) or getattr(criteria_doc, "weightage", 0)
                }
            except frappe.DoesNotExistError:
                # Fallback if criteria doc doesn't exist
                criteria_map[criteria_name] = {
                    'criteria_name': criteria_name,
                    'maximum_score': getattr(comp, "maximum_score", 0),
                    'weightage': getattr(comp, "weightage", 0)
                }
    
    return {
        'criteria': list(criteria_map.values())
    }

def _build_comprehensive_assessment_map(result_doc):
    """
    Build a comprehensive map of all assessment data
    """
    assessment_map = {}
    
    # First, get subject totals and grades
    for subject_row in getattr(result_doc, "subjects", []) or []:
        if subject_row.subject:
            assessment_map[subject_row.subject] = {
                'total_score': subject_row.total_score or 0,
                'grade': subject_row.grade or '-',
                'criteria': {}
            }
    
    # Then, add criteria details
    for comp in getattr(result_doc, "assessment_components", []) or []:
        subject = getattr(comp, "subject", None)
        criteria_name = getattr(comp, "assessment_criteria", None) or getattr(comp, "criteria", None)
        
        if subject and criteria_name and subject in assessment_map:
            assessment_map[subject]['criteria'][criteria_name] = {
                'score_obtained': getattr(comp, "score_obtained", None) or getattr(comp, "score", 0),
                'maximum_score': getattr(comp, "maximum_score", None) or 0
            }
    
    return assessment_map

def _build_columns(subjects, assessment_structure=None):
    """
    Build column definitions with CA, Exam, and Total columns per subject
    """
    if assessment_structure is None:
        assessment_structure = {'criteria': []}
    
    cols = [
        {"label": "#", "fieldname": "idx", "fieldtype": "Int", "width": 40},
        {"label": _("Student Name"), "fieldname": "student_name", "fieldtype": "Data", "width": 150},
        {"label": _("Admission ID"), "fieldname": "admission_id", "fieldtype": "Data", "width": 100}
    ]

    # For each subject, add CA, Exam, and Total columns
    for subject in subjects:
        subj_label = frappe.db.get_value("Course", subject, "course_name") or subject
        
        # Add CA (Continuous Assessment) column
        ca_field = f"ca_{subject}"
        cols.append({
            "label": f"{subj_label} - CA",
            "fieldname": ca_field,
            "fieldtype": "Float",
            "width": 80,
            "precision": 1
        })
        
        # Add Exam column
        exam_field = f"exam_{subject}"
        cols.append({
            "label": f"{subj_label} - Exam",
            "fieldname": exam_field,
            "fieldtype": "Float",
            "width": 80,
            "precision": 1
        })
        
        # Add Total column (CA + Exam)
        total_field = f"total_{subject}"
        cols.append({
            "label": f"{subj_label} - Total",
            "fieldname": total_field,
            "fieldtype": "Float",
            "width": 80,
            "precision": 1
        })

    # Summary columns
    cols += [
        {"label": _("Total Marks"), "fieldname": "total_marks", "fieldtype": "Float", "width": 80, "precision": 1},
        {"label": _("Average"), "fieldname": "average", "fieldtype": "Float", "width": 70, "precision": 1},
        {"label": _("Position"), "fieldname": "position", "fieldtype": "Int", "width": 70}
    ]

    return cols

def _assign_positions(rows):
    """
    Assign integer positions based on total_marks descending.
    Standard competition ranking (1224 style).
    """
    sorted_rows = sorted(rows, key=lambda r: (-(r.get("total_marks", 0) or 0), r.get("student_name", "")))
    last_score = None
    rank = 0
    skip = 0
    
    for i, r in enumerate(sorted_rows, start=1):
        score = r.get("total_marks", 0) or 0
        if last_score is None:
            rank = 1
            skip = 0
        else:
            if score == last_score:
                skip += 1
            else:
                rank = i
                skip = 0
        r["position"] = rank
        last_score = score

    # Build position mapping
    pos_map = {}
    for r in sorted_rows:
        key = (r.get("student_name"), r.get("admission_id"))
        pos_map[key] = r.get("position")

    # Set positions on original order
    for r in rows:
        key = (r.get("student_name"), r.get("admission_id"))
        r["position"] = pos_map.get(key, 0)

    return rows