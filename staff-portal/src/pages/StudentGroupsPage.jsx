import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Users2 } from 'lucide-react';
import { PageHeader, EmptyState } from '../components/ui/Primitives';
import Modal from '../components/modals/Modal';
import Toolbar from '../components/shared/Toolbar';
import Pager from '../components/shared/Pager';
import { useDocList } from '../hooks/useDocList';
import { useDebounce, usePagination } from '../hooks.js';
import { getErrorMessage } from '../utils/errors';
import * as frappe from '../services/frappeClient';

function RosterModal({ group, onClose }) {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    frappe.getDoc('Student Group', group.name)
      .then(setDoc)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [group.name]);

  if (loading) return <div className="muted" style={{ padding: '30px 0', textAlign: 'center' }}>Loading roster…</div>;

  return (
    <div>
      <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 10 }}>Students ({doc?.students?.length || 0})</div>
      {(doc?.students || []).length === 0 ? (
        <EmptyState title="No students enrolled yet" />
      ) : (
        <table className="tbl" style={{ marginBottom: 18 }}>
          <thead><tr><th>Student</th><th>Roll No.</th></tr></thead>
          <tbody>
            {doc.students.map((s, i) => (
              <tr key={i} className="row"><td style={{ fontWeight: 550 }}>{s.student_name}</td><td className="tnum muted">{s.group_roll_number || '—'}</td></tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 10 }}>Courses</div>
      <div className="chip-row">
        {(doc?.courses || []).length === 0
          ? <span className="muted" style={{ fontSize: 12.5 }}>No courses linked</span>
          : doc.courses.map((c, i) => <span key={i} className="chip">{c.course}</span>)}
      </div>
    </div>
  );
}

export default function StudentGroupsPage() {
  const { page, setPage, reset } = usePagination(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [rosterGroup, setRosterGroup] = useState(null);

  const { rows, count, loading, reload } = useDocList('studentGroup', {
    search: debouncedSearch,
    searchFields: ['student_group_name'],
    orderBy: 'modified desc',
    page,
    pageSize: 9,
  });

  return (
    <>
      <PageHeader eyebrow="Academics" title="Student Groups" sub={loading ? 'Loading…' : `${count} student groups`} />

      <Toolbar search={search} onSearch={(v) => { setSearch(v); reset(); }} onCreate={() => toast('Create groups from Frappe Desk for now, or wire the create form up next.')} createLabel="Add group" />

      {!loading && rows.length === 0 ? (
        <div className="panel"><EmptyState title="No student groups found" sub="Try a different search." /></div>
      ) : (
        <div className="grid-cards" style={{ marginBottom: 16 }}>
          {rows.map((g) => (
            <div key={g.name} className="panel" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--brand-soft)', color: 'var(--brand)', display: 'grid', placeItems: 'center' }}>
                  <Users2 size={17} />
                </div>
                <div>
                  <div style={{ fontWeight: 650, fontSize: 14.5 }}>{g.student_group_name}</div>
                  <div className="muted" style={{ fontSize: 11.5 }}>{g.program} · {g.batch}</div>
                </div>
              </div>
              <div className="grid-2" style={{ gap: 10, marginBottom: 14 }}>
                <div>
                  <div className="muted" style={{ fontSize: 11 }}>Academic Year</div>
                  <div style={{ fontSize: 13, fontWeight: 550 }}>{g.academic_year || '—'}</div>
                </div>
                <div>
                  <div className="muted" style={{ fontSize: 11 }}>Academic Term</div>
                  <div style={{ fontSize: 13, fontWeight: 550 }}>{g.academic_term || '—'}</div>
                </div>
                <div>
                  <div className="muted" style={{ fontSize: 11 }}>Max strength</div>
                  <div style={{ fontSize: 13, fontWeight: 550 }}>{g.max_strength || '—'}</div>
                </div>
                <div>
                  <div className="muted" style={{ fontSize: 11 }}>Instructor</div>
                  <div style={{ fontSize: 13, fontWeight: 550 }}>{g.instructor || '—'}</div>
                </div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setRosterGroup(g)}>View roster & courses</button>
            </div>
          ))}
        </div>
      )}

      <Pager count={count} page={page} setPage={setPage} pageSize={9} />

      <Modal open={Boolean(rosterGroup)} onClose={() => setRosterGroup(null)} title={rosterGroup?.student_group_name} size="lg">
        {rosterGroup && <RosterModal group={rosterGroup} onClose={() => setRosterGroup(null)} />}
      </Modal>
    </>
  );
}
