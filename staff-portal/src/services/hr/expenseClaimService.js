import { callMethod } from "../frappeClient";

const N = "education_extension.staff_portal_api.hr.expense_claim_api";

export const getExpenseClaims = (params = {}) => callMethod(`${N}.get_expense_claims`, params);
export const getExpenseClaim = (name) => callMethod(`${N}.get_expense_claim`, { name });
export const createExpenseClaim = (data) => callMethod(`${N}.create_expense_claim`, { data });
export const updateExpenseClaim = (name, data) => callMethod(`${N}.update_expense_claim`, { name, data });
export const deleteExpenseClaim = (name) => callMethod(`${N}.delete_expense_claim`, { name });
export const submitExpenseClaim = (name) => callMethod(`${N}.submit_expense_claim`, { name });
export const cancelExpenseClaim = (name) => callMethod(`${N}.cancel_expense_claim`, { name });

export const getExpenseClaimEmployees = () => callMethod(`${N}.get_employees`);
export const getExpenseClaimOptions = (doctype) => callMethod(`${N}.get_options`, { doctype });
export const getExpenseClaimDepartments = (company) => callMethod(`${N}.get_departments`, { company });
export const getExpenseClaimTasks = (project) => callMethod(`${N}.get_tasks`, { project });
export const getExpenseClaimApprovers = (employee) => callMethod(`${N}.get_approvers`, { employee });
export const getExpenseClaimAccounts = (company, kind) => callMethod(`${N}.get_accounts`, { company, kind });
export const getExpenseClaimCostCenters = (company) => callMethod(`${N}.get_cost_centers`, { company });
export const getExpenseClaimAdvances = (employee, company) => callMethod(`${N}.get_advances`, { employee, company });
export const getExpenseAccountAndCostCenter = (expense_type, company) =>
  callMethod(`${N}.get_expense_account_and_cost_center`, { expense_type, company });
