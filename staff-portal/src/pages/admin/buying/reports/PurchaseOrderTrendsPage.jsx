import Report from "./components/BuyingReportPage";

const filters = [
  { name: "company", label: "Company", doctype: "Company", required: true },
  { name: "period", label: "Period", type: "select", options: ["Monthly", "Quarterly", "Half-Yearly", "Yearly"], default: "Monthly" },
  { name: "fiscal_year", label: "Fiscal Year", doctype: "Fiscal Year", default: "currentFiscalYear" },
  { name: "period_based_on", label: "Period based On", type: "select", options: [{ value: "posting_date", label: "Posting Date" }, { value: "bill_date", label: "Billing Date" }], default: "posting_date" },
  { name: "based_on", label: "Based On", type: "select", options: ["Item", "Item Group", "Supplier", "Supplier Group", "Project"], default: "Item" },
  { name: "group_by", label: "Group By", type: "select", options: ["Item", "Supplier"], default: "" },
  { name: "include_closed_orders", label: "Include Closed Orders", type: "check", default: 0 },
];

export default function PurchaseOrderTrendsPage() {
  return <Report title="Purchase Order Trends" report="Purchase Order Trends" filters={filters} />;
}
