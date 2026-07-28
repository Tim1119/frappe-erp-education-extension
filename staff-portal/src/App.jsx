import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AppShell from "@/components/layout/AppShell";

import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/dashboard/Dashboard";
import NotFound from "@/pages/NotFound";
import PlaceholderPage from "@/pages/placeholder/PlaceholderPage";

// ─── Admin pages ───────────────────────────────────────────────────────
import StudentsPage from "@/pages/admin/students/StudentsPage";
import StudentProfilePage from "@/pages/admin/students/StudentProfilePage";
import StudentFormPage from "@/pages/admin/students/StudentFormPage";

import TeachersPage from "@/pages/admin/teachers/TeachersPage";
import TeacherProfilePage from "@/pages/admin/teachers/TeacherProfilePage";
import TeacherFormPage from "@/pages/admin/teachers/TeacherFormPage";

import GuardiansPage from "@/pages/admin/guardians/GuardiansPage";
import GuardianProfilePage from "@/pages/admin/guardians/GuardianProfilePage";
import GuardianFormPage from "@/pages/admin/guardians/GuardianFormPage";

import ClassesPage from "@/pages/admin/classes/ClassesPage";
import ClassProfilePage from "@/pages/admin/classes/ClassProfilePage";
import ClassFormPage from "@/pages/admin/classes/ClassFormPage";

import ClassArmsPage from "@/pages/admin/class-arms/ClassArmsPage";
import ClassArmProfilePage from "@/pages/admin/class-arms/ClassArmProfilePage";
import ClassArmFormPage from "@/pages/admin/class-arms/ClassArmFormPage";

import SubjectsPage from "@/pages/admin/subjects/SubjectsPage";
import SubjectProfilePage from "@/pages/admin/subjects/SubjectProfilePage";
import SubjectFormPage from "@/pages/admin/subjects/SubjectFormPage";

import TopicsPage from "@/pages/admin/topics/TopicsPage";
import TopicProfilePage from "@/pages/admin/topics/TopicProfilePage";
import TopicFormPage from "@/pages/admin/topics/TopicFormPage";

import ArticlesPage from "@/pages/admin/articles/ArticlesPage";
import ArticleProfilePage from "@/pages/admin/articles/ArticleProfilePage";
import ArticleFormPage from "@/pages/admin/articles/ArticleFormPage";

import VideosPage from "@/pages/admin/videos/VideosPage";
import VideoProfilePage from "@/pages/admin/videos/VideoProfilePage";
import VideoFormPage from "@/pages/admin/videos/VideoFormPage";

import QuizzesPage from "@/pages/admin/quizzes/QuizzesPage";
import QuizProfilePage from "@/pages/admin/quizzes/QuizProfilePage";
import QuizFormPage from "@/pages/admin/quizzes/QuizFormPage";

import ClassroomsPage from "@/pages/admin/classrooms/ClassroomsPage";
import ClassroomProfilePage from "@/pages/admin/classrooms/ClassroomProfilePage";
import ClassroomFormPage from "@/pages/admin/classrooms/ClassroomFormPage";

import FeeCategoryPage from "@/pages/admin/fee-category/FeeCategoryPage";
import FeeCategoryProfilePage from "@/pages/admin/fee-category/FeeCategoryProfilePage";
import FeeCategoryFormPage from "@/pages/admin/fee-category/FeeCategoryFormPage";

import FeeStructurePage from "@/pages/admin/fee-structure/FeeStructurePage";
import FeeStructureProfilePage from "@/pages/admin/fee-structure/FeeStructureProfilePage";
import FeeStructureFormPage from "@/pages/admin/fee-structure/FeeStructureFormPage";

import FeeSchedulePage from "@/pages/admin/fee-schedule/FeeSchedulePage";
import FeeScheduleProfilePage from "@/pages/admin/fee-schedule/FeeScheduleProfilePage";
import FeeScheduleFormPage from "@/pages/admin/fee-schedule/FeeScheduleFormPage";

import StudentApplicantsPage from "@/pages/admin/student-applicant/StudentApplicantsPage";
import StudentApplicantProfilePage from "@/pages/admin/student-applicant/StudentApplicantProfilePage";
import StudentApplicantFormPage from "@/pages/admin/student-applicant/StudentApplicantFormPage";

import StudentAdmissionsPage from "@/pages/admin/student-admission/StudentAdmissionsPage";
import StudentAdmissionProfilePage from "@/pages/admin/student-admission/StudentAdmissionProfilePage";
import StudentAdmissionFormPage from "@/pages/admin/student-admission/StudentAdmissionFormPage";

import AcademicTermsPage from "@/pages/admin/academic-term/AcademicTermsPage";
import AcademicTermProfilePage from "@/pages/admin/academic-term/AcademicTermProfilePage";
import AcademicTermFormPage from "@/pages/admin/academic-term/AcademicTermFormPage";

import StudentCategoriesPage from "@/pages/admin/student-category/StudentCategoriesPage";
import StudentCategoryProfilePage from "@/pages/admin/student-category/StudentCategoryProfilePage";
import StudentCategoryFormPage from "@/pages/admin/student-category/StudentCategoryFormPage";

import StudentBatchNamesPage from "@/pages/admin/student-batch-name/StudentBatchNamesPage";
import StudentBatchNameProfilePage from "@/pages/admin/student-batch-name/StudentBatchNameProfilePage";
import StudentBatchNameFormPage from "@/pages/admin/student-batch-name/StudentBatchNameFormPage";

import AcademicYearsPage from "@/pages/admin/academic-year/AcademicYearsPage";
import AcademicYearProfilePage from "@/pages/admin/academic-year/AcademicYearProfilePage";
import AcademicYearFormPage from "@/pages/admin/academic-year/AcademicYearFormPage";

import GradingScalesPage from "@/pages/admin/grading-scale/GradingScalesPage";
import GradingScaleProfilePage from "@/pages/admin/grading-scale/GradingScaleProfilePage";
import GradingScaleFormPage from "@/pages/admin/grading-scale/GradingScaleFormPage";

import EducationSettingsPage from "@/pages/admin/education-settings/EducationSettingsPage";
import SchoolSettingsPage from "@/pages/admin/school-settings/SchoolSettingsPage";

import StudentLogsPage from "@/pages/admin/student-log/StudentLogsPage";
import StudentLogProfilePage from "@/pages/admin/student-log/StudentLogProfilePage";
import StudentLogFormPage from "@/pages/admin/student-log/StudentLogFormPage";

import ClassEnrollmentsPage from "@/pages/admin/class-enrollment/ClassEnrollmentsPage";
import ClassEnrollmentProfilePage from "@/pages/admin/class-enrollment/ClassEnrollmentProfilePage";
import ClassEnrollmentFormPage from "@/pages/admin/class-enrollment/ClassEnrollmentFormPage";

import SubjectEnrollmentsPage from "@/pages/admin/subject-enrollment/SubjectEnrollmentsPage";
import SubjectEnrollmentProfilePage from "@/pages/admin/subject-enrollment/SubjectEnrollmentProfilePage";
import SubjectEnrollmentFormPage from "@/pages/admin/subject-enrollment/SubjectEnrollmentFormPage";

// ─── Loading screen ────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

// ─── Protected wrapper ─────────────────────────────────────────────────

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

// ─── Placeholder helper ────────────────────────────────────────────────

function PH({ title }) {
  return <PlaceholderPage title={title} />;
}

// ─── App ───────────────────────────────────────────────────────────────

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

        {/* ─── Students ──────────────────────────────────────── */}
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/new" element={<StudentFormPage />} />
        <Route path="students/:id/edit" element={<StudentFormPage />} />
        <Route path="students/:id" element={<StudentProfilePage />} />

        {/* ─── Teachers ──────────────────────────────────────── */}
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="teachers/new" element={<TeacherFormPage />} />
        <Route path="teachers/:id/edit" element={<TeacherFormPage />} />
        <Route path="teachers/:id" element={<TeacherProfilePage />} />

        {/* ─── Guardians ─────────────────────────────────────── */}
        <Route path="guardians" element={<GuardiansPage />} />
        <Route path="guardians/new" element={<GuardianFormPage />} />
        <Route path="guardians/:id/edit" element={<GuardianFormPage />} />
        <Route path="guardians/:id" element={<GuardianProfilePage />} />

        {/* ─── Classes ───────────────────────────────────────── */}
        <Route path="classes" element={<ClassesPage />} />
        <Route path="classes/new" element={<ClassFormPage />} />
        <Route path="classes/:id/edit" element={<ClassFormPage />} />
        <Route path="classes/:id" element={<ClassProfilePage />} />

        {/* ─── Class Arms ────────────────────────────────────── */}
        <Route path="class-arms" element={<ClassArmsPage />} />
        <Route path="class-arms/new" element={<ClassArmFormPage />} />
        <Route path="class-arms/:id/edit" element={<ClassArmFormPage />} />
        <Route path="class-arms/:id" element={<ClassArmProfilePage />} />

        {/* ─── Subjects ──────────────────────────────────────── */}
        <Route path="subjects" element={<SubjectsPage />} />
        <Route path="subjects/new" element={<SubjectFormPage />} />
        <Route path="subjects/:id/edit" element={<SubjectFormPage />} />
        <Route path="subjects/:id" element={<SubjectProfilePage />} />

        {/* ─── Topics ────────────────────────────────────────── */}
        <Route path="topics" element={<TopicsPage />} />
        <Route path="topics/new" element={<TopicFormPage />} />
        <Route path="topics/:id/edit" element={<TopicFormPage />} />
        <Route path="topics/:id" element={<TopicProfilePage />} />

        {/* ─── Articles ──────────────────────────────────────── */}
        <Route path="articles" element={<ArticlesPage />} />
        <Route path="articles/new" element={<ArticleFormPage />} />
        <Route path="articles/:id/edit" element={<ArticleFormPage />} />
        <Route path="articles/:id" element={<ArticleProfilePage />} />

        {/* ─── Videos ────────────────────────────────────────── */}
        <Route path="videos" element={<VideosPage />} />
        <Route path="videos/new" element={<VideoFormPage />} />
        <Route path="videos/:id/edit" element={<VideoFormPage />} />
        <Route path="videos/:id" element={<VideoProfilePage />} />

        {/* ─── Quizzes ───────────────────────────────────────── */}
        <Route path="quizzes" element={<QuizzesPage />} />
        <Route path="quizzes/new" element={<QuizFormPage />} />
        <Route path="quizzes/:id/edit" element={<QuizFormPage />} />
        <Route path="quizzes/:id" element={<QuizProfilePage />} />

        {/* ─── Classrooms ────────────────────────────────────── */}
        <Route path="classrooms" element={<ClassroomsPage />} />
        <Route path="classrooms/new" element={<ClassroomFormPage />} />
        <Route path="classrooms/:id/edit" element={<ClassroomFormPage />} />
        <Route path="classrooms/:id" element={<ClassroomProfilePage />} />

        {/* ─── Fee Category ──────────────────────────────────── */}
        <Route path="fee-category" element={<FeeCategoryPage />} />
        <Route path="fee-category/new" element={<FeeCategoryFormPage />} />
        <Route path="fee-category/:id/edit" element={<FeeCategoryFormPage />} />
        <Route path="fee-category/:id" element={<FeeCategoryProfilePage />} />

        {/* ─── Fee Structure ─────────────────────────────────── */}
        <Route path="fee-structure" element={<FeeStructurePage />} />
        <Route path="fee-structure/new" element={<FeeStructureFormPage />} />
        <Route path="fee-structure/:id/edit" element={<FeeStructureFormPage />} />
        <Route path="fee-structure/:id" element={<FeeStructureProfilePage />} />

        {/* ─── Fee Schedule ──────────────────────────────────── */}
        <Route path="fee-schedule" element={<FeeSchedulePage />} />
        <Route path="fee-schedule/new" element={<FeeScheduleFormPage />} />
        <Route path="fee-schedule/:id/edit" element={<FeeScheduleFormPage />} />
        <Route path="fee-schedule/:id" element={<FeeScheduleProfilePage />} />

        {/* ─── Student Applicants ─────────────────────────────── */}
        <Route path="student-applicants" element={<StudentApplicantsPage />} />
        <Route path="student-applicants/new" element={<StudentApplicantFormPage />} />
        <Route path="student-applicants/:id/edit" element={<StudentApplicantFormPage />} />
        <Route path="student-applicants/:id" element={<StudentApplicantProfilePage />} />

        {/* ─── Student Admissions ─────────────────────────────── */}
        <Route path="student-admissions" element={<StudentAdmissionsPage />} />
        <Route path="student-admissions/new" element={<StudentAdmissionFormPage />} />
        <Route path="student-admissions/:id/edit" element={<StudentAdmissionFormPage />} />
        <Route path="student-admissions/:id" element={<StudentAdmissionProfilePage />} />

        {/* ─── Academic Terms ─────────────────────────────── */}
        <Route path="academic-term" element={<AcademicTermsPage />} />
        <Route path="academic-term/new" element={<AcademicTermFormPage />} />
        <Route path="academic-term/:id/edit" element={<AcademicTermFormPage />} />
        <Route path="academic-term/:id" element={<AcademicTermProfilePage />} />

        {/* ─── Student Category ───────────────────────────── */}
        <Route path="student-category" element={<StudentCategoriesPage />} />
        <Route path="student-category/new" element={<StudentCategoryFormPage />} />
        <Route path="student-category/:id/edit" element={<StudentCategoryFormPage />} />
        <Route path="student-category/:id" element={<StudentCategoryProfilePage />} />

        {/* ─── Student Batch Name ─────────────────────────── */}
        <Route path="student-batch-name" element={<StudentBatchNamesPage />} />
        <Route path="student-batch-name/new" element={<StudentBatchNameFormPage />} />
        <Route path="student-batch-name/:id/edit" element={<StudentBatchNameFormPage />} />
        <Route path="student-batch-name/:id" element={<StudentBatchNameProfilePage />} />

        {/* ─── Academic Year ───────────────────────────────── */}
        <Route path="academic-year" element={<AcademicYearsPage />} />
        <Route path="academic-year/new" element={<AcademicYearFormPage />} />
        <Route path="academic-year/:id/edit" element={<AcademicYearFormPage />} />
        <Route path="academic-year/:id" element={<AcademicYearProfilePage />} />

        {/* ─── Grading Scale ───────────────────────────────── */}
        <Route path="grading-scale" element={<GradingScalesPage />} />
        <Route path="grading-scale/new" element={<GradingScaleFormPage />} />
        <Route path="grading-scale/:id/edit" element={<GradingScaleFormPage />} />
        <Route path="grading-scale/:id" element={<GradingScaleProfilePage />} />


        {/* ─── Placeholder routes ─────────────────────────────── */}
        <Route path="student-log" element={<StudentLogsPage />} />
        <Route path="student-log/new" element={<StudentLogFormPage />} />
        <Route path="student-log/:id/edit" element={<StudentLogFormPage />} />
        <Route path="student-log/:id" element={<StudentLogProfilePage />} />
        <Route path="education-settings" element={<EducationSettingsPage />} />

        <Route path="school-settings" element={<SchoolSettingsPage />} />
        <Route path="class-enrollment" element={<ClassEnrollmentsPage />} />
        <Route path="class-enrollment/new" element={<ClassEnrollmentFormPage />} />
        <Route path="class-enrollment/:id/edit" element={<ClassEnrollmentFormPage />} />
        <Route path="class-enrollment/:id" element={<ClassEnrollmentProfilePage />} />
        <Route path="subject-enrollment" element={<SubjectEnrollmentsPage />} />
        <Route path="subject-enrollment/new" element={<SubjectEnrollmentFormPage />} />
        <Route path="subject-enrollment/:id/edit" element={<SubjectEnrollmentFormPage />} />
        <Route path="subject-enrollment/:id" element={<SubjectEnrollmentProfilePage />} />
        <Route path="fees" element={<PH title="Fees" />} />
        <Route path="student-fee-collection-report" element={<PH title="Student Fee Collection Report" />} />
        <Route path="class-fee-collection-report" element={<PH title="Class wise Fee Collection Report" />} />
        <Route path="subject-schedule" element={<PH title="Subject Schedule" />} />
        <Route path="subject-scheduling-tool" element={<PH title="Subject Scheduling Tool" />} />
        <Route path="student-attendance" element={<PH title="Student Attendance" />} />
        <Route path="student-leave-application" element={<PH title="Student Leave Application" />} />
        <Route path="student-monthly-attendance" element={<PH title="Student Monthly Attendance Sheet" />} />
        <Route path="absent-student-report" element={<PH title="Absent Student Report" />} />
        <Route path="student-batch-attendance" element={<PH title="Student Batch-Wise Attendance" />} />
        <Route path="subject-enrollment-attendance" element={<PH title="Subject Enrollment" />} />
        <Route path="subject-activity" element={<PH title="Subject Activity" />} />
        <Route path="quiz-activity" element={<PH title="Quiz Activity" />} />
        <Route path="assessment-group" element={<PH title="Assessment Group" />} />
        <Route path="assessment-plan" element={<PH title="Assessment Plan" />} />
        <Route path="assessment-result" element={<PH title="Assessment Result" />} />
        <Route path="assessment-criteria" element={<PH title="Assessment Criteria" />} />
        <Route path="subject-assessment-report" element={<PH title="Subject wise Assessment Report" />} />
        <Route path="final-assessment-grades" element={<PH title="Final Assessment Grades" />} />
        <Route path="assessment-plan-status" element={<PH title="Assessment Plan Status" />} />
        <Route path="student-report-generation" element={<PH title="Student Report Generation Tool" />} />
        <Route path="student-attendance-tool" element={<PH title="Student Attendance Tool" />} />
        <Route path="assessment-result-tool" element={<PH title="Assessment Result Tool" />} />
        <Route path="student-group-creation" element={<PH title="Student Group Creation Tool" />} />
        <Route path="class-enrollment-tool" element={<PH title="Class Enrollment Tool" />} />
        <Route path="subject-scheduling-tool-page" element={<PH title="Subject Scheduling Tool" />} />
        <Route path="school-term-result-generator" element={<PH title="School Term Result Generator" />} />
        <Route path="bulk-term-result-generator" element={<PH title="Bulk School Term Result Generator" />} />
        <Route path="student-guardian-contacts" element={<PH title="Student and Guardian Contact Details" />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
