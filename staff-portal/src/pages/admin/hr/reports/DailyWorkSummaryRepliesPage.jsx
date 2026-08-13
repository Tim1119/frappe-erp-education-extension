import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/shared/PageHeader";
import ReportTable from "@/components/shared/ReportTable";
import ReportToolbar from "@/components/shared/ReportToolbar";
import ReportPrintHeader from "@/components/shared/ReportPrintHeader";
import { getReportData, getLinkOptions } from "@/services/reportService";
import { getErrorMessage } from "@/utils/errors";
import { t } from "@/config/translations";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function monthAgoStr() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}

// Real report ("Daily Work Summary Replies", Script Report, ref_doctype:
// Daily Work Summary). Real filters: group (Link -> Daily Work Summary
// Group, required), range (fieldtype "DateRange", required) -- Desk's
// DateRange widget submits ONE filter value as a [from, to] two-element
// array under the single fieldname "range", so this renders as two Date
// inputs and combines them into that array shape when the report runs.
// execute() returns [] early if group isn't set, and the real column
// "user" holds full_name (not a linkable doctype record in this portal),
// so there's no row-click navigation here.
export default function DailyWorkSummaryRepliesPage() {
  const [group, setGroup] = useState("");
  const [fromDate, setFromDate] = useState(monthAgoStr());
  const [toDate, setToDate] = useState(todayStr());
  const [groupOptions, setGroupOptions] = useState([]);

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    getLinkOptions("Daily Work Summary Group").then(setGroupOptions).catch(() => {});
  }, []);

  async function load() {
    if (!group || !fromDate || !toDate) {
      toast.error("Group and Date Range are required.");
      return;
    }
    try {
      setLoading(true);
      const r = await getReportData("Daily Work Summary Replies", {
        group,
        range: [fromDate, toDate],
      });
      const displayColumns = (r.columns || []).map((c) => ({ ...c, label: t(c.label) }));
      const cleanRows = (r.result || []).filter((row) => !Array.isArray(row));
      setColumns(displayColumns);
      setRows(cleanRows);
      setHasRun(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const printFilters = [
    { label: "Group", value: group },
    { label: "Date Range", value: fromDate && toDate ? `${fromDate} – ${toDate}` : "" },
  ];

  return (
    <>
      <PageHeader
        title="Daily Work Summary Replies"
        description={hasRun ? `${rows.length} row${rows.length === 1 ? "" : "s"}` : "Select filters and run the report"}
      >
        <ReportToolbar filenameBase="daily-work-summary-replies" columns={columns} rows={visibleRows} />
      </PageHeader>

      <Card className="no-print mb-4 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label>Group <span className="text-destructive">*</span></Label>
            <Select value={group} onValueChange={setGroup}>
              <SelectTrigger className="w-56"><SelectValue placeholder="Select group" /></SelectTrigger>
              <SelectContent>
                {groupOptions.map((g) => <SelectItem key={g.name} value={g.name}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>From Date <span className="text-destructive">*</span></Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>To Date <span className="text-destructive">*</span></Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
          </div>

          <Button onClick={load} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Run Report
          </Button>
        </div>
      </Card>

      {hasRun && (
        <div className="report-printable rounded-md border">
          <ReportPrintHeader title="Daily Work Summary Replies" filters={printFilters} />
          <ReportTable
            columns={columns}
            rows={rows}
            onVisibleRowsChange={setVisibleRows}
            showTotals={false}
            emptyMessage="No replies found for this group and date range"
          />
        </div>
      )}
    </>
  );
}
