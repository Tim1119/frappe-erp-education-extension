import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Wallet, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PageHeader, StatCard, StatusBadge, EmptyState } from '../components/ui/Primitives';
import Toolbar from '../components/shared/Toolbar';
import Pager from '../components/shared/Pager';
import { useDocList } from '../hooks/useDocList';
import { useDebounce, usePagination } from '../hooks.js';
import { getErrorMessage } from '../utils/errors';
import * as frappe from '../services/frappeClient';
import { DOCTYPES } from '../config/doctypes';
import { cx } from '../utils/format';

const n = (v) => Number(v || 0).toLocaleString();
const STATUS_MAP = { Paid: 'ACTIVE', Partly: 'SUSPENDED', 'Partly Paid': 'SUSPENDED', Unpaid: 'REJECTED', Overdue: 'REJECTED', Submitted: 'GENERATED' };

function FeesDashboard() {
  const [totals, setTotals] = useState(null);

  useEffect(() => {
    frappe.getList('Fees', { fields: DOCTYPES.fees.fields, limit_page_length: 500 })
      .then((rows) => {
        const billed = rows.reduce((s, f) => s + Number(f.grand_total || 0), 0);
        const collected = rows.reduce((s, f) => s + Number(f.paid_amount || 0), 0);
        const outstanding = rows.reduce((s, f) => s + Number(f.outstanding_amount || 0), 0);
        setTotals({ billed, collected, outstanding });
      })
      .catch((err) => toast.error(getErrorMessage(err)));
  }, []);

  if (!totals) return <div className="muted" style={{ padding: '30px 0', textAlign: 'center' }}>Loading fee summary…</div>;
  const rate = totals.billed ? ((totals.collected / totals.billed) * 100).toFixed(0) : 0;

  return (
    <div className="grid-stat" style={{ marginBottom: 20 }}>
      <StatCard ico={Wallet} tone="brand" value={`₦${n(totals.billed)}`} label="Total Billed" />
      <StatCard ico={CheckCircle2} tone="green" value={`₦${n(totals.collected)}`} label="Total Collected" />
      <StatCard ico={AlertCircle} tone="red" value={`₦${n(totals.outstanding)}`} label="Outstanding" />
      <StatCard ico={TrendingUp} tone="cyan" value={`${rate}%`} label="Collection Rate" />
    </div>
  );
}

function StructureTab() {
  const { rows, count, loading } = useDocList('feeStructure', { orderBy: 'modified desc', page: 1, pageSize: 50 });
  return (
    <div className="panel">
      <table className="tbl">
        <thead><tr><th>Program</th><th>Academic Year</th><th>Total Amount</th></tr></thead>
        <tbody>
          {rows.map((f) => (
            <tr key={f.name} className="row">
              <td style={{ fontWeight: 550 }}>{f.program}</td>
              <td className="muted2" style={{ fontSize: 13 }}>{f.academic_year}</td>
              <td className="tnum">₦{n(f.total_amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && rows.length === 0 && <EmptyState title="No fee structures found" />}
    </div>
  );
}

function StudentFeesTab({ outstandingOnly }) {
  const { page, setPage, reset } = usePagination(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  const filters = outstandingOnly ? [['outstanding_amount', '>', 0]] : [];
  const { rows, count, loading } = useDocList('fees', {
    search: debouncedSearch,
    searchFields: ['student_name'],
    filters,
    orderBy: 'due_date desc',
    page,
    pageSize: 10,
  });

  return (
    <>
      <Toolbar search={search} onSearch={(v) => { setSearch(v); reset(); }} />
      <div className="panel">
        <table className="tbl">
          <thead><tr><th>Student</th><th>Program</th><th>Total</th><th>Paid</th><th>Outstanding</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((f) => (
              <tr key={f.name} className="row">
                <td style={{ fontWeight: 550 }}>{f.student_name}</td>
                <td className="muted2" style={{ fontSize: 13 }}>{f.program}</td>
                <td className="tnum">₦{n(f.grand_total)}</td>
                <td className="tnum" style={{ color: 'var(--success-ink)' }}>₦{n(f.paid_amount)}</td>
                <td className="tnum" style={{ color: Number(f.outstanding_amount) ? 'var(--danger-ink)' : 'var(--ink-4)' }}>₦{n(f.outstanding_amount)}</td>
                <td><StatusBadge s={STATUS_MAP[f.status] || 'GENERATED'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && <EmptyState title="No records found" />}
        <Pager count={count} page={page} setPage={setPage} pageSize={10} />
      </div>
    </>
  );
}

function PaymentsTab() {
  const { rows, loading } = useDocList('paymentEntry', { filters: [['party_type', '=', 'Student']], orderBy: 'posting_date desc', page: 1, pageSize: 30 });
  return (
    <div className="panel">
      <table className="tbl">
        <thead><tr><th>Reference</th><th>Student</th><th>Amount</th><th>Method</th><th>Date</th></tr></thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.name} className="row">
              <td className="tnum muted" style={{ fontFamily: 'var(--mono)', fontSize: 12.5 }}>{p.reference_no || p.name}</td>
              <td style={{ fontWeight: 550 }}>{p.party}</td>
              <td className="tnum">₦{n(p.paid_amount)}</td>
              <td className="muted2" style={{ fontSize: 13 }}>{p.mode_of_payment}</td>
              <td className="tnum muted">{p.posting_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && rows.length === 0 && <EmptyState title="No payments found" sub="Payments are recorded in Frappe as Payment Entry documents against Student parties." />}
    </div>
  );
}

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'structure', label: 'Fee Structure' },
  { key: 'student', label: 'Student Fees' },
  { key: 'outstanding', label: 'Outstanding Fees' },
  { key: 'payments', label: 'Payments' },
];

export default function FeesPage() {
  const [tab, setTab] = useState('dashboard');
  return (
    <>
      <PageHeader eyebrow="Operations" title="Fees" sub="Frappe Education Fee module" />
      <div className="tab-bar" style={{ marginBottom: 18 }}>
        {TABS.map((t) => (
          <div key={t.key} className={cx('tab', tab === t.key && 'on')} onClick={() => setTab(t.key)} style={{ cursor: 'pointer' }}>{t.label}</div>
        ))}
      </div>
      {tab === 'dashboard' && <FeesDashboard />}
      {tab === 'structure' && <StructureTab />}
      {tab === 'student' && <StudentFeesTab />}
      {tab === 'outstanding' && <StudentFeesTab outstandingOnly />}
      {tab === 'payments' && <PaymentsTab />}
    </>
  );
}
