import api from "./api";

const METHOD = "education_extension.staff_portal_api.education.assessment_result_tool_api";

export function getAssessmentPlans() {
  return api(`${METHOD}.get_assessment_plans`);
}

export function getAssessmentPlanDetails(assessment_plan) {
  return api(`${METHOD}.get_assessment_plan_details`, { assessment_plan });
}

export function getAssessmentPlanCriteria(assessment_plan) {
  return api(`${METHOD}.get_assessment_plan_criteria`, { assessment_plan });
}

export function getAssessmentStudents(assessment_plan, student_group) {
  return api(`${METHOD}.get_assessment_students`, { assessment_plan, student_group });
}

export function getGradingScaleIntervals(grading_scale) {
  return api(`${METHOD}.get_grading_scale_intervals`, { grading_scale });
}

// scores must be a JSON string -- the real backend
// (education.education.api.mark_assessment_result) calls json.loads() on it.
export function markAssessmentResult(assessment_plan, scores) {
  return api(`${METHOD}.mark_assessment_result`, {
    assessment_plan,
    scores: JSON.stringify(scores),
  });
}

export function submitAssessmentResults(assessment_plan, student_group) {
  return api(`${METHOD}.submit_assessment_results`, { assessment_plan, student_group });
}
