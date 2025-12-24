import frappe

@frappe.whitelist()
def generate_class_results(docname):
    """
    Bulk generates School Term Result for all students in the selected Student Group
    using filters from the School Term Class Result Generator doc.
    """
    # Get the generator document
    generator_doc = frappe.get_doc("Bulk School Term Class Result Generator", docname)


    # Ensure required filters are selected
    if not (generator_doc.assessment_group and generator_doc.academic_year and 
            generator_doc.academic_term and generator_doc.student_group):
        frappe.throw("Assessment Group, Academic Year, Academic Term, and Student Group are required.")

    # Get all students in the selected Student Group
    students = frappe.get_all(
        "Student Group Student",
        filters={"parent": generator_doc.student_group},
        fields=["student"]
    )

    if not students:
        frappe.msgprint(f"No students found in {generator_doc.student_group}")
        return

    for entry in students:
        student_id = entry.student

        # Create a new School Term Result doc
        result_doc = frappe.new_doc("School Term Result")
        result_doc.student = student_id
        result_doc.assessment_group = generator_doc.assessment_group
        result_doc.academic_year = generator_doc.academic_year
        result_doc.academic_term = generator_doc.academic_term

        # Populate the student's result using the reusable function
        populate_student_result(result_doc)

        # Save the document
        result_doc.insert()
        frappe.db.commit()

    frappe.msgprint(f"Generated results for {len(students)} students in {generator_doc.student_group}.")


@frappe.whitelist()
def populate_student_result(doc):
    """Populate a single student's School Term Result including subjects, assessment components, class stats, and overall grades with previous term comparison."""

    # 1. Student Document
    student_doc = frappe.get_doc("Student", doc.student)

    # 2. Academic Term Dates
    term_doc = frappe.get_doc("Academic Term", doc.academic_term)
    doc.term_start_date = term_doc.term_start_date
    doc.term_end_date = term_doc.term_end_date 

    # 3. Date of Result Issue
    # If the user didn't set it, use today's date
    if not doc.date_of_result_issue:
        doc.date_of_result_issue = frappe.utils.nowdate()

    # 3. Student Info
    doc.gender = student_doc.gender
    doc.student_admission_id = student_doc.name

    # 4. Student Group / Class Info
    sgs = frappe.get_all(
        "Student Group Student",
        filters={"student": doc.student},
        fields=["parent"]
    )

    if sgs:
        student_group_name = sgs[0].parent
        doc.student_group = student_group_name

        # Count students in Student Group
        doc.number_of_students_in_class_group = frappe.db.count(
            "Student Group Student",
            filters={"parent": student_group_name}
        )

        # Program info
        program = frappe.db.get_value("Student Group", student_group_name, "program")

        # Count students in the Program (all groups)
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

    # 5. Get Assessment Results
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

    # 6. Populate Subjects and Assessment Components
    doc.subjects = []
    doc.assessment_components = []

    if detailed_results:
        course_details = {}
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

        # Subjects table
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

        # Assessment components table
        for row in detailed_results:
            doc.append("assessment_components", {
                "criteria": row.assessment_criteria,
                "score_obtained": row.score or 0,
                "max_score": row.maximum_score or 0,
                "subject": row.course
            })

        # 7. DETERMINE TERM INFO & GET PREVIOUS TERMS
        assessment_group_str = doc.assessment_group
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

        # 8. Calculate Class Stats, Positions, and Previous Terms
        for subject_row in doc.subjects:
            if doc.student_group and subject_row.subject:
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

                    # Subject position
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
                except:
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
                except:
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

        # 9. Overall Totals, Average, Grade
        total_marks = sum([subject.total_score or 0 for subject in doc.subjects])
        doc.total_marks_obtained = total_marks
        max_marks = sum([component.max_score or 0 for component in doc.assessment_components])
        doc.total_max_marks = max_marks

        if max_marks > 0:
            doc.term_average = round((total_marks / max_marks) * 100, 2)

        # 10. Overall Grade
        if doc.term_average:
            try:
                school_settings = frappe.get_doc("School Settings")
                overall_grade = "N/A"
                if school_settings.overall_grading_scale:
                    for grade_row in school_settings.overall_grading_scale:
                        min_pct = grade_row.min_percentage or 0
                        max_pct = grade_row.max_percentage or 100
                        if min_pct <= doc.term_average <= max_pct:
                            overall_grade = grade_row.grade_code
                            break
                else:
                    # fallback
                    avg = doc.term_average
                    if avg >= 80: overall_grade = "A"
                    elif avg >= 70: overall_grade = "B"
                    elif avg >= 60: overall_grade = "C"
                    elif avg >= 50: overall_grade = "D"
                    else: overall_grade = "F"
                doc.overall_grade = overall_grade
            except Exception as e:
                frappe.log_error(f"Error calculating overall grade: {str(e)}")
                doc.overall_grade = "N/A"

        # 11. Class Arm & Overall Position
        if doc.student_group:
            # Class Arm Position
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

            # Overall Program Position
            program = frappe.db.get_value("Student Group", doc.student_group, "program")
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

    else:
        frappe.msgprint(f"No Assessment Results found for student {doc.student}")
        
