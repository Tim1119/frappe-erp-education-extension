import { useMemo, useState } from 'react';
import { PageHeader, EmptyState } from '../components/ui/Primitives';
import Toolbar from '../components/shared/Toolbar';
import Pager from '../components/shared/Pager';
import { useDocList } from '../hooks/useDocList';
import { useDebounce, usePagination } from '../hooks.js';

export default function SchedulePage() {
  const { page, setPage, reset } = usePagination(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  const { rows, count, loading } = useDocList('courseSchedule', {
    search: debouncedSearch,
    searchFields: ['course'],
    orderBy: 'schedule_date asc',
    page,
    pageSize: 20,
  });

  const byDate = useMemo(() => {
    const groups = {};
    rows.forEach((r) => { (groups[r.schedule_date] ||= []).push(r); });
    return Object.entries(groups);
  }, [rows]);

  return (
    <>
      <PageHeader eyebrow="Academics" title="Course Schedule" sub={loading ? 'Loading…' : `${count} scheduled sessions`} />

      <Toolbar search={search} onSearch={(v) => { setSearch(v); reset(); }} onCreate={() => {}} createLabel="Add slot" />

      {!loading && rows.length === 0 ? (
        <div className="panel"><EmptyState title="No schedule entries found" /></div>
      ) : (
        byDate.map(([date, entries]) => (
          <div key={date} className="panel" style={{ marginBottom: 14 }}>
            <div className="panel-head"><div className="panel-title">{date}</div></div>
            <table className="tbl">
              <thead><tr><th>Time</th><th>Course</th><th>Group</th><th>Instructor</th><th>Room</th></tr></thead>
              <tbody>
                {entries.map((c) => (
                  <tr key={c.name} className="row">
                    <td className="tnum muted">{c.from_time} – {c.to_time}</td>
                    <td style={{ fontWeight: 550 }}>{c.course}</td>
                    <td className="muted2" style={{ fontSize: 13 }}>{c.student_group}</td>
                    <td className="muted2" style={{ fontSize: 13 }}>{c.instructor}</td>
                    <td className="muted2 hide-sm" style={{ fontSize: 13 }}>{c.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}

      <Pager count={count} page={page} setPage={setPage} pageSize={20} />
    </>
  );
}
