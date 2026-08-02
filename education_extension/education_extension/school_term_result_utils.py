# """
# School Term Result Utilities
# Handles all result population logic for both individual results and bulk generation
# """
# import frappe
# from frappe.utils import nowdate


# def populate_student_result(doc):
#     """
#     Populate a single student's School Term Result with all details.
#     Can be called from:
#     1. School Term Result form (validate/before_insert)
#     2. Bulk generator API
    
#     Args:
#         doc: School Term Result document object
#     """
    
#     # Validate required fields
#     if not (doc.student and doc.assessment_group and doc.academic_year and doc.academic_term):
#         frappe.throw("Student, Assessment Group, Academic Year, and Academic Term are required.")

#     # 1. Student Document & Profile
#     student_doc = frappe.get_doc("Student", doc.student)
#     doc.gender = student_doc.gender
#     doc.student_admission_id = student_doc.name

#     # 2. Academic Term Dates
#     term_doc = frappe.get_doc("Academic Term", doc.academic_term)
#     doc.term_start_date = term_doc.term_start_date
#     doc.term_end_date = term_doc.term_end_date 

#     # 3. Date of Result Issue
#     if not doc.date_of_result_issue:
#         doc.date_of_result_issue = nowdate()

#     # 4. Program Enrollment
#     program_enrollment = frappe.get_all(
#         "Program Enrollment",
#         filters={
#             "student": doc.student,
#             "academic_year": doc.academic_year,
#             "docstatus": 1
#         },
#         fields=["program"]
#     )
#     doc.program = program_enrollment[0].program if program_enrollment else None

#     # 5. Student Group (Class Arm) & Count
#     sgs = frappe.db.sql("""
#         SELECT sgs.parent
#         FROM `tabStudent Group Student` sgs
#         INNER JOIN `tabStudent Group` sg ON sgs.parent = sg.name
#         WHERE sgs.student = %s 
#         AND sg.academic_year = %s
#     """, (doc.student, doc.academic_year), as_dict=True)

#     if sgs:
#         student_group_name = sgs[0].parent
#         doc.student_group = student_group_name

#         # Count students in Student Group (e.g. JSS 1A)
#         doc.number_of_students_in_class_group = frappe.db.count(
#             "Student Group Student",
#             filters={"parent": student_group_name}
#         )

#         # Get program from Student Group
#         program = frappe.db.get_value("Student Group", student_group_name, "program")

#         # Count students in the Program (all groups e.g. JSS 1)
#         doc.number_of_students_in_class = frappe.db.count(
#             "Program Enrollment",
#             filters={
#                 "program": program,
#                 "academic_year": doc.academic_year,
#                 "docstatus": 1
#             }
#         )
#     else:
#         frappe.msgprint(f"No Student Group found for {doc.student}")

#     # 6. ATTENDANCE CALCULATIONS
#     _calculate_attendance(doc)

#     # 7. Get Assessment Results
#     detailed_results = frappe.db.sql("""
#         SELECT 
#             ar.course,
#             ar.total_score,
#             ar.grade,
#             ard.assessment_criteria,
#             ard.score,
#             ard.maximum_score
#         FROM `tabAssessment Result` ar
#         INNER JOIN `tabAssessment Result Detail` ard ON ar.name = ard.parent
#         WHERE ar.student = %s
#           AND ar.academic_year = %s
#           AND ar.assessment_group = %s
#           AND ar.docstatus IN (0, 1)
#         ORDER BY ar.course, ard.idx
#     """, (doc.student, doc.academic_year, doc.assessment_group), as_dict=True)

#     if not detailed_results:
#         frappe.throw(f"No Assessment Results found for student {doc.student}. Cannot create result.")

#     # 8. Populate Subjects and Assessment Components
#     _populate_subjects_and_components(doc, detailed_results)

#     # 9. Determine Term Info & Previous Terms
#     previous_term_1, previous_term_2 = _determine_previous_terms(doc.assessment_group)

#     # 10. Calculate Class Stats, Positions, and Previous Term Scores
#     _calculate_class_stats(doc, previous_term_1, previous_term_2)

#     # 11. Calculate Overall Totals and Grade
#     _calculate_overall_totals(doc)

#     # 12. Calculate Class Positions
#     _calculate_class_positions(doc, program_enrollment)


# def _calculate_attendance(doc):
#     """Calculate attendance metrics based on term dates.

#     "Opened" used to be an UNSCOPED count of distinct dates ANY student
#     anywhere had an attendance record for -- unrelated to this specific
#     student, which is why it could show a number bigger (or smaller) than
#     this student's own Present+Absent. Real evidence (bench console
#     query against student EDU-STU-2025-00004): Present=1, Absent=2,
#     Leave=3 -- 6 real attendance rows for this student, while the old
#     "Opened" showed 7 (a stale whole-school snapshot that had already
#     drifted to 8 by the time it was re-queried live).

#     Fixed definition: Opened is now this student's OWN total marked days
#     (Present + Absent + Leave), so it's always internally consistent by
#     construction -- no more silent gap between the three counts and the
#     total. Leave was already being queried and then discarded; it's now
#     a real, persisted, visible field."""
#     try:
#         doc.number_of_times_present = frappe.db.count(
#             "Student Attendance",
#             filters={
#                 "student": doc.student,
#                 "status": "Present",
#                 "date": ["between", [doc.term_start_date, doc.term_end_date]]
#             }
#         )
#     except Exception as e:
#         frappe.log_error(f"Error counting present days: {str(e)}")
#         doc.number_of_times_present = 0

#     try:
#         doc.number_of_times_absent = frappe.db.count(
#             "Student Attendance",
#             filters={
#                 "student": doc.student,
#                 "status": "Absent",
#                 "date": ["between", [doc.term_start_date, doc.term_end_date]]
#             }
#         )
#     except Exception as e:
#         frappe.log_error(f"Error counting absent days: {str(e)}")
#         doc.number_of_times_absent = 0

#     try:
#         doc.number_of_times_on_leave = frappe.db.count(
#             "Student Attendance",
#             filters={
#                 "student": doc.student,
#                 "status": "Leave",
#                 "date": ["between", [doc.term_start_date, doc.term_end_date]]
#             }
#         )
#     except Exception as e:
#         frappe.log_error(f"Error counting leave days: {str(e)}")
#         doc.number_of_times_on_leave = 0

#     doc.number_of_times_school_opened = (
#         (doc.number_of_times_present or 0)
#         + (doc.number_of_times_absent or 0)
#         + (doc.number_of_times_on_leave or 0)
#     )

#     doc.attendance_percentage = 0
#     if doc.number_of_times_school_opened and doc.number_of_times_school_opened > 0:
#         doc.attendance_percentage = round(
#             (doc.number_of_times_present / doc.number_of_times_school_opened) * 100,
#             2
#         )


# def _populate_subjects_and_components(doc, detailed_results):
#     """Populate subjects and assessment components tables"""
#     doc.subjects = []
#     doc.assessment_components = []

#     course_details = {}

#     # Group results by course
#     for row in detailed_results:
#         course = row.course
#         if course not in course_details:
#             course_details[course] = {
#                 "details": [],
#                 "total_score": row.total_score,
#                 "grade": row.grade
#             }

#         course_details[course]["details"].append({
#             "criteria": row.assessment_criteria,
#             "score": row.score or 0,
#             "max_score": row.maximum_score or 0
#         })

#     # Add subjects
#     for course, data in course_details.items():
#         doc.append("subjects", {
#             "subject": course,
#             "total_score": data["total_score"] or 0,
#             "grade": data["grade"] or "",
#             "subject_position": "",
#             "class_highest_score": 0,
#             "class_lowest_score": 0,
#             "class_average_score": 0,
#             "previous_total1": None,
#             "previous_total2": None,
#             "session_average": 0
#         })

#     # Add assessment components
#     for row in detailed_results:
#         doc.append("assessment_components", {
#             "criteria": row.assessment_criteria,
#             "score_obtained": row.score or 0,
#             "max_score": row.maximum_score or 0,
#             "subject": row.course
#         })


# def _determine_previous_terms(assessment_group_str):
#     """Determine previous term names based on current assessment group"""
#     s = assessment_group_str.lower()
#     current_term_num = 0
#     academic_year = None
    
#     # Determine current term number
#     if 'first' in s:
#         current_term_num = 1
#     elif 'second' in s:
#         current_term_num = 2
#     elif 'third' in s:
#         current_term_num = 3
#     elif '1st' in assessment_group_str or ' 1 ' in assessment_group_str:
#         current_term_num = 1
#     elif '2nd' in assessment_group_str or ' 2 ' in assessment_group_str:
#         current_term_num = 2
#     elif '3rd' in assessment_group_str or ' 3 ' in assessment_group_str:
#         current_term_num = 3
#     elif ' iii' in s or '(iii)' in s:
#         current_term_num = 3
#     elif ' ii' in s or '(ii)' in s:
#         current_term_num = 2
#     elif ' i' in s or '(i)' in s:
#         current_term_num = 1
    
#     # Extract academic year
#     if '(' in assessment_group_str and ')' in assessment_group_str:
#         start = assessment_group_str.find('(')
#         end = assessment_group_str.find(')')
#         if start != -1 and end != -1:
#             year_part = assessment_group_str[start+1:end]
#             if '/' in year_part and len(year_part) == 9:
#                 academic_year = year_part
    
#     # Determine previous terms
#     previous_term_1 = None
#     previous_term_2 = None
    
#     if current_term_num >= 2 and academic_year:
#         previous_term_1 = f"First Term ({academic_year})"
    
#     if current_term_num == 3 and academic_year:
#         previous_term_2 = f"Second Term ({academic_year})"
    
#     return previous_term_1, previous_term_2


# def _calculate_class_stats(doc, previous_term_1, previous_term_2):
#     """Calculate class statistics and previous term scores"""
#     for subject_row in doc.subjects:
#         if doc.student_group and subject_row.subject:
#             # Get class scores for current term
#             class_scores = frappe.db.sql("""
#                 SELECT ar.total_score
#                 FROM `tabAssessment Result` ar
#                 INNER JOIN `tabStudent` s ON ar.student = s.name
#                 INNER JOIN `tabStudent Group Student` sgs ON s.name = sgs.student
#                 WHERE sgs.parent = %s
#                   AND ar.course = %s
#                   AND ar.assessment_group = %s
#                   AND ar.academic_year = %s
#                   AND ar.docstatus IN (0, 1)
#                   AND ar.total_score IS NOT NULL
#             """, (doc.student_group, subject_row.subject, doc.assessment_group, doc.academic_year))

#             if class_scores:
#                 scores_list = [float(s[0]) for s in class_scores]
#                 current_student_score = float(subject_row.total_score or 0)

#                 subject_row.class_highest_score = max(scores_list)
#                 subject_row.class_lowest_score = min(scores_list)
#                 subject_row.class_average_score = round(sum(scores_list) / len(scores_list), 2)
            
#                 # Calculate student's position in subject
#                 position = 1
#                 for score_value in scores_list:
#                     if score_value > current_student_score:
#                         position += 1
                
#                 subject_row.subject_position = str(position)
        
#         # Get Previous Term Scores
#         if previous_term_1:
#             try:
#                 result_name = frappe.db.get_value(
#                     'School Term Result',
#                     {
#                         'student': doc.student,
#                         'assessment_group': previous_term_1
#                     },
#                     'name'
#                 )
                
#                 if result_name:
#                     prev_score_1 = frappe.db.get_value(
#                         'Subject Result',
#                         {
#                             'parent': result_name,
#                             'subject': subject_row.subject
#                         },
#                         'total_score'
#                     )
#                     if prev_score_1:
#                         subject_row.previous_total1 = prev_score_1
#             except Exception as e:
#                 frappe.log_error(f"Error getting previous term 1 score: {str(e)}")
#                 pass
        
#         if previous_term_2:
#             try:
#                 result_name = frappe.db.get_value(
#                     'School Term Result',
#                     {
#                         'student': doc.student,
#                         'assessment_group': previous_term_2
#                     },
#                     'name'
#                 )
                
#                 if result_name:
#                     prev_score_2 = frappe.db.get_value(
#                         'Subject Result',
#                         {
#                             'parent': result_name,
#                             'subject': subject_row.subject
#                         },
#                         'total_score'
#                     )
#                     if prev_score_2:
#                         subject_row.previous_total2 = prev_score_2
#             except Exception as e:
#                 frappe.log_error(f"Error getting previous term 2 score: {str(e)}")
#                 pass
        
#         # Calculate Session Average
#         scores_for_average = [subject_row.total_score]
        
#         if subject_row.previous_total1:
#             scores_for_average.append(subject_row.previous_total1)
        
#         if subject_row.previous_total2:
#             scores_for_average.append(subject_row.previous_total2)
        
#         if scores_for_average:
#             session_average = round(sum(scores_for_average) / len(scores_for_average), 1)
#             subject_row.session_average = session_average


# def _calculate_overall_totals(doc):
#     """Calculate overall totals, average, and grade"""
#     total_marks = sum([subject.total_score or 0 for subject in doc.subjects])
#     doc.total_marks_obtained = total_marks

#     max_marks = sum([component.max_score or 0 for component in doc.assessment_components])
#     doc.total_max_marks = max_marks
    
#     if max_marks > 0:
#         doc.term_average = round((total_marks / max_marks) * 100, 2)

#     # Calculate Overall Grade
#     if doc.term_average:
#         try:
#             school_settings = frappe.get_doc("School Settings")
#             overall_grade = "N/A"
            
#             if school_settings.overall_grading_scale:
#                 for grade_row in school_settings.overall_grading_scale:
#                     min_pct = grade_row.min_percentage or 0
#                     max_pct = grade_row.max_percentage or 100
                    
#                     if min_pct <= round(doc.term_average) <= max_pct:
#                         overall_grade = grade_row.grade_code
#                         break
#             else:
#                 # Fallback if no grading scale configured
#                 if doc.term_average >= 80:
#                     overall_grade = "A"
#                 elif doc.term_average >= 70:
#                     overall_grade = "B"
#                 elif doc.term_average >= 60:
#                     overall_grade = "C"
#                 elif doc.term_average >= 50:
#                     overall_grade = "D"
#                 else:
#                     overall_grade = "F"
            
#             doc.overall_grade = overall_grade
            
#         except Exception as e:
#             frappe.log_error(f"Error calculating overall grade: {str(e)}")
#             doc.overall_grade = "N/A"


# def _calculate_class_positions(doc, program_enrollment):
#     """Calculate class arm position and overall program position"""
#     if doc.student_group:
#         # Class Arm Position (within student group - e.g., JSS 1A)
#         class_arm_totals = frappe.db.sql("""
#             SELECT ar.student, SUM(ar.total_score) as total
#             FROM `tabAssessment Result` ar
#             INNER JOIN `tabStudent` s ON ar.student = s.name
#             INNER JOIN `tabStudent Group Student` sgs ON s.name = sgs.student
#             WHERE sgs.parent = %s
#               AND ar.assessment_group = %s
#               AND ar.academic_year = %s
#               AND ar.docstatus IN (0, 1)
#             GROUP BY ar.student
#             ORDER BY total DESC
#         """, (doc.student_group, doc.assessment_group, doc.academic_year))

#         if class_arm_totals:
#             student_total_marks = doc.total_marks_obtained or 0
#             arm_position = 1
#             for total_row in class_arm_totals:
#                 if total_row[1] > student_total_marks:
#                     arm_position += 1
#             doc.class_arm_position = arm_position

#         # Overall Class Position (across entire program - e.g., all JSS 1)
#         program = program_enrollment[0].program if program_enrollment else None
#         if program:
#             class_totals = frappe.db.sql("""
#                 SELECT ar.student, SUM(ar.total_score) as total
#                 FROM `tabAssessment Result` ar
#                 INNER JOIN `tabStudent` s ON ar.student = s.name
#                 INNER JOIN `tabProgram Enrollment` pe ON s.name = pe.student
#                 WHERE pe.program = %s
#                   AND pe.academic_year = %s
#                   AND pe.docstatus = 1
#                   AND ar.assessment_group = %s
#                   AND ar.academic_year = %s
#                   AND ar.docstatus IN (0, 1)
#                 GROUP BY ar.student
#                 ORDER BY total DESC
#             """, (program, doc.academic_year, doc.assessment_group, doc.academic_year))

#             if class_totals:
#                 student_total_marks = doc.total_marks_obtained or 0
#                 overall_position = 1
#                 for total_row in class_totals:
#                     if total_row[1] > student_total_marks:
#                         overall_position += 1
#                 doc.class_position = overall_position





"""
School Term Result Utilities
Handles all result population logic for both individual results and bulk generation
"""
import frappe
from frappe.utils import nowdate
from education_extension.education_extension.attendance_helpers import calculate_attendance_with_holidays


def populate_student_result(doc):
    """
    Populate a single student's School Term Result with all details.
    Can be called from:
    1. School Term Result form (validate/before_insert)
    2. Bulk generator API
    
    Args:
        doc: School Term Result document object
    """
    
    # Validate required fields
    if not (doc.student and doc.assessment_group and doc.academic_year and doc.academic_term):
        frappe.throw("Student, Assessment Group, Academic Year, and Academic Term are required.")

    # 1. Student Document & Profile
    student_doc = frappe.get_doc("Student", doc.student)
    doc.gender = student_doc.gender
    doc.student_admission_id = student_doc.name

    # 2. Academic Term Dates
    term_doc = frappe.get_doc("Academic Term", doc.academic_term)
    doc.term_start_date = term_doc.term_start_date
    doc.term_end_date = term_doc.term_end_date 

    # 3. Date of Result Issue
    if not doc.date_of_result_issue:
        doc.date_of_result_issue = nowdate()

    # 4. Program Enrollment
    program_enrollment = frappe.get_all(
        "Program Enrollment",
        filters={
            "student": doc.student,
            "academic_year": doc.academic_year,
            "docstatus": 1
        },
        fields=["program"]
    )
    doc.program = program_enrollment[0].program if program_enrollment else None

    # 5. Student Group (Class Arm) & Count
    sgs = frappe.db.sql("""
        SELECT sgs.parent
        FROM `tabStudent Group Student` sgs
        INNER JOIN `tabStudent Group` sg ON sgs.parent = sg.name
        WHERE sgs.student = %s 
        AND sg.academic_year = %s
    """, (doc.student, doc.academic_year), as_dict=True)

    if sgs:
        student_group_name = sgs[0].parent
        doc.student_group = student_group_name

        # Count students in Student Group (e.g. JSS 1A)
        doc.number_of_students_in_class_group = frappe.db.count(
            "Student Group Student",
            filters={"parent": student_group_name}
        )

        # Get program from Student Group
        program = frappe.db.get_value("Student Group", student_group_name, "program")

        # Count students in the Program (all groups e.g. JSS 1)
        doc.number_of_students_in_class = frappe.db.count(
            "Program Enrollment",
            filters={
                "program": program,
                "academic_year": doc.academic_year,
                "docstatus": 1
            }
        )
    else:
        frappe.msgprint(f"No Student Group found for {doc.student}")

    # 6. ATTENDANCE CALCULATIONS (holiday-aware)
    calculate_attendance_with_holidays(doc)

    # 7. Get Assessment Results
    detailed_results = frappe.db.sql("""
        SELECT 
            ar.course,
            ar.total_score,
            ar.grade,
            ard.assessment_criteria,
            ard.score,
            ard.maximum_score
        FROM `tabAssessment Result` ar
        INNER JOIN `tabAssessment Result Detail` ard ON ar.name = ard.parent
        WHERE ar.student = %s
          AND ar.academic_year = %s
          AND ar.assessment_group = %s
          AND ar.docstatus IN (0, 1)
        ORDER BY ar.course, ard.idx
    """, (doc.student, doc.academic_year, doc.assessment_group), as_dict=True)

    if not detailed_results:
        frappe.throw(f"No Assessment Results found for student {doc.student}. Cannot create result.")

    # 8. Populate Subjects and Assessment Components
    _populate_subjects_and_components(doc, detailed_results)

    # 9. Determine Term Info & Previous Terms
    previous_term_1, previous_term_2 = _determine_previous_terms(doc.assessment_group)

    # 10. Calculate Class Stats, Positions, and Previous Term Scores
    _calculate_class_stats(doc, previous_term_1, previous_term_2)

    # 11. Calculate Overall Totals and Grade
    _calculate_overall_totals(doc)

    # 12. Calculate Class Positions
    _calculate_class_positions(doc, program_enrollment)


def _populate_subjects_and_components(doc, detailed_results):
    """Populate subjects and assessment components tables"""
    doc.subjects = []
    doc.assessment_components = []

    course_details = {}

    # Group results by course
    for row in detailed_results:
        course = row.course
        if course not in course_details:
            course_details[course] = {
                "details": [],
                "total_score": row.total_score,
                "grade": row.grade
            }

        course_details[course]["details"].append({
            "criteria": row.assessment_criteria,
            "score": row.score or 0,
            "max_score": row.maximum_score or 0
        })

    # Add subjects
    for course, data in course_details.items():
        doc.append("subjects", {
            "subject": course,
            "total_score": data["total_score"] or 0,
            "grade": data["grade"] or "",
            "subject_position": "",
            "class_highest_score": 0,
            "class_lowest_score": 0,
            "class_average_score": 0,
            "previous_total1": None,
            "previous_total2": None,
            "session_average": 0
        })

    # Add assessment components
    for row in detailed_results:
        doc.append("assessment_components", {
            "criteria": row.assessment_criteria,
            "score_obtained": row.score or 0,
            "max_score": row.maximum_score or 0,
            "subject": row.course
        })


def _determine_previous_terms(assessment_group_str):
    """Determine previous term names based on current assessment group"""
    s = assessment_group_str.lower()
    current_term_num = 0
    academic_year = None
    
    # Determine current term number
    if 'first' in s:
        current_term_num = 1
    elif 'second' in s:
        current_term_num = 2
    elif 'third' in s:
        current_term_num = 3
    elif '1st' in assessment_group_str or ' 1 ' in assessment_group_str:
        current_term_num = 1
    elif '2nd' in assessment_group_str or ' 2 ' in assessment_group_str:
        current_term_num = 2
    elif '3rd' in assessment_group_str or ' 3 ' in assessment_group_str:
        current_term_num = 3
    elif ' iii' in s or '(iii)' in s:
        current_term_num = 3
    elif ' ii' in s or '(ii)' in s:
        current_term_num = 2
    elif ' i' in s or '(i)' in s:
        current_term_num = 1
    
    # Extract academic year
    if '(' in assessment_group_str and ')' in assessment_group_str:
        start = assessment_group_str.find('(')
        end = assessment_group_str.find(')')
        if start != -1 and end != -1:
            year_part = assessment_group_str[start+1:end]
            if '/' in year_part and len(year_part) == 9:
                academic_year = year_part
    
    # Determine previous terms
    previous_term_1 = None
    previous_term_2 = None
    
    if current_term_num >= 2 and academic_year:
        previous_term_1 = f"First Term ({academic_year})"
    
    if current_term_num == 3 and academic_year:
        previous_term_2 = f"Second Term ({academic_year})"
    
    return previous_term_1, previous_term_2


def _calculate_class_stats(doc, previous_term_1, previous_term_2):
    """Calculate class statistics and previous term scores"""
    for subject_row in doc.subjects:
        if doc.student_group and subject_row.subject:
            # Get class scores for current term
            class_scores = frappe.db.sql("""
                SELECT ar.total_score
                FROM `tabAssessment Result` ar
                INNER JOIN `tabStudent` s ON ar.student = s.name
                INNER JOIN `tabStudent Group Student` sgs ON s.name = sgs.student
                WHERE sgs.parent = %s
                  AND ar.course = %s
                  AND ar.assessment_group = %s
                  AND ar.academic_year = %s
                  AND ar.docstatus IN (0, 1)
                  AND ar.total_score IS NOT NULL
            """, (doc.student_group, subject_row.subject, doc.assessment_group, doc.academic_year))

            if class_scores:
                scores_list = [float(s[0]) for s in class_scores]
                current_student_score = float(subject_row.total_score or 0)

                subject_row.class_highest_score = max(scores_list)
                subject_row.class_lowest_score = min(scores_list)
                subject_row.class_average_score = round(sum(scores_list) / len(scores_list), 2)
            
                # Calculate student's position in subject
                position = 1
                for score_value in scores_list:
                    if score_value > current_student_score:
                        position += 1
                
                subject_row.subject_position = str(position)
        
        # Get Previous Term Scores
        if previous_term_1:
            try:
                result_name = frappe.db.get_value(
                    'School Term Result',
                    {
                        'student': doc.student,
                        'assessment_group': previous_term_1
                    },
                    'name'
                )
                
                if result_name:
                    prev_score_1 = frappe.db.get_value(
                        'Subject Result',
                        {
                            'parent': result_name,
                            'subject': subject_row.subject
                        },
                        'total_score'
                    )
                    if prev_score_1:
                        subject_row.previous_total1 = prev_score_1
            except Exception as e:
                frappe.log_error(f"Error getting previous term 1 score: {str(e)}")
                pass
        
        if previous_term_2:
            try:
                result_name = frappe.db.get_value(
                    'School Term Result',
                    {
                        'student': doc.student,
                        'assessment_group': previous_term_2
                    },
                    'name'
                )
                
                if result_name:
                    prev_score_2 = frappe.db.get_value(
                        'Subject Result',
                        {
                            'parent': result_name,
                            'subject': subject_row.subject
                        },
                        'total_score'
                    )
                    if prev_score_2:
                        subject_row.previous_total2 = prev_score_2
            except Exception as e:
                frappe.log_error(f"Error getting previous term 2 score: {str(e)}")
                pass
        
        # Calculate Session Average
        scores_for_average = [subject_row.total_score]
        
        if subject_row.previous_total1:
            scores_for_average.append(subject_row.previous_total1)
        
        if subject_row.previous_total2:
            scores_for_average.append(subject_row.previous_total2)
        
        if scores_for_average:
            session_average = round(sum(scores_for_average) / len(scores_for_average), 1)
            subject_row.session_average = session_average


def _calculate_overall_totals(doc):
    """Calculate overall totals, average, and grade"""
    total_marks = sum([subject.total_score or 0 for subject in doc.subjects])
    doc.total_marks_obtained = total_marks

    max_marks = sum([component.max_score or 0 for component in doc.assessment_components])
    doc.total_max_marks = max_marks
    
    if max_marks > 0:
        doc.term_average = round((total_marks / max_marks) * 100, 2)

    # Calculate Overall Grade
    if doc.term_average:
        try:
            school_settings = frappe.get_doc("School Settings")
            overall_grade = "N/A"
            
            if school_settings.overall_grading_scale:
                for grade_row in school_settings.overall_grading_scale:
                    min_pct = grade_row.min_percentage or 0
                    max_pct = grade_row.max_percentage or 100
                    
                    if min_pct <= round(doc.term_average) <= max_pct:
                        overall_grade = grade_row.grade_code
                        break
            else:
                # Fallback if no grading scale configured
                if doc.term_average >= 80:
                    overall_grade = "A"
                elif doc.term_average >= 70:
                    overall_grade = "B"
                elif doc.term_average >= 60:
                    overall_grade = "C"
                elif doc.term_average >= 50:
                    overall_grade = "D"
                else:
                    overall_grade = "F"
            
            doc.overall_grade = overall_grade
            
        except Exception as e:
            frappe.log_error(f"Error calculating overall grade: {str(e)}")
            doc.overall_grade = "N/A"


def _calculate_class_positions(doc, program_enrollment):
    """Calculate class arm position and overall program position"""
    if doc.student_group:
        # Class Arm Position (within student group - e.g., JSS 1A)
        class_arm_totals = frappe.db.sql("""
            SELECT ar.student, SUM(ar.total_score) as total
            FROM `tabAssessment Result` ar
            INNER JOIN `tabStudent` s ON ar.student = s.name
            INNER JOIN `tabStudent Group Student` sgs ON s.name = sgs.student
            WHERE sgs.parent = %s
              AND ar.assessment_group = %s
              AND ar.academic_year = %s
              AND ar.docstatus IN (0, 1)
            GROUP BY ar.student
            ORDER BY total DESC
        """, (doc.student_group, doc.assessment_group, doc.academic_year))

        if class_arm_totals:
            student_total_marks = doc.total_marks_obtained or 0
            arm_position = 1
            for total_row in class_arm_totals:
                if total_row[1] > student_total_marks:
                    arm_position += 1
            doc.class_arm_position = arm_position

        # Overall Class Position (across entire program - e.g., all JSS 1)
        program = program_enrollment[0].program if program_enrollment else None
        if program:
            class_totals = frappe.db.sql("""
                SELECT ar.student, SUM(ar.total_score) as total
                FROM `tabAssessment Result` ar
                INNER JOIN `tabStudent` s ON ar.student = s.name
                INNER JOIN `tabProgram Enrollment` pe ON s.name = pe.student
                WHERE pe.program = %s
                  AND pe.academic_year = %s
                  AND pe.docstatus = 1
                  AND ar.assessment_group = %s
                  AND ar.academic_year = %s
                  AND ar.docstatus IN (0, 1)
                GROUP BY ar.student
                ORDER BY total DESC
            """, (program, doc.academic_year, doc.assessment_group, doc.academic_year))

            if class_totals:
                student_total_marks = doc.total_marks_obtained or 0
                overall_position = 1
                for total_row in class_totals:
                    if total_row[1] > student_total_marks:
                        overall_position += 1
                doc.class_position = overall_position