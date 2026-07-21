import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, Contact, Users2, CalendarCheck, ClipboardList, Award,
  CalendarClock, Wallet, ArrowRight, CheckSquare, PencilLine, Eye, UserCog, UserPlus,
} from 'lucide-react';
import { useUI } from '../context/UIContext';
import { PageHeader, StatCard, StatusBadge, EmptyState } from '../components/ui/Primitives';
import { AreaCard } from '../components/charts/Charts';
import * as frappe from '../services/frappeClient';

const n = (v) => Number(v || 0).toLocaleString();
const todayISO = () => new Date().toISOString().slice(0, 10);
const monthLabel = (iso) => new Date(iso).toLocaleString('en', { month: 'short' });

export default function Dashboard() {
  const { tk } = useUI();
  const navigate = useNavigate();
  const [kpis, setKpis] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [recentStudents, setRecentStudents] = useState(null);
  const [pendingLeave, setPendingLeave] = useState(null);
  const [outstandingFees, setOutstandingFees] = useState(null);
  const [attendanceTrend, setAttendanceTrend] = useState(null);

  useEffect(() => {
    const today = todayISO();

    Promise.all([
      frappe.getCount('Student'),
      frappe.getCount('Instructor'),
      frappe.getCount('Student Group'),
      frappe.getCount('Student Attendance', [['attendance_date', '=', today]]),
      frappe.getCount('Student Attendance', [['attendance_date', '=', today], ['status', '=', 'Present']]),
      frappe.getCount('Assessment Plan'),
      frappe.getCount('Assessment Result'),
    ]).then(([students, teachers, groups, attToday, presentToday, assessments, results]) => {
      setKpis({
        students, teachers, groups,
        attendanceRate: attToday ? ((presentToday / attToday) * 100).toFixed(1) : '—',
        assessments, results,
      });
    }).catch(() => setKpis({ students: 0, teachers: 0, groups: 0, attendanceRate: '—', assessments: 0, results: 0 }));

    frappe.getList('Course Schedule', {
      fields: ['name', 'course', 'student_group', 'instructor', 'room', 'from_time', 'to_time'],
      filters: [['schedule_date', '=', today]],
      order_by: 'from_time asc',
      limit_page_length: 6,
    }).then(setTimetable).catch(() => setTimetable([]));

    frappe.getList('Student', {
      fields: ['name', 'student_name', 'image'],
      order_by: 'creation desc',
      limit_page_length: 5,
    }).then(setRecentStudents).catch(() => setRecentStudents([]));

    frappe.getList('Leave Application', {
      fields: ['name', 'employee_name', 'leave_type', 'total_leave_days'],
      filters: [['status', '=', 'Open']],
      limit_page_length: 5,
    }).then(setPendingLeave).catch(() => setPendingLeave([]));

    frappe.getList('Fees', {
      fields: ['name', 'student_name', 'outstanding_amount'],
      filters: [['outstanding_amount', '>', 0]],
      order_by: 'outstanding_amount desc',
      limit_page_length: 4,
    }).then(setOutstandingFees).catch(() => setOutstandingFees([]));

    // Bucket the last ~500 attendance records into a monthly present/absent/late trend, client-side —
    // avoids needing a custom reporting endpoint just for this chart.
    frappe.getList('Student Attendance', {
      fields: ['attendance_date', 'status'],
      order_by: 'attendance_date desc',
      limit_page_length: 500,
    }).then((rows) => {
      const buckets = {};
      rows.forEach((r) => {
        const key = monthLabel(r.attendance_date);
        buckets[key] ||= { m: key, present: 0, absent: 0, late: 0 };
        if (r.status === 'Present') buckets[key].present += 1;
        else if (r.status === 'Absent') buckets[key].absent += 1;
        else if (r.status === 'Late') buckets[key].late += 1;
      });
      setAttendanceTrend(Object.values(buckets).reverse());
    }).catch(() => setAttendanceTrend([]));
  }, []);

  const kpiCards = useMemo(() => ([
    { ico: GraduationCap, tone: 'brand', value: kpis ? n(kpis.students) : '—', label: 'Total Students' },
    { ico: Contact, tone: 'cyan', value: kpis ? n(kpis.teachers) : '—', label: 'Teachers' },
    { ico: Users2, tone: 'purple', value: kpis ? n(kpis.groups) : '—', label: 'Student Groups' },
    { ico: CalendarCheck, tone: 'green', value: kpis ? `${kpis.attendanceRate}%` : '—', label: 'Attendance Today' },
    { ico: ClipboardList, tone: 'amber', value: kpis ? n(kpis.assessments) : '—', label: 'Assessment Plans' },
    { ico: Award, tone: 'brand', value: kpis ? n(kpis.results) : '—', label: 'Assessment Results' },
  ]), [kpis]);

  const quickActions = [
    { label: 'Take Attendance', icon: CheckSquare, to: '/dashboard/attendance' },
    { label: 'Enter Scores', icon: PencilLine, to: '/dashboard/assessments' },
    { label: 'View Results', icon: Eye, to: '/dashboard/results' },
    { label: 'Manage Students', icon: UserCog, to: '/dashboard/students' },
  ];

  return (
    <>
      <PageHeader eyebrow="Live from Frappe" title="Dashboard" sub="A snapshot of today across your school." />

      <div className="grid-stat" style={{ marginBottom: 20 }}>
        {kpiCards.map((k, i) => <StatCard key={i} {...k} />)}
      </div>

      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head">
          <div>
            <div className="panel-title">Quick actions</div>
            <div className="panel-sub">Jump straight into your most common tasks</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, padding: '4px 18px 20px' }}>
          {quickActions.map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.to)}
              className="card"
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface-2)', textAlign: 'left' }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--brand-soft)', color: 'var(--brand)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <a.icon size={16} />
              </div>
              <span style={{ fontWeight: 600, fontSize: 13.5 }}>{a.label}</span>
              <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--ink-4)' }} />
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        {attendanceTrend == null ? (
          <div className="panel muted" style={{ padding: 24, textAlign: 'center' }}>Loading attendance trend…</div>
        ) : attendanceTrend.length === 0 ? (
          <div className="panel"><EmptyState title="No attendance history yet" /></div>
        ) : (
          <AreaCard
            tk={tk}
            title="Attendance trend"
            sub="Present / absent / late, bucketed from the last 500 Student Attendance records"
            data={attendanceTrend}
            keys={[{ dk: 'present', color: tk.green }, { dk: 'absent', color: tk.red }, { dk: 'late', color: tk.amber }]}
          />
        )}
      </div>

      <div className="grid-2" style={{ marginBottom: 18 }}>
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Today's timetable</div>
              <div className="panel-sub">{todayISO()}</div>
            </div>
            <CalendarClock size={16} style={{ color: 'var(--ink-4)' }} />
          </div>
          {timetable == null ? (
            <div className="muted" style={{ padding: '20px 18px' }}>Loading…</div>
          ) : timetable.length === 0 ? (
            <EmptyState title="No sessions scheduled for today" />
          ) : (
            <table className="tbl">
              <thead><tr><th>Time</th><th>Course</th><th>Group</th><th>Room</th></tr></thead>
              <tbody>
                {timetable.map((t) => (
                  <tr key={t.name} className="row">
                    <td className="tnum muted" style={{ fontSize: 12.5 }}>{t.from_time} – {t.to_time}</td>
                    <td style={{ fontWeight: 550 }}>{t.course}</td>
                    <td className="muted2" style={{ fontSize: 13 }}>{t.student_group}</td>
                    <td className="muted2 hide-sm" style={{ fontSize: 13 }}>{t.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Recently added students</div>
              <div className="panel-sub">Newest Student records</div>
            </div>
            <UserPlus size={16} style={{ color: 'var(--ink-4)' }} />
          </div>
          {recentStudents == null ? (
            <div className="muted" style={{ padding: '20px 18px' }}>Loading…</div>
          ) : recentStudents.length === 0 ? (
            <EmptyState title="No students yet" />
          ) : (
            <div style={{ padding: '4px 18px 18px' }}>
              {recentStudents.map((s, i) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < recentStudents.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ fontSize: 13, fontWeight: 550 }}>{s.student_name}</div>
                  <div className="muted tnum" style={{ fontSize: 11.5, marginLeft: 'auto' }}>{s.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head"><div className="panel-title">Pending leave requests</div></div>
          {pendingLeave == null ? (
            <div className="muted" style={{ padding: '20px 18px' }}>Loading…</div>
          ) : pendingLeave.length === 0 ? (
            <EmptyState title="All caught up" sub="No pending leave requests." />
          ) : (
            <div style={{ padding: '4px 18px 18px' }}>
              {pendingLeave.map((l) => (
                <div key={l.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', fontSize: 13 }}>
                  <div>
                    <div style={{ fontWeight: 550 }}>{l.employee_name}</div>
                    <div className="muted" style={{ fontSize: 11.5 }}>{l.leave_type} · {l.total_leave_days} day(s)</div>
                  </div>
                  <StatusBadge s="PENDING" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <div><div className="panel-title">Outstanding fees</div></div>
            <Wallet size={16} style={{ color: 'var(--ink-4)' }} />
          </div>
          {outstandingFees == null ? (
            <div className="muted" style={{ padding: '20px 18px' }}>Loading…</div>
          ) : outstandingFees.length === 0 ? (
            <EmptyState title="No outstanding balances" />
          ) : (
            <div style={{ padding: '4px 18px 18px' }}>
              {outstandingFees.map((f) => (
                <div key={f.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13 }}>
                  <span>{f.student_name}</span>
                  <span className="tnum muted">₦{n(f.outstanding_amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
