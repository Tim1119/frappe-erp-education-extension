import Report from "./components/BuyingReportPage";

const filters = [
  { name: "company", label: "Company", doctype: "Company", required: true },
  { name: "from_date", label: "From Date", type: "date", default: "monthAgo", required: true },
  { name: "to_date", label: "To Date", type: "date", default: "today", required: true },
  { name: "item_code", label: "Item", doctype: "Item" },
  { name: "supplier", label: "Supplier", doctype: "Supplier", multiple: true },
  { name: "supplier_quotation", label: "Supplier Quotation", doctype: "Supplier Quotation", multiple: true },
  { name: "request_for_quotation", label: "Request for Quotation", doctype: "Request for Quotation" },
  { name: "categorize_by", label: "Categorize by", type: "select", options: ["Categorize by Supplier", "Categorize by Item"], default: "Categorize by Supplier" },
  { name: "include_expired", label: "Include Expired", type: "check", default: 0 },
];

export default function SupplierQuotationComparisonPage() {
  return <Report title="Supplier Quotation Comparison" report="Supplier Quotation Comparison" filters={filters} />;
}
