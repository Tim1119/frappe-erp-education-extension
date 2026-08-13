import { callMethod } from "../frappeClient";

const N = "education_extension.staff_portal_api.accounting.document_api";
export const getAccountingMeta = (doctype) => callMethod(`${N}.get_meta`, { doctype });
export const getAccountingDocuments = (doctype, params = {}) => callMethod(`${N}.get_documents`, { doctype, ...params });
export const getAccountingDocument = (doctype, name) => callMethod(`${N}.get_document`, { doctype, name });
export const createAccountingDocument = (doctype, data) => callMethod(`${N}.create_document`, { doctype, data });
export const updateAccountingDocument = (doctype, name, data) => callMethod(`${N}.update_document`, { doctype, name, data });
export const deleteAccountingDocument = (doctype, name) => callMethod(`${N}.delete_document`, { doctype, name });
export const submitAccountingDocument = (doctype, name) => callMethod(`${N}.submit_document`, { doctype, name });
export const cancelAccountingDocument = (doctype, name) => callMethod(`${N}.cancel_document`, { doctype, name });
export const submitPurchaseInvoice = (name) => submitAccountingDocument("Purchase Invoice", name);
export const cancelPurchaseInvoice = (name) => cancelAccountingDocument("Purchase Invoice", name);
export const getAccountingLinkOptions = (link_doctype, params = {}) => callMethod(`${N}.get_link_options`, { link_doctype, ...params });
export const getAccountingConnections = (doctype, name) => callMethod(`${N}.get_connections`, { doctype, name });
export const getUnreconciledEntries = (data) => callMethod(`${N}.get_unreconciled_entries`, { data });
export const allocateReconciliation = (data) => callMethod(`${N}.allocate_reconciliation`, { data });
export const reconcileEntries = (data) => callMethod(`${N}.reconcile_entries`, { data });
