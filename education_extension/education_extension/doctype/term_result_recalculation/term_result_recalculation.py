import frappe
from frappe.utils import nowdate, get_datetime

from frappe.model.document import Document
from education_extension.education_extension.attendance_helpers import calculate_attendance_with_holidays




    # --- CORE SINGLE RESULT RECALCULATION FUNCTION ---

def recalculate_single_result(self):
    """
    Replicates the original logic from the user's prompt 
    to calculate all fields on a single School Term Result document.
    """
    
    # Fetch required docs
    student_doc = frappe.get_doc("Student", self.student)
    term_doc = frappe.get_doc("Academic Term", self.academic_term)

    # Set basic fields
    self.term_start_date = term_doc.term_start_date
    self.term_end_date = term_doc.term_end_date
    if not self.date_of_result_issue:
        self.date_of_result_issue = nowdate()
    self.gender = student_doc.gender
    self.student_admission_id = student_doc.name
    
    # Student Group and Program
    program_enrollment = frappe.get_all(
        "Program Enrollment",
        filters={"student": self.student, "academic_year": self.academic_year, "docstatus": 1},
        fields=["program"]
    )
    program = program_enrollment[0].program if program_enrollment else None
    self.program = program

    sgs = frappe.db.sql("""
        SELECT sgs.parent
        FROM `tabStudent Group Student` sgs
        INNER JOIN `tabStudent Group` sg ON sgs.parent = sg.name
        WHERE sgs.student = %s AND sg.academic_year = %s
    """, (self.student, self.academic_year), as_dict=True)
    
    student_group_name = sgs[0].parent if sgs else None
    if student_group_name:
        self.student_group = student_group_name
        # Counts for class size
        self.number_of_students_in_class_group = frappe.db.count("Student Group Student", filters={"parent": student_group_name})
        group_program = frappe.db.get_value("Student Group", student_group_name, "program")
        program = program or group_program # Use group program if enrollment failed
        if program:
            self.number_of_students_in_class = frappe.db.count(
                "Program Enrollment",
                filters={"program": program, "academic_year": self.academic_year, "docstatus": 1}
            )
    else:
        self.student_group = None

    # --- ATTENDANCE CALCULATIONS (holiday-aware) ---
    calculate_attendance_with_holidays(self)


    # --- ASSESSMENT RESULTS ---
    student_id = frappe.db.get_value("Student", self.student, "name")
    detailed_results = frappe.db.sql("""
        SELECT
            ar.course, ar.total_score, ar.grade,
            ard.assessment_criteria, ard.score, ard.maximum_score
        FROM `tabAssessment Result` ar
        INNER JOIN `tabAssessment Result Detail` ard ON ar.name = ard.parent
        WHERE ar.student = %s AND ar.academic_year = %s AND ar.assessment_group = %s AND ar.docstatus IN (0, 1)
        ORDER BY ar.course, ard.idx
    """, (student_id, self.academic_year, self.assessment_group), as_dict=True)

    # Clear and Repopulate Tables
    self.set("subjects", [])
    self.set("assessment_components", [])

    if not detailed_results:
        # If no assessment results, ensure scores are zeroed out
        self.total_marks_obtained = self.total_max_marks = self.term_average = 0
        self.overall_grade = "N/A"
        self.class_arm_position = self.class_position = 0
        return # Skip further score calculations if no results

    course_details = {}
    for row in detailed_results:
        course = row.course
        if course not in course_details:
            course_details[course] = {"total_score": row.total_score, "grade": row.grade, "details": []}
        
        # Populate Assessment Components
        self.append("assessment_components", {
            "criteria": row.assessment_criteria,
            "score_obtained": row.score or 0,
            "max_score": row.maximum_score or 0,
            "subject": row.course
        })

    # Populate Subjects table (Initial)
    for course, data in course_details.items():
        self.append("subjects", {
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

    # --- DETERMINE PREVIOUS TERMS (Logic copied from original prompt) ---
    s = self.assessment_group.lower()
    current_term_num = 0
    if 'first' in s or '1st' in s or ' 1 ' in s or ' i' in s or '(i)' in s: current_term_num = 1
    elif 'second' in s or '2nd' in s or ' 2 ' in s or ' ii' in s or '(ii)' in s: current_term_num = 2
    elif 'third' in s or '3rd' in s or ' 3 ' in s or ' iii' in s or '(iii)' in s: current_term_num = 3
    
    academic_year_for_terms = None
    if '(' in self.assessment_group and ')' in self.assessment_group:
        start = self.assessment_group.find('(')
        end = self.assessment_group.find(')')
        if start != -1 and end != -1:
            year_part = self.assessment_group[start+1:end]
            if '/' in year_part and len(year_part) == 9:
                academic_year_for_terms = year_part
    
    previous_term_1 = f"First Term ({academic_year_for_terms})" if current_term_num >= 2 and academic_year_for_terms else None
    previous_term_2 = f"Second Term ({academic_year_for_terms})" if current_term_num == 3 and academic_year_for_terms else None

    # --- Calculate Subject-wise Statistics & Session Average ---
    for subject_row in self.subjects:
        if self.student_group and subject_row.subject:
            # Current Term Class Stats
            class_scores = frappe.db.sql("""
                SELECT ar.total_score
                FROM `tabAssessment Result` ar
                INNER JOIN `tabStudent Group Student` sgs ON ar.student = sgs.student
                WHERE sgs.parent = %s AND ar.course = %s AND ar.assessment_group = %s
                AND ar.academic_year = %s AND ar.docstatus IN (0, 1) AND ar.total_score IS NOT NULL
            """, (self.student_group, subject_row.subject, self.assessment_group, self.academic_year))
            
            if class_scores:
                scores_list = [float(s[0]) for s in class_scores]
                current_student_score = float(subject_row.total_score or 0)
                
                subject_row.class_highest_score = max(scores_list)
                subject_row.class_lowest_score = min(scores_list)
                subject_row.class_average_score = round(sum(scores_list) / len(scores_list), 2)
                
                # Position in subject
                position = sum(1 for score in scores_list if score > current_student_score) + 1
                subject_row.subject_position = str(position)

        # Previous Term Scores
        for term_field, term_name in [('previous_total1', previous_term_1), ('previous_total2', previous_term_2)]:
            if term_name:
                result_name = frappe.db.get_value('School Term Result', {'student': self.student, 'assessment_group': term_name}, 'name')
                if result_name:
                    prev_score = frappe.db.get_value(
                        'Subject Result',
                        {'parent': result_name, 'subject': subject_row.subject},
                        'total_score'
                    )
                    if prev_score is not None:
                        setattr(subject_row, term_field, prev_score)

        # Session Average
        scores_for_average = [subject_row.total_score]
        if subject_row.previous_total1 is not None: scores_for_average.append(subject_row.previous_total1)
        if subject_row.previous_total2 is not None: scores_for_average.append(subject_row.previous_total2)
        
        if scores_for_average and sum(scores_for_average) > 0:
            subject_row.session_average = round(sum(scores_for_average) / len(scores_for_average), 1)
        else:
            subject_row.session_average = 0

    # --- Overall Totals and Grade ---
    total_marks = sum([subject.total_score or 0 for subject in self.subjects])
    self.total_marks_obtained = total_marks
    max_marks = sum([component.max_score or 0 for component in self.assessment_components])
    self.total_max_marks = max_marks
    
    self.term_average = round((total_marks / max_marks) * 100, 2) if max_marks > 0 else 0

    # Overall Grade
    self.overall_grade = "N/A"
    if self.term_average:
        try:
            school_settings = frappe.get_cached_doc("School Settings")
            overall_grade = "N/A"
            if school_settings.overall_grading_scale:
                for grade_row in school_settings.overall_grading_scale:
                    if (grade_row.min_percentage or 0) <= round(self.term_average) <= (grade_row.max_percentage or 100):
                        overall_grade = grade_row.grade_code
                        break
            else:
                # Fallback logic
                if self.term_average >= 80: overall_grade = "A"
                elif self.term_average >= 70: overall_grade = "B"
                elif self.term_average >= 60: overall_grade = "C"
                elif self.term_average >= 50: overall_grade = "D"
                else: overall_grade = "F"
            self.overall_grade = overall_grade
        except Exception:
            self.overall_grade = "N/A"

    # --- Overall Class Positions ---
    student_total_marks = self.total_marks_obtained or 0
    self.class_arm_position = 0
    self.class_position = 0

    if self.student_group:
        # 1. Class Arm Position (Student Group)
        class_arm_totals = frappe.db.sql("""
            SELECT SUM(ar.total_score) as total
            FROM `tabAssessment Result` ar
            INNER JOIN `tabStudent Group Student` sgs ON ar.student = sgs.student
            WHERE sgs.parent = %s AND ar.assessment_group = %s AND ar.academic_year = %s AND ar.docstatus IN (0, 1)
            GROUP BY ar.student
        """, (self.student_group, self.assessment_group, self.academic_year), as_list=True)
        if class_arm_totals:
            arm_position = sum(1 for total_row in class_arm_totals if total_row[0] > student_total_marks) + 1
            self.class_arm_position = arm_position

        # 2. Overall Class Position (Program)
        if program:
            class_totals = frappe.db.sql("""
                SELECT SUM(ar.total_score) as total
                FROM `tabAssessment Result` ar
                INNER JOIN `tabProgram Enrollment` pe ON ar.student = pe.student
                WHERE pe.program = %s AND pe.academic_year = %s AND pe.docstatus = 1
                AND ar.assessment_group = %s AND ar.academic_year = %s AND ar.docstatus IN (0, 1)
                GROUP BY ar.student
            """, (program, self.academic_year, self.assessment_group, self.academic_year), as_list=True)
            if class_totals:
                overall_position = sum(1 for total_row in class_totals if total_row[0] > student_total_marks) + 1
                self.class_position = overall_position
                
                    
                    

class TermResultRecalculation(Document):
	
    @frappe.whitelist()
    def batch_recalculate_term_results(self, method=None):
        """
        Finds all existing School Term Results based on the DocType's filters, 
        and re-runs the calculation logic for each.
        
        This function is triggered as a server action from the DocType.
        """
        academic_term = self.academic_term
        academic_year = self.academic_year
        assessment_group = self.assessment_group
        student_group = self.student_group

        if not (academic_term and academic_year and assessment_group and student_group):
            self.recalculation_status = "Skipped: Missing filters"
            self.recalculation_log = "Academic Term, Academic Year, and Assessment Group are required."
            self.save()
            return "Missing required filters."

        # Set initial status and log
        self.recalculation_status = f"Running at {get_datetime(nowdate())}"
        self.recalculation_log = "Starting batch recalculation..."
        self.save()
        frappe.db.commit() # Commit status update

        # 1. Find all School Term Result documents that need updating
        result_docs_to_update = frappe.get_list(
            "School Term Result",
            filters={
                "academic_term": academic_term,
                "academic_year": academic_year,
                "assessment_group": assessment_group,
                "student_group": student_group,
                "docstatus": ["in", [0, 1]] # Draft or Submitted
            },
            fields=["name", "student"],
            limit_page_length=None # Fetch all
        )

        total_count = len(result_docs_to_update)
        updated_count = 0
        error_log = ""

        if not result_docs_to_update:
            self.recalculation_status = "Complete (0 updated)"
            self.recalculation_log += f"\nFinished: No School Term Result documents found."
            self.save()
            return "No results found to update."

        # 2. Iterate through each document and re-run the core logic
        for i, result_row in enumerate(result_docs_to_update):
            result_name = result_row.name
            student = result_row.student
            
            # Update log periodically
            if i % 10 == 0:
                self.recalculation_log = f"Processing result {i+1} of {total_count}..."
                self.save()
                frappe.db.commit()

            try:
                # 2.1 Get the target document to update
                school_term_result_doc = frappe.get_doc("School Term Result", result_name)
                
                # 2.2 Replicate Core Logic (Attendance and Scores)
                recalculate_single_result(school_term_result_doc)

                # 2.3 Save the recalculated document
                school_term_result_doc.save(ignore_permissions=True, ignore_version=True)
                frappe.db.commit()
                updated_count += 1

            except Exception as e:
                frappe.db.rollback()
                error_msg = f"Failed to recalculate Result **{result_name}** (Student: {student}): {str(e)}"
                frappe.log_error(error_msg)
                error_log += f"\n- {error_msg}"
        
        # 3. Final Status Update
        final_status = f"Complete ({updated_count} updated / {total_count} total)"
        self.recalculation_status = final_status
        self.recalculation_log += f"\n\n--- Finished Batch Update ---\nUpdated: {updated_count} / {total_count}"
        if error_log:
            self.recalculation_log += "\n\n--- Errors Found ---\n" + error_log
        
        self.save()
        return final_status