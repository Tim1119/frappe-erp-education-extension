import { callMethod } from "../frappeClient";

const NS = "education_extension.staff_portal_api.hr";

export function getCompanies(params = {}) {
  return callMethod(`${NS}.company_api.get_companies`, params);
}

export function getCompany(name) {
  return callMethod(`${NS}.company_api.get_company`, { name });
}

export function getCompanyMeta() {
  return callMethod(`${NS}.company_api.get_company_meta`);
}

export function getLinkOptions(doctype, company) {
  return callMethod(`${NS}.company_api.get_link_options`, { doctype, company });
}

const companyLookup = (method) => (company) =>
  callMethod(`${NS}.company_api.${method}`, { company });

export const getOperatingCostAccounts = companyLookup("get_operating_cost_accounts");
export const getSalesContacts = companyLookup("get_sales_contacts");
export const getInTransitWarehouses = companyLookup("get_in_transit_warehouses");
export const getSalesReturnWarehouses = companyLookup("get_sales_return_warehouses");
export const getBankAccounts = companyLookup("get_bank_accounts");
export const getCashAccounts = companyLookup("get_cash_accounts");
export const getReceivableAccounts = companyLookup("get_receivable_accounts");
export const getPayableAccounts = companyLookup("get_payable_accounts");
export const getExpenseAccounts = companyLookup("get_expense_accounts");
export const getIncomeAccounts = companyLookup("get_income_accounts");
export const getRoundOffAccounts = companyLookup("get_round_off_accounts");
export const getOpeningRoundOffAccounts = companyLookup("get_opening_round_off_accounts");
export const getWriteOffAccounts = companyLookup("get_write_off_accounts");
export const getDeferredExpenseAccounts = companyLookup("get_deferred_expense_accounts");
export const getDeferredRevenueAccounts = companyLookup("get_deferred_revenue_accounts");
export const getDiscountAccounts = companyLookup("get_discount_accounts");
export const getExchangeGainLossAccounts = companyLookup("get_exchange_gain_loss_accounts");
export const getUnrealizedExchangeGainLossAccounts = companyLookup("get_unrealized_exchange_gain_loss_accounts");
export const getAccumulatedDepreciationAccounts = companyLookup("get_accumulated_depreciation_accounts");
export const getDepreciationExpenseAccounts = companyLookup("get_depreciation_expense_accounts");
export const getDisposalAccounts = companyLookup("get_disposal_accounts");
export const getInventoryAccounts = companyLookup("get_inventory_accounts");
export const getAssetValuationAccounts = companyLookup("get_asset_valuation_accounts");
export const getCapitalWorkInProgressAccounts = companyLookup("get_capital_work_in_progress_accounts");
export const getAssetReceivedNotBilledAccounts = companyLookup("get_asset_received_not_billed_accounts");
export const getUnrealizedProfitLossAccounts = companyLookup("get_unrealized_profit_loss_accounts");
export const getProvisionalAccounts = companyLookup("get_provisional_accounts");
export const getAdvanceReceivedAccounts = companyLookup("get_advance_received_accounts");
export const getAdvancePaidAccounts = companyLookup("get_advance_paid_accounts");
export const getStockAdjustmentAccounts = companyLookup("get_stock_adjustment_accounts");
export const getExpensesIncludedValuationAccounts = companyLookup("get_expenses_included_valuation_accounts");
export const getStockReceivedNotBilledAccounts = companyLookup("get_stock_received_not_billed_accounts");
export const getCostCenters = companyLookup("get_cost_centers");

export function getSellingTerms() {
  return callMethod(`${NS}.company_api.get_selling_terms`);
}

export function getBuyingTerms() {
  return callMethod(`${NS}.company_api.get_buying_terms`);
}

export function createCompany(data) {
  return callMethod(`${NS}.company_api.create_company`, { data });
}

export function updateCompany(name, data) {
  return callMethod(`${NS}.company_api.update_company`, { name, data });
}

export function deleteCompany(name) {
  return callMethod(`${NS}.company_api.delete_company`, { name });
}

export function getCompanyConnections(company) {
  return callMethod(`${NS}.company_api.get_connections`, { company });
}

export function getCurrencies() {
  return callMethod(`${NS}.company_api.get_currencies`);
}

export function getCountries() {
  return callMethod(`${NS}.company_api.get_countries`);
}

export function getParentCompanies() {
  return callMethod(`${NS}.company_api.get_parent_companies`);
}

export function getDomains() {
  return callMethod(`${NS}.company_api.get_domains`);
}
