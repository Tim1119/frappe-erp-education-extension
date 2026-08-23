import api from "./api";
import { getList } from "./frappeClient";

// Generic runner for any real Frappe Report doctype -- mirrors exactly how
// Desk itself runs Query Reports and Script Reports, so no per-report
// backend endpoint is needed under staff_portal_api/.
export async function getReportData(reportName, filters = {}) {
  const response = await api("frappe.desk.query_report.run", {
    report_name: reportName,
    filters,
  });

  // Standard query reports expose rows as `result`; some ERPNext analytics
  // reports expose the same payload as `data`. Give every report page one
  // stable response shape without dropping chart or summary metadata.
  if (response && response.result === undefined && Array.isArray(response.data)) {
    return { ...response, result: response.data };
  }
  return response;
}

// Shared fetch for a report's Link-type filter options (Company,
// Department, Employee, etc.) -- every report filter bar needs this same
// "list every record of doctype X" lookup, so it lives here once instead
// of being re-implemented per report page.
export function getLinkOptions(doctype, filters = {}, requestedFields = []) {
  const displayFields = {
    Employee: "employee_name",
    Supplier: "supplier_name",
    Item: "item_name",
    Customer: "customer_name",
  };
  const displayField = displayFields[doctype];
  const fields = [...new Set(["name", ...(displayField ? [displayField] : []), ...requestedFields])];
  const mergedFilters = doctype === "Employee" ? { status: "Active", ...filters } : filters;
  const orderBy = doctype === "Employee" ? "employee_name asc" : "name asc";
  return getList(doctype, { fields, filters: mergedFilters, order_by: orderBy, limit_page_length: 500 });
}
