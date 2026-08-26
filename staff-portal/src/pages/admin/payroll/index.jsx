import Form from "@/pages/admin/hr/recruitment/shared/RecruitmentForm";
import FormPage from "@/pages/admin/hr/recruitment/shared/RecruitmentFormPage";
import ListPage from "@/pages/admin/hr/recruitment/shared/RecruitmentListPage";
import ProfilePage from "@/pages/admin/hr/recruitment/shared/RecruitmentProfilePage";
import { payrollService } from "@/services/payroll/payrollService";

const field = (name, label, type = "text", options = {}) => ({ name, label, type, ...options });
const company = field("company", "Company", "link", { doctype: "Company", required: true });
const employee = field("employee", "Employee", "link", { doctype: "Employee", required: true });
const docstatus = "docstatus";

const definitions = {
  salaryComponents: { api: "salary_component", base: "salary-components", title: "Salary Component", plural: "Salary Components", list: ["name", "salary_component_abbr", "type", "disabled"], fields: [field("salary_component", "Salary Component", "text", { required: true }), field("salary_component_abbr", "Abbreviation", "text", { required: true }), field("type", "Type", "select", { required: true, options: ["Earning", "Deduction"] }), field("description", "Description", "textarea", { full: true }), field("depends_on_payment_days", "Depends on Payment Days", "check"), field("is_tax_applicable", "Is Tax Applicable", "check"), field("is_flexible_benefit", "Is Flexible Benefit", "check"), field("disabled", "Disabled", "check")] },
  salaryStructures: { api: "salary_structure", base: "salary-structures", title: "Salary Structure", plural: "Salary Structures", submittable: true, list: ["name", "company", "payroll_frequency", "currency", "is_active", docstatus], fields: [field("name", "Salary Structure Name", "text", { required: true }), company, field("payroll_frequency", "Payroll Frequency", "select", { required: true, options: ["Monthly", "Fortnightly", "Bimonthly", "Weekly", "Daily"] }), field("currency", "Currency", "link", { doctype: "Currency" }), field("is_active", "Is Active", "select", { options: ["Yes", "No"], default: "Yes" }), field("salary_slip_based_on_timesheet", "Salary Slip Based on Timesheet", "check"), field("leave_encashment_amount_per_day", "Leave Encashment Amount Per Day", "currency"), field("max_benefits", "Maximum Benefits", "currency")] },
  incomeTaxSlabs: { api: "income_tax_slab", base: "income-tax-slabs", title: "Income Tax Slab", plural: "Income Tax Slabs", submittable: true, list: ["name", "company", "effective_from", "currency", "disabled", docstatus], fields: [field("name", "Income Tax Slab Name", "text", { required: true }), company, field("effective_from", "Effective From", "date", { required: true }), field("currency", "Currency", "link", { doctype: "Currency" }), field("disabled", "Disabled", "check")] },
  payrollPeriods: { api: "payroll_period", base: "payroll-periods", title: "Payroll Period", plural: "Payroll Periods", list: ["name", "company", "start_date", "end_date"], fields: [field("name", "Payroll Period Name", "text", { required: true }), company, field("start_date", "Start Date", "date", { required: true }), field("end_date", "End Date", "date", { required: true })] },
  salaryStructureAssignments: { api: "salary_structure_assignment", base: "salary-structure-assignments", title: "Salary Structure Assignment", plural: "Salary Structure Assignments", submittable: true, list: ["name", "employee", "employee_name", "salary_structure", "from_date", "base", docstatus], fields: [employee, field("employee_name", "Employee Name", "text", { readOnly: true }), company, field("salary_structure", "Salary Structure", "link", { doctype: "Salary Structure", required: true }), field("from_date", "From Date", "date", { required: true }), field("base", "Base", "currency", { required: true }), field("variable", "Variable", "currency"), field("income_tax_slab", "Income Tax Slab", "link", { doctype: "Income Tax Slab" })] },
  salarySlips: { api: "salary_slip", base: "salary-slips", title: "Salary Slip", plural: "Salary Slips", submittable: true, statusField: "status", statuses: ["Draft", "Submitted", "Cancelled"], list: ["name", "employee", "employee_name", "start_date", "end_date", "gross_pay", "net_pay", "status", docstatus], fields: [employee, field("employee_name", "Employee Name", "text", { readOnly: true }), company, field("posting_date", "Posting Date", "date"), field("payroll_frequency", "Payroll Frequency", "select", { options: ["Monthly", "Fortnightly", "Bimonthly", "Weekly", "Daily"] }), field("start_date", "Start Date", "date", { required: true }), field("end_date", "End Date", "date", { required: true }), field("salary_structure", "Salary Structure", "link", { doctype: "Salary Structure" }), field("currency", "Currency", "link", { doctype: "Currency" }), field("gross_pay", "Gross Pay", "currency", { readOnly: true }), field("total_deduction", "Total Deduction", "currency", { readOnly: true }), field("net_pay", "Net Pay", "currency", { readOnly: true })] },
  payrollEntries: { api: "payroll_entry", base: "payroll-entries", title: "Payroll Entry", plural: "Payroll Entries", submittable: true, statusField: "status", statuses: ["Draft", "Submitted", "Cancelled"], list: ["name", "company", "posting_date", "payroll_frequency", "start_date", "end_date", "status", docstatus], fields: [company, field("posting_date", "Posting Date", "date", { required: true }), field("payroll_frequency", "Payroll Frequency", "select", { required: true, options: ["Monthly", "Fortnightly", "Bimonthly", "Weekly", "Daily"] }), field("start_date", "Start Date", "date", { required: true }), field("end_date", "End Date", "date", { required: true }), field("department", "Department", "link", { doctype: "Department" }), field("branch", "Branch", "link", { doctype: "Branch" }), field("project", "Project", "link", { doctype: "Project" }), field("cost_center", "Cost Center", "link", { doctype: "Cost Center" }), field("payment_account", "Payment Account", "link", { doctype: "Account" })] },
  salaryWithholdings: { api: "salary_withholding", base: "salary-withholdings", title: "Salary Withholding", plural: "Salary Withholdings", submittable: true, list: ["name", "employee", "employee_name", "from_date", "to_date", docstatus], fields: [employee, field("employee_name", "Employee Name", "text", { readOnly: true }), company, field("from_date", "From Date", "date", { required: true }), field("to_date", "To Date", "date", { required: true }), field("reason", "Reason", "textarea", { full: true })] },
  additionalSalaries: { api: "additional_salary", base: "additional-salaries", title: "Additional Salary", plural: "Additional Salaries", submittable: true, list: ["name", "employee", "employee_name", "salary_component", "payroll_date", "amount", docstatus], fields: [employee, field("employee_name", "Employee Name", "text", { readOnly: true }), company, field("salary_component", "Salary Component", "link", { doctype: "Salary Component", required: true }), field("payroll_date", "Payroll Date", "date", { required: true }), field("currency", "Currency", "link", { doctype: "Currency" }), field("amount", "Amount", "currency", { required: true }), field("overwrite_salary_structure_amount", "Overwrite Salary Structure Amount", "check")] },
  employeeIncentives: { api: "employee_incentive", base: "employee-incentives", title: "Employee Incentive", plural: "Employee Incentives", submittable: true, list: ["name", "employee", "employee_name", "payroll_date", "incentive_amount", docstatus], fields: [employee, field("employee_name", "Employee Name", "text", { readOnly: true }), company, field("payroll_date", "Payroll Date", "date", { required: true }), field("currency", "Currency", "link", { doctype: "Currency" }), field("incentive_amount", "Incentive Amount", "currency", { required: true })] },
  retentionBonuses: { api: "retention_bonus", base: "retention-bonuses", title: "Retention Bonus", plural: "Retention Bonuses", submittable: true, list: ["name", "employee", "employee_name", "salary_component", "bonus_payment_date", "bonus_amount", "currency", docstatus], fields: [employee, field("employee_name", "Employee Name", "text", { readOnly: true }), field("department", "Department", "link", { doctype: "Department", readOnly: true }), company, field("date_of_joining", "Date of Joining", "text", { readOnly: true }), field("salary_component", "Salary Component", "link", { doctype: "Salary Component", required: true }), field("bonus_amount", "Bonus Amount", "currency", { required: true }), field("bonus_payment_date", "Bonus Payment Date", "date", { required: true }), field("currency", "Currency", "link", { doctype: "Currency", readOnly: true, required: true })] },
};

for (const definition of Object.values(definitions)) {
  definition.eyebrow = "Salary Payout";
  definition.service = payrollService(definition.api);
  definition.titleField ||= "name";
  definition.employeeField = definition.fields.some((item) => item.name === "employee") ? "employee" : undefined;
  definition.employeeMap = definition.employeeField ? { employee_name: "employee_name", company: "company", department: "department", designation: "designation" } : undefined;
}

definitions.retentionBonuses.employeeMap = {
  employee_name: "employee_name",
  department: "department",
  company: "company",
  date_of_joining: "date_of_joining",
  salary_currency: "currency",
};

function pages(config) {
  return {
    List: () => <ListPage config={config} />,
    Form: () => <FormPage config={config} Form={Form} />,
    Profile: () => <ProfilePage config={config} />,
  };
}

export const SalaryComponents = pages(definitions.salaryComponents);
export const SalaryStructures = pages(definitions.salaryStructures);
export const IncomeTaxSlabs = pages(definitions.incomeTaxSlabs);
export const PayrollPeriods = pages(definitions.payrollPeriods);
export const SalaryStructureAssignments = pages(definitions.salaryStructureAssignments);
export const SalarySlips = pages(definitions.salarySlips);
export const PayrollEntries = pages(definitions.payrollEntries);
export const SalaryWithholdings = pages(definitions.salaryWithholdings);
export const AdditionalSalaries = pages(definitions.additionalSalaries);
export const EmployeeIncentives = pages(definitions.employeeIncentives);
export const RetentionBonuses = pages(definitions.retentionBonuses);
