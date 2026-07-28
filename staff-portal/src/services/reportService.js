import api from "./api";

// Generic runner for any real Frappe Report doctype -- mirrors exactly how
// Desk itself runs Query Reports and Script Reports, so no per-report
// backend endpoint is needed under staff_portal_api/.
export function getReportData(reportName, filters = {}) {
  return api("frappe.desk.query_report.run", {
    report_name: reportName,
    filters,
  });
}
