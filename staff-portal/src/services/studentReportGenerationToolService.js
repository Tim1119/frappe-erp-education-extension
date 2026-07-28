import api from "./api";

const METHOD = "education_extension.staff_portal_api.student_report_generation_tool_api";

export function getStudents() {
  return api(`${METHOD}.get_students`);
}

export function getPrograms() {
  return api(`${METHOD}.get_programs`);
}

export function getStudentBatches() {
  return api(`${METHOD}.get_student_batches`);
}

export function getAcademicYears() {
  return api(`${METHOD}.get_academic_years`);
}

export function getAcademicTerms(academicYear) {
  return api(`${METHOD}.get_academic_terms`, { academic_year: academicYear });
}

export function getGroupAssessmentGroups() {
  return api(`${METHOD}.get_group_assessment_groups`);
}

export function getLetterHeads() {
  return api(`${METHOD}.get_letter_heads`);
}

export function getTermsAndConditions() {
  return api(`${METHOD}.get_terms_and_conditions`);
}

export function getTermsContent(terms) {
  return api(`${METHOD}.get_terms_content`, { terms });
}

// The real student-changes handler in student_report_generation_tool.js
// calls this exact whitelisted function directly and copies over whatever
// keys happen to match real fields on the Tool (program, student_batch,
// academic_year, academic_term). It returns normal JSON, unlike the print
// action below, so the generic api() helper works fine here.
export function getCurrentEnrollment(student, academicYear) {
  return api("education.education.api.get_current_enrollment", {
    student,
    academic_year: academicYear,
  });
}

// preview_report_card returns raw PDF bytes as the HTTP response body,
// not JSON -- api.js's response.json() would crash on it. This mirrors
// Frappe's own open_url_post() exactly: a hidden form POST (with the real
// csrf_token field) submitted with target="_blank", so the browser
// navigates a new tab straight to the PDF response, identical to what
// Desk's own "Print Report Card" button does.
export function printReportCard(doc) {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || "";
  const url =
    "/api/method/education.education.doctype.student_report_generation_tool.student_report_generation_tool.preview_report_card";

  const form = document.createElement("form");
  form.action = url;
  form.method = "POST";
  form.target = "_blank";
  form.style.display = "none";

  const params = {
    doc: JSON.stringify(doc),
    csrf_token: csrfToken,
  };

  Object.entries(params).forEach(([name, value]) => {
    const field = document.createElement("textarea");
    field.name = name;
    field.value = value;
    form.appendChild(field);
  });

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
