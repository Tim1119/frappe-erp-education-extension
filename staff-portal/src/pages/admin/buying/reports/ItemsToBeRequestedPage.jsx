import Report from "./components/BuyingReportPage";

// This installed Query Report is defined entirely by SQL and has no filters.
export default function ItemsToBeRequestedPage() {
  return <Report title="Items To Be Requested" report="Items To Be Requested" filters={[]} />;
}
