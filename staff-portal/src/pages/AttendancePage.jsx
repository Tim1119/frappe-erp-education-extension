import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarCheck, Save } from "lucide-react";
import { PageHeader, EmptyState } from "../components/ui/Primitives";
import { useDocList } from "../hooks/useDocList";
import { usePagination } from "../hooks.js";
import { getErrorMessage } from "../utils/errors";
import * as frappe from "../services/frappeClient";
import { DOCTYPES } from "../config/doctypes";
import { cx } from "../utils/format";

const STATUSES = ["Present", "Absent", "Late", "Excused"];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function BulkAttendanceTab() {
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState("");
  const [date, setDate] = useState(todayISO());
  const [roster, setRoster] = useState(null); // [{student, student_name, status}]
  const [saving, setSaving] = useState(false);

  // Load the group picklist once.
  useEffect(() => {
    frappe
      .getList("Student Group", {
        fields: ["name", "student_group_name"],
        limit_page_length: 100,
      })
      .then((rows) => {
        setGroups(rows);
        if (rows[0]) setGroup(rows[0].name);
      })
      .catch((err) => toast.error(getErrorMessage(err)));
  }, []);

  // Whenever group/date changes: fetch the group's student roster, then overlay
  // any Student Attendance already recorded for that date.
  useEffect(() => {
    if (!group) return;
    let alive = true;
    setRoster(null);
    Promise.all([
      frappe.getDoc("Student Group", group),
      frappe.getList("Student Attendance", {
        fields: DOCTYPES.studentAttendance.fields,
        filters: [
          ["student_group", "=", group],
          ["attendance_date", "=", date],
        ],
        limit_page_length: 200,
      }),
    ])
      .then(([groupDoc, existing]) => {
        if (!alive) return;
        const byStudent = Object.fromEntries(
          existing.map((r) => [r.student, r]),
        );
        setRoster(
          (groupDoc.students || []).map((s) => ({
            student: s.student,
            student_name: s.student_name,
            attendanceName: byStudent[s.student]?.name || null,
            status: byStudent[s.student]?.status || "Present",
          })),
        );
      })
      .catch((err) => toast.error(getErrorMessage(err)));
    return () => {
      alive = false;
    };
  }, [group, date]);

  const setStatus = (student, status) =>
    setRoster((rs) =>
      rs.map((r) => (r.student === student ? { ...r, status } : r)),
    );
  const markAll = (status) =>
    setRoster((rs) => rs.map((r) => ({ ...r, status })));

  const save = async () => {
    setSaving(true);
    try {
      await Promise.all(
        roster.map((r) =>
          r.attendanceName
            ? frappe.updateDoc("Student Attendance", r.attendanceName, {
                status: r.status,
              })
            : frappe.createDoc("Student Attendance", {
                student: r.student,
                student_group: group,
                attendance_date: date,
                status: r.status,
              }),
        ),
      );
      toast.success("Attendance saved");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-head" style={{ flexWrap: "wrap", gap: 12 }}>
        <div>
          <div
            className="panel-title"
            style={{ display: "flex", gap: 10, alignItems: "center" }}
          >
            <select
              className="select"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              {groups.map((g) => (
                <option key={g.name} value={g.name}>
                  {g.student_group_name}
                </option>
              ))}
            </select>
            <input
              className="input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ maxWidth: 160 }}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {STATUSES.map((s) => (
            <button
              key={s}
              className="btn btn-outline btn-sm"
              onClick={() => markAll(s)}
              disabled={!roster}
            >
              Mark all {s}
            </button>
          ))}
          <button
            className="btn btn-primary btn-sm"
            onClick={save}
            disabled={!roster || saving}
          >
            <Save size={14} />
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {roster == null ? (
        <div
          className="muted"
          style={{ padding: "30px 0", textAlign: "center" }}
        >
          Loading roster…
        </div>
      ) : roster.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No students in this group" />
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th>Student</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((r) => (
              <tr key={r.student} className="row">
                <td style={{ fontWeight: 550 }}>{r.student_name}</td>
                <td>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(r.student, s)}
                        className={cx(
                          "badge",
                          r.status === s ? "b-blue" : "b-gray",
                        )}
                        style={{ cursor: "pointer", border: "none" }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function HistoryTab() {
  const { page, setPage } = usePagination(1);
  const { rows, count, loading } = useDocList("studentAttendance", {
    orderBy: "attendance_date desc",
    page,
    pageSize: 15,
  });

  return (
    <div className="panel">
      <table className="tbl">
        <thead>
          <tr>
            <th>Date</th>
            <th>Student</th>
            <th>Group</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((h) => (
            <tr key={h.name} className="row">
              <td className="tnum">{h.attendance_date}</td>
              <td style={{ fontWeight: 550 }}>{h.student_name}</td>
              <td className="muted2" style={{ fontSize: 13 }}>
                {h.student_group}
              </td>
              <td className="muted2" style={{ fontSize: 13 }}>
                {h.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && rows.length === 0 && (
        <EmptyState title="No attendance history yet" />
      )}
    </div>
  );
}

export default function AttendancePage() {
  const [tab, setTab] = useState("today");
  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title="Attendance"
        sub="Mark daily attendance and review history by student group."
      />
      <div className="tab-bar" style={{ marginBottom: 18 }}>
        <div
          className={cx("tab", tab === "today" && "on")}
          onClick={() => setTab("today")}
          style={{ cursor: "pointer" }}
        >
          Bulk Attendance
        </div>
        <div
          className={cx("tab", tab === "history" && "on")}
          onClick={() => setTab("history")}
          style={{ cursor: "pointer" }}
        >
          Attendance History
        </div>
      </div>
      {tab === "today" ? <BulkAttendanceTab /> : <HistoryTab />}
    </>
  );
}
