import api from "./api";
import { getList } from "./frappeClient";

// Generic runner for any real Frappe Report doctype -- mirrors exactly how
// Desk itself runs Query Reports and Script Reports, so no per-report
// backend endpoint is needed under staff_portal_api/.
export function getReportData(reportName, filters = {}) {
  return api("frappe.desk.query_report.run", {
    report_name: reportName,
    filters,
  });
}

// Shared fetch for a report's Link-type filter options (Company,
// Department, Employee, etc.) -- every report filter bar needs this same
// "list every record of doctype X" lookup, so it lives here once instead
// of being re-implemented per report page.
export function getLinkOptions(doctype, filters = {}) {
  const fields = doctype === "Employee" ? ["name", "employee_name"] : ["name"];
  const mergedFilters = doctype === "Employee" ? { status: "Active", ...filters } : filters;
  const orderBy = doctype === "Employee" ? "employee_name asc" : "name asc";
  return getList(doctype, { fields, filters: mergedFilters, order_by: orderBy, limit_page_length: 500 });
}
