import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PencilLine } from "lucide-react";
import {
  PageHeader,
  StatusBadge,
  EmptyState,
} from "../components/ui/Primitives";
import Modal from "../components/modals/Modal";
import Toolbar from "../components/shared/Toolbar";
import Pager from "../components/shared/Pager";
import { useDocList } from "../hooks/useDocList";
import { useDebounce, usePagination } from "../hooks.js";
import { getErrorMessage } from "../utils/errors";
import * as frappe from "../services/frappeClient";

function BulkScoreEntry({ plan, onClose, onSaved }) {
  const [roster, setRoster] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      frappe.getDoc("Student Group", plan.student_group),
      frappe.getList("Assessment Result", {
        fields: ["name", "student", "total_score"],
        filters: [["assessment_plan", "=", plan.name]],
        limit_page_length: 200,
      }),
    ])
      .then(([groupDoc, existing]) => {
        const byStudent = Object.fromEntries(
          existing.map((r) => [r.student, r]),
        );
        setRoster(
          (groupDoc.students || []).map((s) => ({
            student: s.student,
            student_name: s.student_name,
            resultName: byStudent[s.student]?.name || null,
            total_score: byStudent[s.student]?.total_score ?? "",
          })),
        );
      })
      .catch((err) => toast.error(getErrorMessage(err)));
  }, [plan.name, plan.student_group]);

  const setScore = (student, v) =>
    setRoster((rs) =>
      rs.map((r) => (r.student === student ? { ...r, total_score: v } : r)),
    );

  const save = async () => {
    setSaving(true);
    try {
      await Promise.all(
        roster
          .filter((r) => r.total_score !== "")
          .map((r) =>
            r.resultName
              ? frappe.updateDoc("Assessment Result", r.resultName, {
                  total_score: Number(r.total_score),
                })
              : frappe.createDoc("Assessment Result", {
                  student: r.student,
                  assessment_plan: plan.name,
                  total_score: Number(r.total_score),
                }),
          ),
      );
      toast.success("Scores saved");
      onSaved();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (roster == null)
    return (
      <div className="muted" style={{ padding: "30px 0", textAlign: "center" }}>
        Loading roster…
      </div>
    );

  return (
    <div>
      <div className="muted" style={{ fontSize: 13, marginBottom: 14 }}>
        {plan.course} · {plan.student_group} · Max score{" "}
        {plan.maximum_assessment_score}
      </div>
      <table className="tbl">
        <thead>
          <tr>
            <th>Student</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {roster.map((r) => (
            <tr key={r.student} className="row">
              <td style={{ fontWeight: 550 }}>{r.student_name}</td>
              <td>
                <input
                  className="input"
                  type="number"
                  min={0}
                  max={plan.maximum_assessment_score}
                  style={{ maxWidth: 100 }}
                  value={r.total_score}
                  onChange={(e) => setScore(r.student, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="modal-foot" style={{ paddingTop: 20 }}>
        <button className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save scores"}
        </button>
      </div>
    </div>
  );
}

export default function AssessmentsPage() {
  const { page, setPage, reset } = usePagination(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [scoring, setScoring] = useState(null);

  const { rows, count, loading, reload } = useDocList("assessmentPlan", {
    search: debouncedSearch,
    searchFields: ["assessment_name"],
    orderBy: "modified desc",
    page,
    pageSize: 10,
  });

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title="Assessments"
        sub={loading ? "Loading…" : `${count} assessment plans`}
      />

      <Toolbar
        search={search}
        onSearch={(v) => {
          setSearch(v);
          reset();
        }}
        onCreate={() =>
          toast("Create assessment plans from Frappe Desk for now.")
        }
        createLabel="New assessment"
      />

      <div className="panel">
        <table className="tbl">
          <thead>
            <tr>
              <th>Assessment</th>
              <th>Course</th>
              <th>Group</th>
              <th>Max score</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.name} className="row">
                <td style={{ fontWeight: 550 }}>{a.assessment_name}</td>
                <td className="muted2" style={{ fontSize: 13 }}>
                  {a.course}
                </td>
                <td className="muted2" style={{ fontSize: 13 }}>
                  {a.student_group}
                </td>
                <td className="tnum">{a.maximum_assessment_score}</td>
                <td>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setScoring(a)}
                  >
                    <PencilLine size={13} />
                    Enter scores
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && (
          <EmptyState title="No assessment plans found" />
        )}
        <Pager count={count} page={page} setPage={setPage} pageSize={10} />
      </div>

      <Modal
        open={Boolean(scoring)}
        onClose={() => setScoring(null)}
        title="Bulk score entry"
        size="lg"
      >
        {scoring && (
          <BulkScoreEntry
            plan={scoring}
            onClose={() => setScoring(null)}
            onSaved={() => {
              setScoring(null);
              reload();
            }}
          />
        )}
      </Modal>
    </>
  );
}
