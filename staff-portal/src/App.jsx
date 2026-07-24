import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AppShell from "./components/layout/AppShell";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudentsPage from "./pages/students/StudentsPage";
import StudentProfilePage from "./pages/students/StudentProfilePage";
import StudentFormPage from "./pages/students/StudentFormPage";


import ClassesPage from "./pages/class/ClassesPage";
import ClassFormPage from "./pages/class/ClassFormPage";
import ClassProfilePage from "./pages/class/ClassProfilePage";

import ClassArmsPage from "./pages/class-arms/ClassArmsPage";
import ClassArmFormPage from "./pages/class-arms/ClassArmFormPage";
import ClassArmProfilePage from "./pages/class-arms/ClassArmProfilePage";

import SubjectsPage from "./pages/subject/SubjectsPage";
import SubjectFormPage from "./pages/subject/SubjectFormPage";
import SubjectProfilePage from "./pages/subject/SubjectProfilePage";



import TeachersPage from "./pages/teachers/TeachersPage";
import TeacherFormPage from "./pages/teachers/TeacherFormPage";
import TeacherProfilePage from "./pages/teachers/TeacherProfilePage";

import GuardiansPage from "./pages/guardian/GuardiansPage";
import GuardianFormPage from "./pages/guardian/GuardianFormPage";
import GuardianProfilePage from "./pages/guardian/GuardianProfilePage";


import FeeCategoryPage from "./pages/fee-category/FeeCategoryPage";
import FeeCategoryFormPage from "./pages/fee-category/FeeCategoryFormPage";
import FeeCategoryProfilePage from "./pages/fee-category/FeeCategoryProfilePage";

import FeeStructurePage from "./pages/fee-structure/FeeStructurePage";
import FeeStructureFormPage from "./pages/fee-structure/FeeStructureFormPage";
import FeeStructureProfilePage from "./pages/fee-structure/FeeStructureProfilePage";


import FeeSchedulePage from "./pages/fee-schedule/FeeSchedulePage";
import FeeScheduleFormPage from "./pages/fee-schedule/FeeScheduleFormPage";
import FeeScheduleProfilePage from "./pages/fee-schedule/FeeScheduleProfilePage";

import ArticlesPage from "./pages/article/ArticlesPage";
import ArticleFormPage from "./pages/article/ArticleFormPage";
import ArticleProfilePage from "./pages/article/ArticleProfilePage";


import AttendancePage from "./pages/AttendancePage";
import AssessmentsPage from "./pages/AssessmentsPage";
import ResultsPage from "./pages/ResultsPage";
import SchedulePage from "./pages/SchedulePage";

import HrPage from "./pages/HrPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";


function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Geist','Inter',system-ui,sans-serif",
        background: "#08090d",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 42,
            height: 42,
            border: "3px solid rgba(255,255,255,.1)",
            borderTopColor: "#3b82f6",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <div style={{ fontWeight: 600, color: "#f1f3f7", fontSize: 14 }}>
          Loading…
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Protected({ children }) {
  const { authenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingScreen />;
  return authenticated ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <Protected>
            <AppShell />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />

        {/* -------students --------- */}
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/new" element={<StudentFormPage />} />
        <Route path="students/:id/edit" element={<StudentFormPage />} />
        <Route path="students/:id" element={<StudentProfilePage />} />

        {/* ------- classes --------- */}
        <Route path="classes" element={<ClassesPage />} />
        <Route path="classes/new" element={<ClassFormPage />} />
        <Route path="classes/:id/edit" element={<ClassFormPage />} />
        <Route path="classes/:id" element={<ClassProfilePage />} />


        {/* ------- class arms --------  */}

        <Route path="class-arms" element={<ClassArmsPage />} />
        <Route path="class-arms/new" element={<ClassArmFormPage />} />
        <Route path="class-arms/:id/edit" element={<ClassArmFormPage />} />
        <Route path="class-arms/:id" element={<ClassArmProfilePage />} />
        
        {/* ------- subject --------  */}
        <Route path="subjects" element={<SubjectsPage />} />
        <Route path="subjects/new" element={<SubjectFormPage />} />
        <Route path="subjects/:id/edit" element={<SubjectFormPage />} />
        <Route path="subjects/:id" element={<SubjectProfilePage />} />

        {/* ------- articles--------  */}
        <Route path="articles" element={<ArticlesPage />} />
        <Route path="articles/new" element={<ArticleFormPage />} />
        <Route path="articles/:id/edit" element={<ArticleFormPage />} />
        <Route path="articles/:id" element={<ArticleProfilePage />} />





        <Route path="attendance" element={<AttendancePage />} />
        <Route path="assessments" element={<AssessmentsPage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="schedule" element={<SchedulePage />} />


        {/* ----------teachers -------- */}
        {/* <Route path="teachers" element={<TeachersPage />} /> */}
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="teachers/new" element={<TeacherFormPage />} />
        <Route path="teachers/:id" element={<TeacherProfilePage />} />
        <Route path="teachers/:id/edit" element={<TeacherFormPage />} />

        {/* -------- fee-category ------------- */}
        <Route path="fee-category" element={<FeeCategoryPage />} />
        <Route path="fee-category/new" element={<FeeCategoryFormPage />} />
        <Route path="fee-category/:id/edit" element={<FeeCategoryFormPage />} />
        <Route path="fee-category/:id" element={<FeeCategoryProfilePage />} />

        {/* -------- fee-category ------------- */}

        <Route path="fee-structure" element={<FeeStructurePage />} />
        <Route path="fee-structure/new" element={<FeeStructureFormPage />} />
        <Route path="fee-structure/:id/edit" element={<FeeStructureFormPage />} />
        <Route path="fee-structure/:id" element={<FeeStructureProfilePage />} />

        {/* ------- fee schedule --------- */}
        <Route path="fees" element={<FeeSchedulePage />} />
        <Route path="fee-schedule" element={<FeeSchedulePage />} />
        <Route path="fee-schedule/new" element={<FeeScheduleFormPage />} />
        <Route path="fee-schedule/:id/edit" element={<FeeScheduleFormPage />} />
        <Route path="fee-schedule/:id" element={<FeeScheduleProfilePage />} />
        

        {/* ------- guardians --------- */}
        <Route path="guardians" element={<GuardiansPage />} />
        <Route path="guardians/new" element={<GuardianFormPage />} />
        <Route path="guardians/:id/edit" element={<GuardianFormPage />} />
        <Route path="guardians/:id" element={<GuardianProfilePage />} />


        <Route path="hr" element={<HrPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
