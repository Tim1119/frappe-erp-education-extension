import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Briefcase, UserCheck, CalendarClock, TreePalm } from "lucide-react";
import {
  PageHeader,
  Avatar,
  StatCard,
  StatusBadge,
  EmptyState,
} from "../components/ui/Primitives";
import Toolbar from "../components/shared/Toolbar";
import Pager from "../components/shared/Pager";
import { useDocList } from "../hooks/useDocList";
import { useDebounce, usePagination } from "../hooks.js";
import { getErrorMessage } from "../utils/errors";
import * as frappe from "../services/frappeClient";
import { cx } from "../utils/format";

const STATUS_MAP = {
  Approved: "ACTIVE",
  Open: "PENDING",
  Rejected: "REJECTED",
  Active: "ACTIVE",
  Left: "SUSPENDED",
};

function HrDashboard() {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    Promise.all([
      frappe.getCount("Employee", [["status", "=", "Active"]]),
      frappe.getCount("Employee", [["status", "=", "Left"]]),
      frappe.getCount("Leave Application", [["status", "=", "Open"]]),
      frappe.getCount("Employee"),
    ])
      .then(([active, onLeave, pending, total]) =>
        setCounts({ active, onLeave, pending, total }),
      )
      .catch((err) => toast.error(getErrorMessage(err)));
  }, []);

  if (!counts)
    return (
      <div className="muted" style={{ padding: "30px 0", textAlign: "center" }}>
        Loading HR summary…
      </div>
    );

  return (
    <div className="grid-stat" style={{ marginBottom: 20 }}>
      <StatCard
        ico={Briefcase}
        tone="brand"
        value={counts.total}
        label="Total Staff"
      />
      <StatCard
        ico={UserCheck}
        tone="green"
        value={counts.active}
        label="Active"
      />
      <StatCard
        ico={TreePalm}
        tone="amber"
        value={counts.onLeave}
        label="Left / On Leave"
      />
      <StatCard
        ico={CalendarClock}
        tone="purple"
        value={counts.pending}
        label="Pending Leave Requests"
      />
    </div>
  );
}

function EmployeesTab() {
  const { page, setPage, reset } = usePagination(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const { rows, count, loading } = useDocList("employee", {
    search: debouncedSearch,
    searchFields: ["employee_name"],
    orderBy: "modified desc",
    page,
    pageSize: 10,
  });

  return (
    <>
      <Toolbar
        search={search}
        onSearch={(v) => {
          setSearch(v);
          reset();
        }}
        onCreate={() => toast("Create employees from Frappe Desk for now.")}
        createLabel="Add employee"
      />
      <div className="panel">
        <table className="tbl">
          <thead>
            <tr>
              <th>Name</th>
              <th>Employee ID</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.name} className="row">
                <td>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 11 }}
                  >
                    <Avatar name={e.employee_name} size={32} src={e.image} />
                    <div>
                      <div style={{ fontWeight: 550 }}>{e.employee_name}</div>
                      <div className="muted" style={{ fontSize: 11.5 }}>
                        {e.company_email}
                      </div>
                    </div>
                  </div>
                </td>
                <td
                  className="muted tnum hide-sm"
                  style={{ fontFamily: "var(--mono)", fontSize: 12.5 }}
                >
                  {e.name}
                </td>
                <td className="muted2" style={{ fontSize: 13 }}>
                  {e.department || "—"}
                </td>
                <td className="muted2 hide-sm" style={{ fontSize: 13 }}>
                  {e.designation || "—"}
                </td>
                <td>
                  <StatusBadge s={STATUS_MAP[e.status] || "ACTIVE"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && (
          <EmptyState title="No employees found" />
        )}
        <Pager count={count} page={page} setPage={setPage} pageSize={10} />
      </div>
    </>
  );
}

function DepartmentsTab() {
  const { rows, loading } = useDocList("department", {
    orderBy: "name asc",
    page: 1,
    pageSize: 50,
  });
  return (
    <div className="grid-cards">
      {rows.map((d) => (
        <div key={d.name} className="panel" style={{ padding: 16 }}>
          <div style={{ fontWeight: 650, fontSize: 14.5 }}>
            {d.department_name}
          </div>
        </div>
      ))}
      {!loading && rows.length === 0 && (
        <EmptyState title="No departments found" />
      )}
    </div>
  );
}

function LeaveTab() {
  const {
    rows: applications,
    loading: loadingApps,
    reload,
  } = useDocList("leaveApplication", {
    orderBy: "from_date desc",
    page: 1,
    pageSize: 20,
  });
  const { rows: allocations, loading: loadingAlloc } = useDocList(
    "leaveAllocation",
    { orderBy: "modified desc", page: 1, pageSize: 20 },
  );

  const decide = async (name, status) => {
    try {
      await frappe.updateDoc("Leave Application", name, { status });
      toast.success(`Leave request ${status.toLowerCase()}`);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-head">
          <div className="panel-title">Leave applications</div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Days</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {applications.map((l) => (
              <tr key={l.name} className="row">
                <td style={{ fontWeight: 550 }}>{l.employee_name}</td>
                <td className="muted2" style={{ fontSize: 13 }}>
                  {l.leave_type}
                </td>
                <td className="tnum muted">{l.from_date}</td>
                <td className="tnum muted">{l.to_date}</td>
                <td className="tnum">{l.total_leave_days}</td>
                <td>
                  <StatusBadge s={STATUS_MAP[l.status] || "PENDING"} />
                </td>
                <td>
                  {l.status === "Open" && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => decide(l.name, "Approved")}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => decide(l.name, "Rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loadingApps && applications.length === 0 && (
          <EmptyState title="No leave applications found" />
        )}
      </div>
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Leave allocation</div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Type</th>
              <th>Allocated</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((a) => (
              <tr key={a.name} className="row">
                <td style={{ fontWeight: 550 }}>{a.employee_name}</td>
                <td className="muted2" style={{ fontSize: 13 }}>
                  {a.leave_type}
                </td>
                <td className="tnum">
                  {a.total_leaves_allocated ?? a.new_leaves_allocated}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loadingAlloc && allocations.length === 0 && (
          <EmptyState title="No leave allocations found" />
        )}
      </div>
    </>
  );
}

const TABS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "employees", label: "Employees" },
  { key: "departments", label: "Departments" },
  { key: "leave", label: "Leave" },
];

export default function HrPage() {
  const [tab, setTab] = useState("dashboard");
  return (
    <>
      <PageHeader eyebrow="Operations" title="HR" sub="Frappe HRMS" />
      <div className="tab-bar" style={{ marginBottom: 18 }}>
        {TABS.map((t) => (
          <div
            key={t.key}
            className={cx("tab", tab === t.key && "on")}
            onClick={() => setTab(t.key)}
            style={{ cursor: "pointer" }}
          >
            {t.label}
          </div>
        ))}
      </div>
      {tab === "dashboard" && <HrDashboard />}
      {tab === "employees" && <EmployeesTab />}
      {tab === "departments" && <DepartmentsTab />}
      {tab === "leave" && <LeaveTab />}
    </>
  );
}
