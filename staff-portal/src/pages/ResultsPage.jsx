import { useState } from 'react';
import { Info } from 'lucide-react';
import { PageHeader, EmptyState } from '../components/ui/Primitives';
import Toolbar from '../components/shared/Toolbar';
import Pager from '../components/shared/Pager';
import { useDocList } from '../hooks/useDocList';
import { useDebounce, usePagination } from '../hooks.js';

export default function ResultsPage() {
  const { page, setPage, reset } = usePagination(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  const { rows, count, loading } = useDocList('assessmentResult', {
    search: debouncedSearch,
    searchFields: ['student_name'],
    orderBy: 'modified desc',
    page,
    pageSize: 12,
  });

  return (
    <>
      <PageHeader eyebrow="Academics" title="School Term Results" sub={loading ? 'Loading…' : `${count} assessment results on record`} />

      <div className="panel" style={{ padding: 16, marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Info size={16} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 2 }} />
        <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
          Core Frappe Education doesn't ship a single "term result" DocType — a term report card is normally
          built server-side from <code>Assessment Result</code> + <code>Program Enrollment</code>, then exposed as a
          whitelisted method (e.g. <code>education.education.api.get_report_card</code>). This page lists the
          underlying Assessment Results directly; once your site has a report-card method, swap this list for a
          <code> frappe.callMethod(...)</code> call and re-add Publish/Print actions against it.
        </div>
      </div>

      <Toolbar search={search} onSearch={(v) => { setSearch(v); reset(); }} />

      <div className="panel">
        <table className="tbl">
          <thead><tr><th>Student</th><th>Assessment Plan</th><th>Score</th><th>Grade</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="row">
                <td style={{ fontWeight: 550 }}>{r.student_name}</td>
                <td className="muted2" style={{ fontSize: 13 }}>{r.assessment_plan}</td>
                <td className="tnum">{r.total_score ?? '—'}</td>
                <td>{r.grade || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && <EmptyState title="No assessment results found" />}
        <Pager count={count} page={page} setPage={setPage} pageSize={12} />
      </div>
    </>
  );
}
