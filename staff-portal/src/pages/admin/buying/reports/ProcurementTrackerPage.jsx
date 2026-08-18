import Report from "./components/BuyingReportPage";

const filters = [
  { name: "company", label: "Company", doctype: "Company", defaultFirst: true },
  { name: "cost_center", label: "Cost Center", doctype: "Cost Center" },
  { name: "project", label: "Project", doctype: "Project" },
  { name: "from_date", label: "From Date", type: "date", default: "yearStart" },
  { name: "to_date", label: "To Date", type: "date", default: "yearEnd" },
];

export default function ProcurementTrackerPage() {
  return <Report title="Procurement Tracker" report="Procurement Tracker" filters={filters} />;
}
