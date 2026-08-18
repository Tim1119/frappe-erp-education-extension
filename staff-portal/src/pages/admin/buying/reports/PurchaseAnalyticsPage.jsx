import Report from "./components/BuyingReportPage";

// These names and defaults mirror ERPNext's purchase_analytics.js. The
// Analytics class assumes every required dimension exists before run().
const filters = [
  {
    name: "tree_type",
    label: "Tree Type",
    type: "select",
    options: ["Supplier Group", "Supplier", "Item Group", "Item"],
    default: "Supplier",
    required: true,
  },
  {
    name: "doc_type",
    label: "Based On",
    type: "select",
    options: ["Purchase Order", "Purchase Receipt", "Purchase Invoice"],
    default: "Purchase Invoice",
    required: true,
  },
  {
    name: "value_quantity",
    label: "Value or Quantity",
    type: "select",
    options: ["Value", "Quantity"],
    default: "Value",
    required: true,
  },
  { name: "from_date", label: "From Date", type: "date", default: "yearStart", required: true },
  { name: "to_date", label: "To Date", type: "date", default: "yearEnd", required: true },
  { name: "company", label: "Company", doctype: "Company", required: true },
  {
    name: "range",
    label: "Range",
    type: "select",
    options: ["Weekly", "Monthly", "Quarterly", "Yearly"],
    default: "Monthly",
    required: true,
  },
];

export default function PurchaseAnalyticsPage() {
  return <Report title="Purchase Analytics" report="Purchase Analytics" filters={filters} />;
}
