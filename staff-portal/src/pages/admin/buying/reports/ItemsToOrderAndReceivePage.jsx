import Report from "./components/BuyingReportPage";

const filters = [
  { name: "company", label: "Company", doctype: "Company", required: true },
  { name: "from_date", label: "From Date", type: "date", default: "monthAgo", required: true },
  { name: "to_date", label: "To Date", type: "date", default: "today", required: true },
  { name: "material_request", label: "Material Request", doctype: "Material Request" },
  { name: "item_code", label: "Item", doctype: "Item" },
  { name: "group_by_mr", label: "Group by Material Request", type: "check", default: 0 },
];

export default function ItemsToOrderAndReceivePage() {
  return <Report title="Items to Order and Receive" report="Requested Items to Order and Receive" filters={filters} />;
}
