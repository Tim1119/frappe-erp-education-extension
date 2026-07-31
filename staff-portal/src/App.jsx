import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AppShell from "@/components/layout/AppShell";

import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/dashboard/Dashboard";
import NotFound from "@/pages/NotFound";
import PlaceholderPage from "@/pages/placeholder/PlaceholderPage";
import ReportPrintPage from "@/pages/print/ReportPrintPage";

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

import AssessmentGroupsPage from "@/pages/admin/assessment-group/AssessmentGroupsPage";
import AssessmentGroupProfilePage from "@/pages/admin/assessment-group/AssessmentGroupProfilePage";
import AssessmentGroupFormPage from "@/pages/admin/assessment-group/AssessmentGroupFormPage";

import AssessmentPlansPage from "@/pages/admin/assessment-plan/AssessmentPlansPage";
import AssessmentPlanProfilePage from "@/pages/admin/assessment-plan/AssessmentPlanProfilePage";
import AssessmentPlanFormPage from "@/pages/admin/assessment-plan/AssessmentPlanFormPage";

import AssessmentResultsPage from "@/pages/admin/assessment-result/AssessmentResultsPage";
import AssessmentResultProfilePage from "@/pages/admin/assessment-result/AssessmentResultProfilePage";
import AssessmentResultFormPage from "@/pages/admin/assessment-result/AssessmentResultFormPage";

import AssessmentCriteriaPage from "@/pages/admin/assessment-criteria/AssessmentCriteriaPage";
import AssessmentCriteriaProfilePage from "@/pages/admin/assessment-criteria/AssessmentCriteriaProfilePage";
import AssessmentCriteriaFormPage from "@/pages/admin/assessment-criteria/AssessmentCriteriaFormPage";

import StudentAttendancesPage from "@/pages/admin/student-attendance/StudentAttendancesPage";
import StudentAttendanceProfilePage from "@/pages/admin/student-attendance/StudentAttendanceProfilePage";
import StudentAttendanceFormPage from "@/pages/admin/student-attendance/StudentAttendanceFormPage";

import StudentLeaveApplicationsPage from "@/pages/admin/student-leave-application/StudentLeaveApplicationsPage";
import StudentLeaveApplicationProfilePage from "@/pages/admin/student-leave-application/StudentLeaveApplicationProfilePage";
import StudentLeaveApplicationFormPage from "@/pages/admin/student-leave-application/StudentLeaveApplicationFormPage";

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

import FeesPage from "@/pages/admin/fees/FeesPage";
import FeesProfilePage from "@/pages/admin/fees/FeesProfilePage";

import StudentFeeCollectionReportPage from "@/pages/admin/reports/StudentFeeCollectionReportPage";
import ClassFeeCollectionReportPage from "@/pages/admin/reports/ClassFeeCollectionReportPage";

import SubjectSchedulesPage from "@/pages/admin/subject-schedule/SubjectSchedulesPage";
import SubjectScheduleProfilePage from "@/pages/admin/subject-schedule/SubjectScheduleProfilePage";
import SubjectScheduleFormPage from "@/pages/admin/subject-schedule/SubjectScheduleFormPage";

import SubjectSchedulingToolPage from "@/pages/admin/subject-scheduling-tool/SubjectSchedulingToolPage";

import SubjectAssessmentReportPage from "@/pages/admin/reports/SubjectAssessmentReportPage";
import FinalAssessmentGradesPage from "@/pages/admin/reports/FinalAssessmentGradesPage";
import AssessmentPlanStatusPage from "@/pages/admin/reports/AssessmentPlanStatusPage";

import StudentReportGenerationToolPage from "@/pages/admin/student-report-generation-tool/StudentReportGenerationToolPage";

import StudentGuardianContactsPage from "@/pages/admin/reports/StudentGuardianContactsPage";
import StudentMonthlyAttendanceSheetPage from "@/pages/admin/reports/StudentMonthlyAttendanceSheetPage";
import AbsentStudentReportPage from "@/pages/admin/reports/AbsentStudentReportPage";
import StudentBatchWiseAttendancePage from "@/pages/admin/reports/StudentBatchWiseAttendancePage";
import SubjectActivitiesPage from "@/pages/admin/subject-activity/SubjectActivitiesPage";
import SubjectActivityProfilePage from "@/pages/admin/subject-activity/SubjectActivityProfilePage";
import QuizActivitiesPage from "@/pages/admin/quiz-activity/QuizActivitiesPage";
import QuizActivityProfilePage from "@/pages/admin/quiz-activity/QuizActivityProfilePage";
import StudentAttendanceToolPage from "@/pages/admin/student-attendance-tool/StudentAttendanceToolPage";
import AssessmentResultToolPage from "@/pages/admin/assessment-result-tool/AssessmentResultToolPage";

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
        <Route path="fees" element={<FeesPage />} />
        <Route path="fees/:id" element={<FeesProfilePage />} />
        <Route path="student-fee-collection-report" element={<StudentFeeCollectionReportPage />} />
        <Route path="class-fee-collection-report" element={<ClassFeeCollectionReportPage />} />
        <Route path="subject-schedule" element={<SubjectSchedulesPage />} />
        <Route path="subject-schedule/new" element={<SubjectScheduleFormPage />} />
        <Route path="subject-schedule/:id/edit" element={<SubjectScheduleFormPage />} />
        <Route path="subject-schedule/:id" element={<SubjectScheduleProfilePage />} />
        <Route path="subject-scheduling-tool" element={<SubjectSchedulingToolPage />} />
        <Route path="student-attendance" element={<StudentAttendancesPage />} />
        <Route path="student-attendance/new" element={<StudentAttendanceFormPage />} />
        <Route path="student-attendance/:id/edit" element={<StudentAttendanceFormPage />} />
        <Route path="student-attendance/:id" element={<StudentAttendanceProfilePage />} />
        <Route path="student-leave-application" element={<StudentLeaveApplicationsPage />} />
        <Route path="student-leave-application/new" element={<StudentLeaveApplicationFormPage />} />
        <Route path="student-leave-application/:id/edit" element={<StudentLeaveApplicationFormPage />} />
        <Route path="student-leave-application/:id" element={<StudentLeaveApplicationProfilePage />} />
        <Route path="student-monthly-attendance" element={<StudentMonthlyAttendanceSheetPage />} />
        <Route path="absent-student-report" element={<AbsentStudentReportPage />} />
        <Route path="student-batch-attendance" element={<StudentBatchWiseAttendancePage />} />
        <Route path="subject-activity" element={<SubjectActivitiesPage />} />
        <Route path="subject-activity/:id" element={<SubjectActivityProfilePage />} />
        <Route path="quiz-activity" element={<QuizActivitiesPage />} />
        <Route path="quiz-activity/:id" element={<QuizActivityProfilePage />} />
        <Route path="assessment-group" element={<AssessmentGroupsPage />} />
        <Route path="assessment-group/new" element={<AssessmentGroupFormPage />} />
        <Route path="assessment-group/:id/edit" element={<AssessmentGroupFormPage />} />
        <Route path="assessment-group/:id" element={<AssessmentGroupProfilePage />} />
        <Route path="assessment-plan" element={<AssessmentPlansPage />} />
        <Route path="assessment-plan/new" element={<AssessmentPlanFormPage />} />
        <Route path="assessment-plan/:id/edit" element={<AssessmentPlanFormPage />} />
        <Route path="assessment-plan/:id" element={<AssessmentPlanProfilePage />} />
        <Route path="assessment-result" element={<AssessmentResultsPage />} />
        <Route path="assessment-result/new" element={<AssessmentResultFormPage />} />
        <Route path="assessment-result/:id/edit" element={<AssessmentResultFormPage />} />
        <Route path="assessment-result/:id" element={<AssessmentResultProfilePage />} />
        <Route path="assessment-criteria" element={<AssessmentCriteriaPage />} />
        <Route path="assessment-criteria/new" element={<AssessmentCriteriaFormPage />} />
        <Route path="assessment-criteria/:id/edit" element={<AssessmentCriteriaFormPage />} />
        <Route path="assessment-criteria/:id" element={<AssessmentCriteriaProfilePage />} />
        <Route path="subject-assessment-report" element={<SubjectAssessmentReportPage />} />
        <Route path="final-assessment-grades" element={<FinalAssessmentGradesPage />} />
        <Route path="assessment-plan-status" element={<AssessmentPlanStatusPage />} />
        <Route path="student-report-generation" element={<StudentReportGenerationToolPage />} />
        <Route path="student-attendance-tool" element={<StudentAttendanceToolPage />} />
        <Route path="assessment-result-tool" element={<AssessmentResultToolPage />} />
        <Route path="student-group-creation" element={<PH title="Student Group Creation Tool" />} />
        <Route path="class-enrollment-tool" element={<PH title="Class Enrollment Tool" />} />
        <Route path="subject-scheduling-tool-page" element={<SubjectSchedulingToolPage />} />
        <Route path="school-term-result-generator" element={<PH title="School Term Result Generator" />} />
        <Route path="bulk-term-result-generator" element={<PH title="Bulk School Term Result Generator" />} />
        <Route path="student-guardian-contacts" element={<StudentGuardianContactsPage />} />
      </Route>

      {/* Standalone report print view -- deliberately OUTSIDE the
          /dashboard AppShell tree, so it renders with no Sidebar/Navbar/
          PageBreadcrumbs/app chrome at all, matching Frappe Desk's own
          separate print document. Still auth-gated via Protected. */}
      <Route
        path="/print/report"
        element={
          <Protected>
            <ReportPrintPage />
          </Protected>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
