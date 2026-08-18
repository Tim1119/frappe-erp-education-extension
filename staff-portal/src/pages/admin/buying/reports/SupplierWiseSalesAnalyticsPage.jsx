import Report from "./components/BuyingReportPage";

const filters = [
  { name: "supplier", label: "Supplier", doctype: "Supplier" },
  { name: "from_date", label: "From Date", type: "date", default: "monthStart" },
  { name: "to_date", label: "To Date", type: "date", default: "monthEnd" },
];

export default function SupplierWiseSalesAnalyticsPage() {
  return <Report title="Supplier-Wise Sales Analytics" report="Supplier-Wise Sales Analytics" filters={filters} />;
}
