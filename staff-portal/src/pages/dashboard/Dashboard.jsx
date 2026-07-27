import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Contact,
  Users2,
  CalendarCheck,
  ClipboardList,
  Award,
  ArrowRight,
  Plus,
  UserPlus,
  BookOpen,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { TrendCard } from "@/components/charts/TrendCard";
import { useAuth } from "@/context/AuthContext";
import { initials } from "@/utils/format";
import * as frappe from "@/services/frappeClient";

const todayISO = () => new Date().toISOString().slice(0, 10);
const dayLabel = (iso) =>
  new Date(iso).toLocaleDateString("en", { weekday: "short" });

function daysAgoISO(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// ─── Stat card ───────────────────────────────────────────────────────

function StatCard({ title, value, icon: Icon, loading, onClick, hint }) {
  return (
    <Card
      className={
        onClick
          ? "cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
          : ""
      }
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton className="mt-1.5 h-7 w-16" />
          ) : (
            <p className="text-2xl font-semibold tracking-tight tnum">
              {value}
            </p>
          )}
          {hint && !loading && (
            <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        {onClick && (
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </CardContent>
    </Card>
  );
}

// ─── Quick action ────────────────────────────────────────────────────

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────

export default function Dashboard() {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();

  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState([]);
  const [recentStudents, setRecentStudents] = useState(null);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = user?.full_name?.split(" ")[0] || "there";

  useEffect(() => {
    const today = todayISO();

    Promise.all([
      frappe.getCount("Student"),
      frappe.getCount("Instructor"),
      frappe.getCount("Student Group"),
      frappe.getCount("Student Attendance", [["attendance_date", "=", today]]),
      frappe.getCount("Student Attendance", [
        ["attendance_date", "=", today],
        ["status", "=", "Present"],
      ]),
      frappe.getCount("Assessment Plan"),
      frappe.getCount("Assessment Result"),
    ])
      .then(
        ([students, teachers, groups, attToday, presentToday, assessments, results]) => {
          setKpis({
            students,
            teachers,
            groups,
            attendanceRate: attToday
              ? ((presentToday / attToday) * 100).toFixed(1)
              : null,
            assessments,
            results,
          });
        },
      )
      .catch(() =>
        setKpis({
          students: 0,
          teachers: 0,
          groups: 0,
          attendanceRate: null,
          assessments: 0,
          results: 0,
        }),
      )
      .finally(() => setLoading(false));

    // 7-day attendance trend
    Promise.all(
      Array.from({ length: 7 }).map((_, i) => {
        const d = daysAgoISO(6 - i);
        return Promise.all([
          frappe.getCount("Student Attendance", [["attendance_date", "=", d]]),
          frappe.getCount("Student Attendance", [
            ["attendance_date", "=", d],
            ["status", "=", "Present"],
          ]),
        ]).then(([total, present]) => ({
          label: dayLabel(d),
          value: total ? Math.round((present / total) * 100) : 0,
        }));
      }),
    )
      .then(setTrend)
      .catch(() => setTrend([]));

    // Recently added students
    frappe
      .getList("Student", {
        fields: ["name", "student_name", "image", "enabled", "creation"],
        order_by: "creation desc",
        limit_page_length: 5,
      })
      .then(setRecentStudents)
      .catch(() => setRecentStudents([]));
  }, []);

  return (
    <>
      <PageHeader
        title={`${greeting}, ${firstName}`}
        description={new Date().toLocaleDateString("en", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Students"
          value={kpis?.students?.toLocaleString()}
          icon={GraduationCap}
          loading={loading}
          onClick={() => navigate("/dashboard/students")}
        />
        <StatCard
          title="Teachers"
          value={kpis?.teachers?.toLocaleString()}
          icon={Contact}
          loading={loading}
          onClick={() => navigate("/dashboard/teachers")}
        />
        <StatCard
          title="Class Arms"
          value={kpis?.groups?.toLocaleString()}
          icon={Users2}
          loading={loading}
          onClick={() => navigate("/dashboard/class-arms")}
        />
        <StatCard
          title="Today's Attendance"
          value={kpis?.attendanceRate !== null ? `${kpis?.attendanceRate}%` : "—"}
          hint={kpis?.attendanceRate === null ? "No records yet today" : undefined}
          icon={CalendarCheck}
          loading={loading}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Attendance trend chart */}
        <div className="lg:col-span-2">
          <TrendCard
            title="Attendance rate"
            sub="Last 7 days, all class arms"
            data={trend}
          />
        </div>

        {/* Quick actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2">
            <QuickAction
              icon={UserPlus}
              label="Add student"
              onClick={() => navigate("/dashboard/students/new")}
            />
            <QuickAction
              icon={Contact}
              label="Add teacher"
              onClick={() => navigate("/dashboard/teachers/new")}
            />
            <QuickAction
              icon={Users2}
              label="Add class arm"
              onClick={() => navigate("/dashboard/class-arms/new")}
            />
            {isAdmin && (
              <QuickAction
                icon={FileText}
                label="Add fee schedule"
                onClick={() => navigate("/dashboard/fee-schedule/new")}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recently added students */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recently added students</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard/students")}
            >
              View all
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentStudents === null ? (
              <div className="space-y-3 p-5">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentStudents.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="No students yet"
                description="Add your first student to get started."
              />
            ) : (
              <div className="divide-y">
                {recentStudents.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => navigate(`/dashboard/students/${s.name}`)}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-accent"
                  >
                    <Avatar className="h-9 w-9">
                      {s.image && <AvatarImage src={s.image} />}
                      <AvatarFallback className="text-xs">
                        {initials(s.student_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {s.student_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{s.name}</p>
                    </div>
                    <Badge variant={s.enabled ? "success" : "secondary"}>
                      {s.enabled ? "active" : "inactive"}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin-only assessment snapshot */}
        {isAdmin ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Assessments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <ClipboardList className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold tnum">
                    {loading ? (
                      <Skeleton className="h-5 w-10" />
                    ) : (
                      kpis?.assessments?.toLocaleString()
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Assessment plans
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Award className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold tnum">
                    {loading ? (
                      <Skeleton className="h-5 w-10" />
                    ) : (
                      kpis?.results?.toLocaleString()
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Results recorded
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">My subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={BookOpen}
                title="Nothing scheduled"
                description="Your assigned subjects will appear here."
              />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
