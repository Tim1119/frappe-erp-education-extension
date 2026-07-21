import { useState } from 'react';
import toast from 'react-hot-toast';
import { Download, BarChart3, GraduationCap, CalendarCheck, Wallet, Briefcase, Info } from 'lucide-react';
import { PageHeader } from '../components/ui/Primitives';
import * as frappe from '../services/frappeClient';

const REPORT_CATALOG = [
  { key: 'attendance', title: 'Attendance Report', sub: 'Daily and termly attendance by student group', category: 'Attendance', method: 'education.education.api.export_attendance_report' },
  { key: 'assessment', title: 'Assessment Report', sub: 'Score distribution across assessment plans', category: 'Academic', method: 'education.education.api.export_assessment_report' },
  { key: 'student', title: 'Student Report', sub: 'Enrollment and demographics breakdown', category: 'Academic', method: 'education.education.api.export_student_report' },
  { key: 'academic', title: 'Academic Performance Report', sub: 'Assessment results and grade trends', category: 'Academic', method: 'education.education.api.export_academic_report' },
  { key: 'fees', title: 'Fee Collection Report', sub: 'Collections vs targets, outstanding balances', category: 'Finance', method: 'education.education.api.export_fee_report' },
  { key: 'hr', title: 'HR Report', sub: 'Staff headcount, leave and attendance', category: 'HR', method: 'hrms.hr.api.export_hr_report' },
];

const ICONS = { Attendance: CalendarCheck, Academic: GraduationCap, Finance: Wallet, HR: Briefcase };

export default function ReportsPage() {
  const [exporting, setExporting] = useState(null);

  const exportReport = async (report) => {
    setExporting(report.key);
    try {
      // These whitelisted methods don't exist on a stock Frappe Education/HRMS site —
      // implement one per report (e.g. returning a CSV/PDF file URL) and this button
      // will just work. Until then we surface exactly that instead of pretending it worked.
      await frappe.callMethod(report.method, {});
      toast.success(`${report.title} exported`);
    } catch (err) {
      toast.error(`${report.method} isn't implemented on this site yet — add a whitelisted method to enable this export.`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Operations" title="Reports" sub="Attendance, academic, fee and HR reporting across the school." />

      <div className="panel" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Info size={16} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 2 }} />
        <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
          Each card below calls a whitelisted Frappe method (see <code>method</code> in the card) to generate and
          return a report file. Implement the corresponding Python method on your site — each should return a
          file URL or streamed CSV/PDF — and the Export button will work as-is.
        </div>
      </div>

      <div className="grid-cards">
        {REPORT_CATALOG.map((r) => {
          const Ic = ICONS[r.category] || BarChart3;
          return (
            <div key={r.key} className="panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--brand-soft)', color: 'var(--brand)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Ic size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{r.title}</div>
                  <div className="muted" style={{ fontSize: 11.5 }}>{r.sub}</div>
                </div>
              </div>
              <div className="muted" style={{ fontSize: 11, fontFamily: 'var(--mono)' }}>{r.method}</div>
              <button className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => exportReport(r)} disabled={exporting === r.key}>
                <Download size={13} />{exporting === r.key ? 'Exporting…' : 'Export'}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
