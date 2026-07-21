import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader, Avatar, StatusBadge, EmptyState } from '../components/ui/Primitives';
import Modal from '../components/modals/Modal';
import Toolbar from '../components/shared/Toolbar';
import Pager from '../components/shared/Pager';
import { useDocList } from '../hooks/useDocList';
import { useDebounce, usePagination } from '../hooks.js';
import { getErrorMessage } from '../utils/errors';
import * as frappe from '../services/frappeClient';
import { DOCTYPES } from '../config/doctypes';

function TeacherDetail({ instructor }) {
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    frappe.getList('Course Schedule', {
      fields: DOCTYPES.courseSchedule.fields,
      filters: [['instructor', '=', instructor.name]],
      order_by: 'schedule_date asc',
      limit_page_length: 20,
    }).then(setSchedule).catch((err) => toast.error(getErrorMessage(err)));
  }, [instructor.name]);

  return (
    <div>
      <div className="grid-2" style={{ gap: 14, marginBottom: 20 }}>
        {[
          ['Employee', instructor.employee],
          ['Department', instructor.department],
          ['Status', instructor.status],
        ].map(([label, val]) => (
          <div key={label}>
            <div className="muted" style={{ fontSize: 11.5, marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 13.5, fontWeight: 550 }}>{val || '—'}</div>
          </div>
        ))}
      </div>
      <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 10 }}>Course schedule</div>
      {schedule == null ? (
        <div className="muted" style={{ fontSize: 13 }}>Loading…</div>
      ) : schedule.length === 0 ? (
        <EmptyState title="No scheduled courses" />
      ) : (
        <table className="tbl">
          <thead><tr><th>Date</th><th>Course</th><th>Group</th><th>Room</th></tr></thead>
          <tbody>
            {schedule.map((s) => (
              <tr key={s.name} className="row">
                <td className="tnum muted">{s.schedule_date}</td>
                <td style={{ fontWeight: 550 }}>{s.course}</td>
                <td className="muted2" style={{ fontSize: 13 }}>{s.student_group}</td>
                <td className="muted2" style={{ fontSize: 13 }}>{s.room}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function TeachersPage() {
  const { page, setPage, reset } = usePagination(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [detail, setDetail] = useState(null);

  const { rows, count, loading } = useDocList('instructor', {
    search: debouncedSearch,
    searchFields: ['instructor_name'],
    orderBy: 'modified desc',
    page,
    pageSize: 8,
  });

  return (
    <>
      <PageHeader eyebrow="People" title="Teachers" sub={loading ? 'Loading…' : `${count} instructors`} />

      <Toolbar search={search} onSearch={(v) => { setSearch(v); reset(); }} onCreate={() => toast('Create instructors from Frappe Desk, or wire the create form up next.')} createLabel="Add teacher" />

      <div className="panel">
        <table className="tbl">
          <thead><tr><th>Name</th><th>Instructor ID</th><th>Department</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.name} className="row" style={{ cursor: 'pointer' }} onClick={() => setDetail(t)}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <Avatar name={t.instructor_name} size={34} />
                    <div style={{ fontWeight: 550 }}>{t.instructor_name}</div>
                  </div>
                </td>
                <td className="muted tnum hide-sm" style={{ fontFamily: 'var(--mono)', fontSize: 12.5 }}>{t.name}</td>
                <td className="muted2" style={{ fontSize: 13 }}>{t.department || '—'}</td>
                <td><StatusBadge s={t.status === 'Active' ? 'ACTIVE' : 'SUSPENDED'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && <EmptyState title="No teachers found" />}
        <Pager count={count} page={page} setPage={setPage} pageSize={8} />
      </div>

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title={detail?.instructor_name} size="lg">
        {detail && <TeacherDetail instructor={detail} />}
      </Modal>
    </>
  );
}
