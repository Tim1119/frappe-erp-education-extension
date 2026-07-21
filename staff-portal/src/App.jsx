import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppShell from './components/layout/AppShell';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/students/StudentsPage';
import StudentProfilePage from './pages/students/StudentProfilePage';
import StudentFormPage from './pages/students/StudentFormPage';

import StudentGroupsPage from './pages/StudentGroupsPage';
import AttendancePage from './pages/AttendancePage';
import AssessmentsPage from './pages/AssessmentsPage';
import ResultsPage from './pages/ResultsPage';
import SchedulePage from './pages/SchedulePage';
import TeachersPage from './pages/TeachersPage';
import GuardiansPage from './pages/GuardiansPage';
import FeesPage from './pages/FeesPage';
import HrPage from './pages/HrPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import NotFound from './pages/NotFound';

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Geist','Inter',system-ui,sans-serif", background: '#08090d',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 42, height: 42,
          border: '3px solid rgba(255,255,255,.1)',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }} />
        <div style={{ fontWeight: 600, color: '#f1f3f7', fontSize: 14 }}>Loading…</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Protected({ children }) {
  const { authenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingScreen />;
  return authenticated
    ? children
    : <Navigate to="/login" replace state={{ from: location }} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={<Protected><AppShell /></Protected>}
      >
        <Route index element={<Dashboard />} />
        {/* <Route path="students" element={<StudentsPage />} /> */}
        <Route path="students" element={<StudentsPage />} />

        <Route path="students/new" element={<StudentFormPage />} />

        <Route path="students/:id/edit" element={<StudentFormPage />} />

        <Route path="students/:id" element={<StudentProfilePage />} />

{/* <Route path="student-groups" element={<StudentGroupsPage />} /> */}

        <Route path="student-groups" element={<StudentGroupsPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="assessments" element={<AssessmentsPage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="guardians" element={<GuardiansPage />} />
        <Route path="fees" element={<FeesPage />} />
        <Route path="hr" element={<HrPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
