import Report from "./components/BuyingReportPage";

const filters = [
  { name: "company", label: "Company", doctype: "Company", required: true },
  { name: "from_date", label: "From Date", type: "date", default: "monthAgo", required: true },
  { name: "to_date", label: "To Date", type: "date", default: "today", required: true },
  { name: "item_group", label: "Item Group", doctype: "Item Group" },
  { name: "item_code", label: "Item", doctype: "Item" },
  { name: "supplier", label: "Supplier", doctype: "Supplier" },
];

export default function ItemWisePurchaseHistoryPage() {
  return <Report title="Item-wise Purchase History" report="Item-wise Purchase History" filters={filters} />;
}
