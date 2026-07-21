import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { BookOpen, Contact, Users2 } from "lucide-react";

import {
  PageHeader,
  Avatar,
  StatusBadge,
  EmptyState,
} from "../../components/ui/Primitives.jsx";
import { getClassArm } from "../../services/classArmsService.js";
import { getErrorMessage } from "../../utils/errors.js";

function Info({ label, value }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: 11.5, marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 550 }}>{value ?? "—"}</div>
    </div>
  );
}

function SectionHead({ icon: Icon, title, sub }) {
  return (
    <div className="panel-head">
      <div>
        <div
          className="panel-title"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <Icon size={15} style={{ color: "var(--ink-4)" }} />
          {title}
        </div>
        {sub && <div className="panel-sub">{sub}</div>}
      </div>
    </div>
  );
}

export default function ClassArmProfilePage() {
  const { id } = useParams();
  const name = decodeURIComponent(id);

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getClassArm(name);
        setGroup(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [name]);

  if (loading) return <div className="muted">Loading class arm…</div>;
  if (!group) return <div className="muted">Class arm not found</div>;

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title={group.student_group_name || group.name}
        actions={<StatusBadge s={group.disabled ? "INACTIVE" : "ACTIVE"} />}
      />

      <div className="panel" style={{ marginBottom: 18 }}>
        <SectionHead icon={BookOpen} title="Group Details" />
        <div className="grid-3" style={{ padding: "4px 18px 20px" }}>
          <Info
            label="Academic Year"
            value={group.academic_year ? group.academic_year : "-"}
          />
          <Info
            label="Academic Term"
            value={group.academic_term ? group.academic_term : "-"}
          />
          <Info
            label="Group Based On"
            value={group.group_based_on ? group.group_based_on : "-"}
          />
          <Info label="Class" value={group.program ? group.program : "-"} />
          <Info
            label="Course"
            value={group.course ? group.group_based_on : "-"}
          />
          <Info label="Batch" value={group.batch ? group.course : "-"} />
          <Info
            label="Student Category"
            value={group.student_category ? group.student_category : "-"}
          />
          <Info label="Max Strength" value={group.max_strength || "No limit"} />
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 18 }}>
        <SectionHead
          icon={Users2}
          title="Students"
          sub={`${group.students?.length || 0} enrolled`}
        />
        {!group.students?.length ? (
          <EmptyState icon={Users2} title="No students assigned" />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No.</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {group.students.map((s, i) => (
                <tr key={i} className="row">
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <Avatar
                        name={s.student_name || s.student}
                        size={28}
                        src={s.image}
                      />
                      <span style={{ fontWeight: 550 }}>
                        {s.student_name || s.student}
                      </span>
                    </div>
                  </td>
                  <td className="tnum muted">{s.group_roll_number || "—"}</td>
                  <td>
                    <StatusBadge s={s.active ? "ACTIVE" : "INACTIVE"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <SectionHead
          icon={Contact}
          title="Instructors"
          sub={`${group.instructors?.length || 0} assigned`}
        />
        {!group.instructors?.length ? (
          <EmptyState icon={Contact} title="No instructors assigned" />
        ) : (
          <div
            style={{
              padding: "4px 18px 18px",
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {group.instructors.map((item, i) => (
              <span key={i} className="chip">
                {item.instructor_name || item.instructor}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
