import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/shared/PageHeader";
import ReportTable from "@/components/shared/ReportTable";
import ReportToolbar from "@/components/shared/ReportToolbar";
import ReportPrintHeader from "@/components/shared/ReportPrintHeader";
import { FeeCollectionBarChart } from "@/components/charts/FeeCollectionBarChart";
import { getReportData } from "@/services/reportService";
import { getErrorMessage } from "@/utils/errors";
import { t } from "@/config/translations";

// The real report ("Program wise Fee Collection", shown here under its
// school-facing name) is a Script Report. Its .py execute() merges two
// real sources: Sales Invoice rows joined to Fee Schedule (grouped by Fee
// Schedule's program) and Fees rows directly (grouped by Fees' own
// program field) -- so, unlike Student Fee Collection, this one can
// reflect Fees-doctype rows too, if any ever exist. Its only real filters
// (program_wise_fee_collection.js) are from_date/to_date -- no
// program/academic_year/student_category filter exists despite the name.
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function oneMonthAgoStr() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}

export default function ClassFeeCollectionReportPage() {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState(oneMonthAgoStr());
  const [toDate, setToDate] = useState(todayStr());
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const r = await getReportData("Program wise Fee Collection", {
        from_date: fromDate,
        to_date: toDate,
      });
      const displayColumns = (r.columns || []).map((c) => ({ ...c, label: t(c.label) }));
      const cleanRows = (r.result || []).filter((row) => !Array.isArray(row));
      setColumns(displayColumns);
      setRows(cleanRows);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartData = rows.map((row) => ({
    label: row.program,
    paid: row.paid_amount || 0,
    outstanding: row.outstanding_amount || 0,
  }));

  return (
    <>
      <PageHeader
        title="Class wise Fee Collection Report"
        description={loading ? "Loading…" : `${rows.length} row${rows.length === 1 ? "" : "s"}`}
      >
        <ReportToolbar filenameBase="class-fee-collection-report" columns={columns} rows={visibleRows} />
      </PageHeader>

      <Card className="no-print mb-4 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label>From Date</Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>To Date</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
          </div>
          <Button onClick={load} disabled={loading || !fromDate || !toDate}>
            <RefreshCw className="mr-2 h-4 w-4" /> Run Report
          </Button>
        </div>
      </Card>

      <div className="mb-4">
        <FeeCollectionBarChart title="Fees Collected vs Outstanding, by Class" data={chartData} />
      </div>

      <div className="report-printable rounded-md border">
        <ReportPrintHeader
          title="Class wise Fee Collection Report"
          filters={[
            { label: "From Date", value: fromDate },
            { label: "To Date", value: toDate },
          ]}
        />
        <ReportTable
          columns={columns}
          rows={rows}
          onVisibleRowsChange={setVisibleRows}
          onRowClick={(row) => {
            if (row.program) navigate(`/dashboard/classes/${encodeURIComponent(row.program)}`);
          }}
          emptyMessage="No fee collection data found for this date range"
        />
      </div>
    </>
  );
}
