import { callMethod } from "../../frappeClient";
const NS="education_extension.staff_portal_api.hr.performance.employee_feedback_criteria_api";
export const getEmployeeFeedbackCriteria=params=>callMethod(`${NS}.get_employee_feedback_criteria`,params||{});
export const getEmployeeFeedbackCriterion=name=>callMethod(`${NS}.get_employee_feedback_criterion`,{name});
export const createEmployeeFeedbackCriterion=data=>callMethod(`${NS}.create_employee_feedback_criterion`,{data});
export const updateEmployeeFeedbackCriterion=(name,data)=>callMethod(`${NS}.update_employee_feedback_criterion`,{name,data});
export const deleteEmployeeFeedbackCriterion=name=>callMethod(`${NS}.delete_employee_feedback_criterion`,{name});
export const getEmployeeFeedbackCriteriaOptions=()=>callMethod(`${NS}.get_options`);
export const getEmployeeFeedbackCriteriaConnections=name=>callMethod(`${NS}.get_connections`,{name});
