import Report from "@/pages/admin/buying/reports/components/BuyingReportPage";

const months = [
  { value: 1, label: "Jan" }, { value: 2, label: "Feb" },
  { value: 3, label: "Mar" }, { value: 4, label: "Apr" },
  { value: 5, label: "May" }, { value: 6, label: "Jun" },
  { value: 7, label: "Jul" }, { value: 8, label: "Aug" },
  { value: 9, label: "Sep" }, { value: 10, label: "Oct" },
  { value: 11, label: "Nov" }, { value: 12, label: "Dec" },
];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 11 }, (_, index) => String(currentYear - index));

const company = { name: "company", label: "Company", doctype: "Company", required: true, defaultFirst: true };
const employee = { name: "employee", label: "Employee", doctype: "Employee" };
const department = { name: "department", label: "Department", doctype: "Department" };
const branch = { name: "branch", label: "Branch", doctype: "Branch" };
const monthlyFilters = [
  company,
  { name: "month", label: "Month", type: "select", options: months, required: true, default: new Date().getMonth() + 1 },
  { name: "year", label: "Year", type: "select", options: years, required: true, default: String(currentYear) },
  department,
  branch,
];

function PayrollReport({ title, filters }) {
  return <Report eyebrow="Salary Payout · Reports" title={title} report={title} filters={filters} />;
}

export function SalaryRegisterPage() {
  return <PayrollReport title="Salary Register" filters={[
    { name: "from_date", label: "From", type: "date", default: "monthAgo", required: true },
    { name: "to_date", label: "To", type: "date", default: "today", required: true },
    { name: "currency", label: "Currency", doctype: "Currency" },
    employee,
    company,
    { name: "docstatus", label: "Document Status", type: "select", options: ["Draft", "Submitted", "Cancelled"], default: "Submitted" },
    department,
    { name: "designation", label: "Designation", doctype: "Designation" },
    branch,
  ]} />;
}

export function BankRemittancePage() {
  return <PayrollReport title="Bank Remittance" filters={[
    company,
    { name: "from_date", label: "From Date", type: "date", default: "monthStart" },
    { name: "to_date", label: "To Date", type: "date", default: "today" },
  ]} />;
}

export function SalaryPaymentsBasedOnPaymentModePage() {
  return <PayrollReport title="Salary Payments Based On Payment Mode" filters={monthlyFilters} />;
}

export function SalaryPaymentsViaECSPage() {
  return <PayrollReport title="Salary Payments via ECS" filters={[
    ...monthlyFilters,
    { name: "type", label: "Type", type: "select", options: ["Bank", "Cash", "Cheque"] },
  ]} />;
}

export function IncomeTaxComputationPage() {
  return <PayrollReport title="Income Tax Computation" filters={[
    company,
    { name: "payroll_period", label: "Payroll Period", doctype: "Payroll Period", required: true },
    employee,
    department,
    { name: "employee_status", label: "Employee Status", type: "select", options: ["Active", "Inactive", "Suspended", "Left"], default: "Active" },
    { name: "consider_tax_exemption_declaration", label: "Consider Tax Exemption Declaration", type: "check", default: 0 },
  ]} />;
}

export function ProvidentFundDeductionsPage() {
  return <PayrollReport title="Provident Fund Deductions" filters={monthlyFilters} />;
}

export function ProfessionalTaxDeductionsPage() {
  return <PayrollReport title="Professional Tax Deductions" filters={monthlyFilters} />;
}

export function IncomeTaxDeductionsPage() {
  return <PayrollReport title="Income Tax Deductions" filters={monthlyFilters} />;
}
