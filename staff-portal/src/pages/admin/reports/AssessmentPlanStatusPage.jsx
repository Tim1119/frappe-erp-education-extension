import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { AssessmentStatusBar } from "@/components/charts/AssessmentStatusBar";
import { getReportData } from "@/services/reportService";
import { getLeafAssessmentGroups } from "@/services/assessmentReportsService";
import { getErrorMessage } from "@/utils/errors";
import { t } from "@/config/translations";

// Real report ("Assessment Plan Status", Script Report, ref_doctype:
// Assessment Plan). Roles: Academics User ONLY -- not Instructor-visible,
// confirmed rather than assumed. Real filters (both optional, neither
// reqd): assessment_group (real get_query: is_group: 0, leaf groups
// only), schedule_date (labeled "Scheduled Upto"). Fixed columns (not
// dynamic here). add_total_row: 0.
//
// Chart data: get_assessment_data() accumulates [total_strength, saved,
// submitted, remaining] as a running sum in the SAME loop that builds the
// row data (not a separate query) -- remaining is computed per-row as
// student_group_strength - saved - submitted. Real chart type is
// "percentage", built from chart_data[1:] = [saved, submitted, remaining].
// Read directly from the report response's own chart.data.datasets[0]
// .values (the authoritative server total) rather than recomputed from
// displayed rows, so it never drifts from what Desk itself shows.
export default function AssessmentPlanStatusPage() {
  const navigate = useNavigate();
  const [assessmentGroup, setAssessmentGroup] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [assessmentGroupOptions, setAssessmentGroupOptions] = useState([]);

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [chartValues, setChartValues] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeafAssessmentGroups().then((r) => setAssessmentGroupOptions(r || [])).catch(() => {});
  }, []);

  async function load() {
    try {
      setLoading(true);
      const r = await getReportData("Assessment Plan Status", {
        assessment_group: assessmentGroup || undefined,
        schedule_date: scheduleDate || undefined,
      });
      const displayColumns = (r.columns || []).map((c) => ({ ...c, label: t(c.label) }));
      const cleanRows = (r.result || []).filter((row) => !Array.isArray(row));
      setColumns(displayColumns);
      setRows(cleanRows);

      const values = r.chart?.data?.datasets?.[0]?.values;
      setChartValues(Array.isArray(values) && values.length === 3 ? values : [0, 0, 0]);
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

  return (
    <>
      <PageHeader
        title="Assessment Plan Status"
        description={loading ? "Loading…" : `${rows.length} row${rows.length === 1 ? "" : "s"}`}
      >
        <ReportToolbar filenameBase="assessment-plan-status" columns={columns} rows={visibleRows} />
      </PageHeader>

      <Card className="no-print mb-4 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label>Assessment Group</Label>
            <Select value={assessmentGroup} onValueChange={setAssessmentGroup}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="All leaf assessment groups" />
              </SelectTrigger>
              <SelectContent>
                {assessmentGroupOptions.map((g) => (
                  <SelectItem key={g.name} value={g.name}>{g.assessment_group_name || g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Scheduled Upto</Label>
            <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
          </div>

          <Button onClick={load} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Run Report
          </Button>
        </div>
      </Card>

      {chartValues && (
        <div className="mb-4">
          <AssessmentStatusBar saved={chartValues[0]} submitted={chartValues[1]} remaining={chartValues[2]} />
        </div>
      )}

      <div className="report-printable rounded-md border">
        <ReportTable
          columns={columns}
          rows={rows}
          onVisibleRowsChange={setVisibleRows}
          showTotals={false}
          onRowClick={(row) => {
            if (row.student_group) navigate(`/dashboard/class-arms/${encodeURIComponent(row.student_group)}`);
          }}
          emptyMessage="No assessment plans found for these filters"
        />
      </div>
    </>
  );
}
