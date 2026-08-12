import { callMethod } from "../frappeClient";

const NS = "education_extension.staff_portal_api.hr.employee_grade_api";
export const getEmployeeGrades = (params = {}) => callMethod(`${NS}.get_employee_grades`, params);
export const getEmployeeGrade = (name) => callMethod(`${NS}.get_employee_grade`, { name });
export const createEmployeeGrade = (data) => callMethod(`${NS}.create_employee_grade`, { data });
export const updateEmployeeGrade = (name, data) => callMethod(`${NS}.update_employee_grade`, { name, data });
export const deleteEmployeeGrade = (name) => callMethod(`${NS}.delete_employee_grade`, { name });
export const getEmployeeGradeSalaryStructures = () => callMethod(`${NS}.get_salary_structures`);
export const getEmployeeGradeConnections = (employee_grade) => callMethod(`${NS}.get_connections`, { employee_grade });
