import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Info, Moon, Sun } from "lucide-react";
import { useUI } from "../context/UIContext";
import {
  PageHeader,
  Avatar,
  StatusBadge,
  EmptyState,
} from "../components/ui/Primitives";
import { cx } from "../utils/format";
import * as frappe from "../services/frappeClient";
import { getErrorMessage } from "../utils/errors";

function Toggle({ on, onChange }) {
  return (
    <div
      className={cx("toggle", on && "on")}
      onClick={() => onChange(!on)}
      style={{ cursor: "pointer" }}
    >
      <div className="knob" />
    </div>
  );
}

function Row({ t, d, children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 0",
        borderBottom: "1px solid var(--border)",
        gap: 20,
        flexWrap: "wrap",
      }}
    >
      <div>
        <div style={{ fontWeight: 550, fontSize: 13.5 }}>{t}</div>
        {d && (
          <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
            {d}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function SchoolInfoTab() {
  return (
    <div
      className="panel"
      style={{
        padding: 16,
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <Info
        size={16}
        style={{ color: "var(--brand)", flexShrink: 0, marginTop: 2 }}
      />
      <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
        Frappe Education doesn't ship a single "school profile" DocType — school
        name, address and contact details usually live on a custom Single
        DocType (or reuse Frappe's own Website/Company settings). Create one
        (e.g. <code>School Settings</code>) and wire this tab to it with
        <code> frappe.getDoc('School Settings', 'School Settings')</code> /{" "}
        <code>updateDoc(...)</code>.
      </div>
    </div>
  );
}

function AcademicTab() {
  const [years, setYears] = useState(null);
  const [terms, setTerms] = useState(null);

  useEffect(() => {
    frappe
      .getList("Academic Year", {
        fields: ["name", "academic_year_name"],
        limit_page_length: 20,
      })
      .then(setYears)
      .catch((err) => {
        toast.error(getErrorMessage(err));
        setYears([]);
      });
    frappe
      .getList("Academic Term", {
        fields: ["name", "term_name", "academic_year"],
        limit_page_length: 50,
      })
      .then(setTerms)
      .catch((err) => {
        toast.error(getErrorMessage(err));
        setTerms([]);
      });
  }, []);

  return (
    <>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-head">
          <div className="panel-title">Academic years</div>
        </div>
        {years == null ? (
          <div className="muted" style={{ padding: 18 }}>
            Loading…
          </div>
        ) : years.length === 0 ? (
          <EmptyState title="No academic years found" />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Academic Year</th>
              </tr>
            </thead>
            <tbody>
              {years.map((y) => (
                <tr key={y.name} className="row">
                  <td style={{ fontWeight: 550 }}>
                    {y.academic_year_name || y.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Academic terms</div>
        </div>
        {terms == null ? (
          <div className="muted" style={{ padding: 18 }}>
            Loading…
          </div>
        ) : terms.length === 0 ? (
          <EmptyState title="No academic terms found" />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Term</th>
                <th>Academic Year</th>
              </tr>
            </thead>
            <tbody>
              {terms.map((t) => (
                <tr key={t.name} className="row">
                  <td style={{ fontWeight: 550 }}>{t.term_name || t.name}</td>
                  <td className="muted2">{t.academic_year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function GradingTab() {
  const [scale, setScale] = useState(null);

  useEffect(() => {
    frappe
      .getList("Grading Scale", { fields: ["name"], limit_page_length: 1 })
      .then((rows) =>
        rows[0] ? frappe.getDoc("Grading Scale", rows[0].name) : null,
      )
      .then(setScale)
      .catch((err) => {
        toast.error(getErrorMessage(err));
        setScale(false);
      });
  }, []);

  if (scale == null)
    return (
      <div className="panel">
        <div className="muted" style={{ padding: 18 }}>
          Loading…
        </div>
      </div>
    );
  if (scale === false || !scale?.intervals?.length)
    return (
      <div className="panel">
        <EmptyState
          title="No grading scale configured"
          sub="Set one up under Education > Grading Scale in Frappe Desk."
        />
      </div>
    );

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title">{scale.name}</div>
      </div>
      <table className="tbl">
        <thead>
          <tr>
            <th>Grade Code</th>
            <th>Threshold (%)</th>
          </tr>
        </thead>
        <tbody>
          {scale.intervals.map((g, i) => (
            <tr key={i} className="row">
              <td style={{ fontWeight: 650 }}>{g.grade_code}</td>
              <td className="tnum">{g.threshold}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState(null);

  useEffect(() => {
    frappe
      .getList("User", {
        fields: ["name", "full_name", "user_image", "enabled"],
        filters: [["user_type", "=", "System User"]],
        limit_page_length: 30,
      })
      .then(setUsers)
      .catch((err) => {
        toast.error(getErrorMessage(err));
        setUsers([]);
      });
  }, []);

  return (
    <div className="panel">
      {users == null ? (
        <div className="muted" style={{ padding: 18 }}>
          Loading…
        </div>
      ) : users.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.name} className="row">
                <td>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <Avatar name={u.full_name} size={30} src={u.user_image} />
                    <span style={{ fontWeight: 550 }}>{u.full_name}</span>
                  </div>
                </td>
                <td className="muted2" style={{ fontSize: 13 }}>
                  {u.name}
                </td>
                <td>
                  <StatusBadge s={u.enabled ? "ACTIVE" : "INACTIVE"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function RolesTab() {
  const [roles, setRoles] = useState(null);

  useEffect(() => {
    frappe
      .getList("Role", {
        fields: ["name", "disabled"],
        filters: [["disabled", "=", 0]],
        limit_page_length: 50,
      })
      .then(setRoles)
      .catch((err) => {
        toast.error(getErrorMessage(err));
        setRoles([]);
      });
  }, []);

  return (
    <div className="panel">
      {roles == null ? (
        <div className="muted" style={{ padding: 18 }}>
          Loading…
        </div>
      ) : (
        <div
          style={{
            padding: "4px 18px 18px",
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {roles.map((r) => (
            <span key={r.name} className="chip">
              {r.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function BrandingTab() {
  const { theme, setTheme } = useUI();
  return (
    <div className="panel" style={{ padding: "4px 18px" }}>
      <Row
        t="Appearance"
        d="Choose how the School Staff Portal looks on your device"
      >
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className={cx(
              "btn",
              theme === "light" ? "btn-primary" : "btn-outline",
              "btn-sm",
            )}
            onClick={() => setTheme("light")}
          >
            <Sun size={13} />
            Light
          </button>
          <button
            className={cx(
              "btn",
              theme === "dark" ? "btn-primary" : "btn-outline",
              "btn-sm",
            )}
            onClick={() => setTheme("dark")}
          >
            <Moon size={13} />
            Dark
          </button>
        </div>
      </Row>
      <Row
        t="Email notifications"
        d="Attendance and results alerts sent to your inbox"
      >
        <Toggle
          on={true}
          onChange={() =>
            toast(
              "Wire this up to a User Setting / Notification Settings doc on your site.",
            )
          }
        />
      </Row>
    </div>
  );
}

const TABS = [
  { key: "school", label: "School Information", Comp: SchoolInfoTab },
  { key: "academic", label: "Academic Year & Term", Comp: AcademicTab },
  { key: "grading", label: "Grading Scale", Comp: GradingTab },
  { key: "users", label: "Users", Comp: UsersTab },
  { key: "roles", label: "Roles & Permissions", Comp: RolesTab },
  { key: "branding", label: "Branding & Appearance", Comp: BrandingTab },
];

export default function SettingsPage() {
  const [tab, setTab] = useState("school");
  const Active = TABS.find((t) => t.key === tab).Comp;

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        sub="Manage school information, academic structure, and portal access."
      />
      <div className="tab-bar" style={{ marginBottom: 18, overflowX: "auto" }}>
        {TABS.map((t) => (
          <div
            key={t.key}
            className={cx("tab", tab === t.key && "on")}
            onClick={() => setTab(t.key)}
            style={{ cursor: "pointer", whiteSpace: "nowrap" }}
          >
            {t.label}
          </div>
        ))}
      </div>
      <Active />
    </>
  );
}
