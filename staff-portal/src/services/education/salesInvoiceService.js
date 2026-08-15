import api from "../api";

const METHOD = "education_extension.staff_portal_api.education.sales_invoice_api";

export function getSalesInvoices(params) {
  return api(`${METHOD}.get_sales_invoices`, params);
}

export function getSalesInvoice(name) {
  return api(`${METHOD}.get_sales_invoice`, { name });
}

export function getSalesInvoiceMeta() {
  return api(`${METHOD}.get_sales_invoice_meta`);
}

export function searchLinkOptions(doctype, search) {
  return api(`${METHOD}.search_link_options`, { doctype, search });
}

export function createSalesInvoice(data) {
  return api(`${METHOD}.create_sales_invoice`, { data });
}

export function updateSalesInvoice(name, data) {
  return api(`${METHOD}.update_sales_invoice`, { name, data });
}

export function deleteSalesInvoice(name) {
  return api(`${METHOD}.delete_sales_invoice`, { name });
}

export function submitSalesInvoice(name) {
  return api(`${METHOD}.submit_sales_invoice`, { name });
}

export function cancelSalesInvoice(name) {
  return api(`${METHOD}.cancel_sales_invoice`, { name });
}

export function getConnections(name) {
  return api(`${METHOD}.get_connections`, { name });
}

export function getCustomers() {
  return api(`${METHOD}.get_customers`);
}

export function getCustomerName(customer) {
  return api(`${METHOD}.get_customer_name`, { customer });
}

export function getSubmittedSalesInvoices() {
  return api(`${METHOD}.get_submitted_sales_invoices`);
}

export function getStudents() {
  return api(`${METHOD}.get_students`);
}

export function getItems() {
  return api(`${METHOD}.get_items`);
}

export function getCompanies() {
  return api(`${METHOD}.get_companies`);
}

export function getDebitAccounts(company) {
  return api(`${METHOD}.get_debit_accounts`, { company });
}

export function getIncomeAccounts(company) {
  return api(`${METHOD}.get_income_accounts`, { company });
}

export function getCostCenters(company) {
  return api(`${METHOD}.get_cost_centers`, { company });
}

export function getFeeSchedules() {
  return api(`${METHOD}.get_fee_schedules`);
}

export function getNamingSeries() {
  return api(`${METHOD}.get_naming_series`);
}

export function getCurrencies() {
  return api(`${METHOD}.get_currencies`);
}

export function getTaxTemplates() {
  return api(`${METHOD}.get_tax_templates`);
}

export function getTaxCategories() {
  return api(`${METHOD}.get_tax_categories`);
}

export function getTaxAccounts(company) {
  return api(`${METHOD}.get_tax_accounts`, { company });
}

export function getLetterHeads() {
  return api(`${METHOD}.get_letter_heads`);
}

export function getPrintHeadings() {
  return api(`${METHOD}.get_print_headings`);
}

export function getAcademicYears() {
  return api(`${METHOD}.get_academic_years`);
}

export function getAcademicTerms(academic_year) {
  return api(`${METHOD}.get_academic_terms`, { academic_year });
}
