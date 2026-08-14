import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AppShell from "@/components/layout/AppShell";

import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/dashboard/Dashboard";
import NotFound from "@/pages/NotFound";
import PlaceholderPage from "@/pages/placeholder/PlaceholderPage";
import ReportPrintPage from "@/pages/print/ReportPrintPage";

import CompaniesPage from "@/pages/admin/hr/company/CompaniesPage";
import CompanyProfilePage from "@/pages/admin/hr/company/CompanyProfilePage";
import CompanyFormPage from "@/pages/admin/hr/company/CompanyFormPage";
import BranchesPage from "@/pages/admin/hr/branch/BranchesPage";
import BranchProfilePage from "@/pages/admin/hr/branch/BranchProfilePage";
import BranchFormPage from "@/pages/admin/hr/branch/BranchFormPage";
import DepartmentsPage from "@/pages/admin/hr/department/DepartmentsPage";
import DepartmentProfilePage from "@/pages/admin/hr/department/DepartmentProfilePage";
import DepartmentFormPage from "@/pages/admin/hr/department/DepartmentFormPage";
import DesignationsPage from "@/pages/admin/hr/designation/DesignationsPage";
import DesignationProfilePage from "@/pages/admin/hr/designation/DesignationProfilePage";
import DesignationFormPage from "@/pages/admin/hr/designation/DesignationFormPage";
import EmployeesPage from "@/pages/admin/hr/employee/EmployeesPage";
import EmployeeProfilePage from "@/pages/admin/hr/employee/EmployeeProfilePage";
import EmployeeFormPage from "@/pages/admin/hr/employee/EmployeeFormPage";
import EmployeeGroupsPage from "@/pages/admin/hr/employee-group/EmployeeGroupsPage";
import EmployeeGroupProfilePage from "@/pages/admin/hr/employee-group/EmployeeGroupProfilePage";
import EmployeeGroupFormPage from "@/pages/admin/hr/employee-group/EmployeeGroupFormPage";
import EmployeeGradesPage from "@/pages/admin/hr/employee-grade/EmployeeGradesPage";
import EmployeeGradeProfilePage from "@/pages/admin/hr/employee-grade/EmployeeGradeProfilePage";
import EmployeeGradeFormPage from "@/pages/admin/hr/employee-grade/EmployeeGradeFormPage";
import LeaveApplicationsPage from "@/pages/admin/hr/leave-application/LeaveApplicationsPage";
import LeaveApplicationProfilePage from "@/pages/admin/hr/leave-application/LeaveApplicationProfilePage";
import LeaveApplicationFormPage from "@/pages/admin/hr/leave-application/LeaveApplicationFormPage";
import CompensatoryLeaveRequestsPage from "@/pages/admin/hr/compensatory-leave-request/CompensatoryLeaveRequestsPage";
import CompensatoryLeaveRequestProfilePage from "@/pages/admin/hr/compensatory-leave-request/CompensatoryLeaveRequestProfilePage";
import CompensatoryLeaveRequestFormPage from "@/pages/admin/hr/compensatory-leave-request/CompensatoryLeaveRequestFormPage";
import HRSettingsPage from "@/pages/admin/hr/hr-settings/HRSettingsPage";
import HRSettingsFormPage from "@/pages/admin/hr/hr-settings/HRSettingsFormPage";
import DailyWorkSummaryGroupsPage from "@/pages/admin/hr/daily-work-summary-group/DailyWorkSummaryGroupsPage";
import DailyWorkSummaryGroupProfilePage from "@/pages/admin/hr/daily-work-summary-group/DailyWorkSummaryGroupProfilePage";
import DailyWorkSummaryGroupFormPage from "@/pages/admin/hr/daily-work-summary-group/DailyWorkSummaryGroupFormPage";
import TeamUpdatesPage from "@/pages/admin/hr/team-updates/TeamUpdatesPage";
import AttendancesPage from "@/pages/admin/hr/attendance/AttendancesPage";
import AttendanceProfilePage from "@/pages/admin/hr/attendance/AttendanceProfilePage";
import AttendanceFormPage from "@/pages/admin/hr/attendance/AttendanceFormPage";
import AttendanceRequestsPage from "@/pages/admin/hr/attendance-request/AttendanceRequestsPage";
import AttendanceRequestProfilePage from "@/pages/admin/hr/attendance-request/AttendanceRequestProfilePage";
import AttendanceRequestFormPage from "@/pages/admin/hr/attendance-request/AttendanceRequestFormPage";
import EmployeeCheckinsPage from "@/pages/admin/hr/employee-checkin/EmployeeCheckinsPage";
import EmployeeCheckinProfilePage from "@/pages/admin/hr/employee-checkin/EmployeeCheckinProfilePage";
import EmployeeCheckinFormPage from "@/pages/admin/hr/employee-checkin/EmployeeCheckinFormPage";
import ExpenseClaimsPage from "@/pages/admin/hr/expense-claim/ExpenseClaimsPage";
import ExpenseClaimProfilePage from "@/pages/admin/hr/expense-claim/ExpenseClaimProfilePage";
import ExpenseClaimFormPage from "@/pages/admin/hr/expense-claim/ExpenseClaimFormPage";
import EmployeeAdvancesPage from "@/pages/admin/hr/employee-advance/EmployeeAdvancesPage";
import EmployeeAdvanceProfilePage from "@/pages/admin/hr/employee-advance/EmployeeAdvanceProfilePage";
import EmployeeAdvanceFormPage from "@/pages/admin/hr/employee-advance/EmployeeAdvanceFormPage";
import TravelRequestsPage from "@/pages/admin/hr/travel-request/TravelRequestsPage";
import TravelRequestProfilePage from "@/pages/admin/hr/travel-request/TravelRequestProfilePage";
import TravelRequestFormPage from "@/pages/admin/hr/travel-request/TravelRequestFormPage";

// HR Key Reports
import MonthlyAttendanceSheetPage from "@/pages/admin/hr/reports/MonthlyAttendanceSheetPage";
import RecruitmentAnalyticsPage from "@/pages/admin/hr/reports/RecruitmentAnalyticsPage";
import EmployeeAnalyticsPage from "@/pages/admin/hr/reports/EmployeeAnalyticsPage";
import EmployeeLeaveBalancePage from "@/pages/admin/hr/reports/EmployeeLeaveBalancePage";
import EmployeeLeaveBalanceSummaryPage from "@/pages/admin/hr/reports/EmployeeLeaveBalanceSummaryPage";
import EmployeeAdvanceSummaryPage from "@/pages/admin/hr/reports/EmployeeAdvanceSummaryPage";
import EmployeeExitsPage from "@/pages/admin/hr/reports/EmployeeExitsPage";

// HR Other Reports
import EmployeeInformationPage from "@/pages/admin/hr/reports/EmployeeInformationPage";
import EmployeeBirthdayPage from "@/pages/admin/hr/reports/EmployeeBirthdayPage";
import EmployeesWorkingOnHolidayPage from "@/pages/admin/hr/reports/EmployeesWorkingOnHolidayPage";
import DailyWorkSummaryRepliesPage from "@/pages/admin/hr/reports/DailyWorkSummaryRepliesPage";
import PurchaseInvoicesPage from "@/pages/admin/accounting/purchase-invoice/PurchaseInvoicesPage";
import PurchaseInvoiceProfilePage from "@/pages/admin/accounting/purchase-invoice/PurchaseInvoiceProfilePage";
import PurchaseInvoiceFormPage from "@/pages/admin/accounting/purchase-invoice/PurchaseInvoiceFormPage";
import SuppliersPage from "@/pages/admin/accounting/supplier/SuppliersPage";
import SupplierProfilePage from "@/pages/admin/accounting/supplier/SupplierProfilePage";
import SupplierFormPage from "@/pages/admin/accounting/supplier/SupplierFormPage";
import PaymentEntriesPage from "@/pages/admin/accounting/payment-entry/PaymentEntriesPage";
import PaymentEntryProfilePage from "@/pages/admin/accounting/payment-entry/PaymentEntryProfilePage";
import PaymentEntryFormPage from "@/pages/admin/accounting/payment-entry/PaymentEntryFormPage";
import JournalEntriesPage from "@/pages/admin/accounting/journal-entry/JournalEntriesPage";
import JournalEntryProfilePage from "@/pages/admin/accounting/journal-entry/JournalEntryProfilePage";
import JournalEntryFormPage from "@/pages/admin/accounting/journal-entry/JournalEntryFormPage";
import PaymentReconciliationPage from "@/pages/admin/accounting/payment-reconciliation/PaymentReconciliationPage";
import AccountsPayablePage from "@/pages/admin/accounting/reports/AccountsPayablePage";
import AccountsPayableSummaryPage from "@/pages/admin/accounting/reports/AccountsPayableSummaryPage";
import PurchaseRegisterPage from "@/pages/admin/accounting/reports/PurchaseRegisterPage";
import ItemWisePurchaseRegisterPage from "@/pages/admin/accounting/reports/ItemWisePurchaseRegisterPage";
import PurchaseOrderAnalysisPage from "@/pages/admin/accounting/reports/PurchaseOrderAnalysisPage";
import ReceivedItemsToBeBilledPage from "@/pages/admin/accounting/reports/ReceivedItemsToBeBilledPage";
import SupplierLedgerSummaryPage from "@/pages/admin/accounting/reports/SupplierLedgerSummaryPage";

// ─── Admin pages ───────────────────────────────────────────────────────
import StudentsPage from "@/pages/admin/education/students/StudentsPage";
import StudentProfilePage from "@/pages/admin/education/students/StudentProfilePage";
import StudentFormPage from "@/pages/admin/education/students/StudentFormPage";

import TeachersPage from "@/pages/admin/education/teachers/TeachersPage";
import TeacherProfilePage from "@/pages/admin/education/teachers/TeacherProfilePage";
import TeacherFormPage from "@/pages/admin/education/teachers/TeacherFormPage";

import GuardiansPage from "@/pages/admin/education/guardians/GuardiansPage";
import GuardianProfilePage from "@/pages/admin/education/guardians/GuardianProfilePage";
import GuardianFormPage from "@/pages/admin/education/guardians/GuardianFormPage";

import ClassesPage from "@/pages/admin/education/classes/ClassesPage";
import ClassProfilePage from "@/pages/admin/education/classes/ClassProfilePage";
import ClassFormPage from "@/pages/admin/education/classes/ClassFormPage";

import ClassArmsPage from "@/pages/admin/education/class-arms/ClassArmsPage";
import ClassArmProfilePage from "@/pages/admin/education/class-arms/ClassArmProfilePage";
import ClassArmFormPage from "@/pages/admin/education/class-arms/ClassArmFormPage";

import SubjectsPage from "@/pages/admin/education/subjects/SubjectsPage";
import SubjectProfilePage from "@/pages/admin/education/subjects/SubjectProfilePage";
import SubjectFormPage from "@/pages/admin/education/subjects/SubjectFormPage";

import TopicsPage from "@/pages/admin/education/topics/TopicsPage";
import TopicProfilePage from "@/pages/admin/education/topics/TopicProfilePage";
import TopicFormPage from "@/pages/admin/education/topics/TopicFormPage";

import ArticlesPage from "@/pages/admin/education/articles/ArticlesPage";
import ArticleProfilePage from "@/pages/admin/education/articles/ArticleProfilePage";
import ArticleFormPage from "@/pages/admin/education/articles/ArticleFormPage";

import VideosPage from "@/pages/admin/education/videos/VideosPage";
import VideoProfilePage from "@/pages/admin/education/videos/VideoProfilePage";
import VideoFormPage from "@/pages/admin/education/videos/VideoFormPage";

import QuizzesPage from "@/pages/admin/education/quizzes/QuizzesPage";
import QuizProfilePage from "@/pages/admin/education/quizzes/QuizProfilePage";
import QuizFormPage from "@/pages/admin/education/quizzes/QuizFormPage";

import ClassroomsPage from "@/pages/admin/education/classrooms/ClassroomsPage";
import ClassroomProfilePage from "@/pages/admin/education/classrooms/ClassroomProfilePage";
import ClassroomFormPage from "@/pages/admin/education/classrooms/ClassroomFormPage";

import FeeCategoryPage from "@/pages/admin/education/fee-category/FeeCategoryPage";
import FeeCategoryProfilePage from "@/pages/admin/education/fee-category/FeeCategoryProfilePage";
import FeeCategoryFormPage from "@/pages/admin/education/fee-category/FeeCategoryFormPage";

import FeeStructurePage from "@/pages/admin/education/fee-structure/FeeStructurePage";
import FeeStructureProfilePage from "@/pages/admin/education/fee-structure/FeeStructureProfilePage";
import FeeStructureFormPage from "@/pages/admin/education/fee-structure/FeeStructureFormPage";

import FeeSchedulePage from "@/pages/admin/education/fee-schedule/FeeSchedulePage";
import FeeScheduleProfilePage from "@/pages/admin/education/fee-schedule/FeeScheduleProfilePage";
import FeeScheduleFormPage from "@/pages/admin/education/fee-schedule/FeeScheduleFormPage";

import StudentApplicantsPage from "@/pages/admin/education/student-applicant/StudentApplicantsPage";
import StudentApplicantProfilePage from "@/pages/admin/education/student-applicant/StudentApplicantProfilePage";
import StudentApplicantFormPage from "@/pages/admin/education/student-applicant/StudentApplicantFormPage";

import StudentAdmissionsPage from "@/pages/admin/education/student-admission/StudentAdmissionsPage";
import StudentAdmissionProfilePage from "@/pages/admin/education/student-admission/StudentAdmissionProfilePage";
import StudentAdmissionFormPage from "@/pages/admin/education/student-admission/StudentAdmissionFormPage";

import AcademicTermsPage from "@/pages/admin/education/academic-term/AcademicTermsPage";
import AcademicTermProfilePage from "@/pages/admin/education/academic-term/AcademicTermProfilePage";
import AcademicTermFormPage from "@/pages/admin/education/academic-term/AcademicTermFormPage";

import AssessmentGroupsPage from "@/pages/admin/education/assessment-group/AssessmentGroupsPage";
import AssessmentGroupProfilePage from "@/pages/admin/education/assessment-group/AssessmentGroupProfilePage";
import AssessmentGroupFormPage from "@/pages/admin/education/assessment-group/AssessmentGroupFormPage";

import AssessmentPlansPage from "@/pages/admin/education/assessment-plan/AssessmentPlansPage";
import AssessmentPlanProfilePage from "@/pages/admin/education/assessment-plan/AssessmentPlanProfilePage";
import AssessmentPlanFormPage from "@/pages/admin/education/assessment-plan/AssessmentPlanFormPage";

import AssessmentResultsPage from "@/pages/admin/education/assessment-result/AssessmentResultsPage";
import AssessmentResultProfilePage from "@/pages/admin/education/assessment-result/AssessmentResultProfilePage";
import AssessmentResultFormPage from "@/pages/admin/education/assessment-result/AssessmentResultFormPage";

import AssessmentCriteriaPage from "@/pages/admin/education/assessment-criteria/AssessmentCriteriaPage";
import AssessmentCriteriaProfilePage from "@/pages/admin/education/assessment-criteria/AssessmentCriteriaProfilePage";
import AssessmentCriteriaFormPage from "@/pages/admin/education/assessment-criteria/AssessmentCriteriaFormPage";

import StudentAttendancesPage from "@/pages/admin/education/student-attendance/StudentAttendancesPage";
import StudentAttendanceProfilePage from "@/pages/admin/education/student-attendance/StudentAttendanceProfilePage";
import StudentAttendanceFormPage from "@/pages/admin/education/student-attendance/StudentAttendanceFormPage";

import StudentLeaveApplicationsPage from "@/pages/admin/education/student-leave-application/StudentLeaveApplicationsPage";
import StudentLeaveApplicationProfilePage from "@/pages/admin/education/student-leave-application/StudentLeaveApplicationProfilePage";
import StudentLeaveApplicationFormPage from "@/pages/admin/education/student-leave-application/StudentLeaveApplicationFormPage";

import StudentCategoriesPage from "@/pages/admin/education/student-category/StudentCategoriesPage";
import StudentCategoryProfilePage from "@/pages/admin/education/student-category/StudentCategoryProfilePage";
import StudentCategoryFormPage from "@/pages/admin/education/student-category/StudentCategoryFormPage";

import StudentBatchNamesPage from "@/pages/admin/education/student-batch-name/StudentBatchNamesPage";
import StudentBatchNameProfilePage from "@/pages/admin/education/student-batch-name/StudentBatchNameProfilePage";
import StudentBatchNameFormPage from "@/pages/admin/education/student-batch-name/StudentBatchNameFormPage";

import AcademicYearsPage from "@/pages/admin/education/academic-year/AcademicYearsPage";
import AcademicYearProfilePage from "@/pages/admin/education/academic-year/AcademicYearProfilePage";
import AcademicYearFormPage from "@/pages/admin/education/academic-year/AcademicYearFormPage";

import GradingScalesPage from "@/pages/admin/education/grading-scale/GradingScalesPage";
import GradingScaleProfilePage from "@/pages/admin/education/grading-scale/GradingScaleProfilePage";
import GradingScaleFormPage from "@/pages/admin/education/grading-scale/GradingScaleFormPage";

import EducationSettingsPage from "@/pages/admin/education/education-settings/EducationSettingsPage";
import SchoolSettingsPage from "@/pages/admin/education/school-settings/SchoolSettingsPage";

import StudentLogsPage from "@/pages/admin/education/student-log/StudentLogsPage";
import StudentLogProfilePage from "@/pages/admin/education/student-log/StudentLogProfilePage";
import StudentLogFormPage from "@/pages/admin/education/student-log/StudentLogFormPage";

import ClassEnrollmentsPage from "@/pages/admin/education/class-enrollment/ClassEnrollmentsPage";
import ClassEnrollmentProfilePage from "@/pages/admin/education/class-enrollment/ClassEnrollmentProfilePage";
import ClassEnrollmentFormPage from "@/pages/admin/education/class-enrollment/ClassEnrollmentFormPage";

import SubjectEnrollmentsPage from "@/pages/admin/education/subject-enrollment/SubjectEnrollmentsPage";
import SubjectEnrollmentProfilePage from "@/pages/admin/education/subject-enrollment/SubjectEnrollmentProfilePage";
import SubjectEnrollmentFormPage from "@/pages/admin/education/subject-enrollment/SubjectEnrollmentFormPage";

import FeesPage from "@/pages/admin/education/fees/FeesPage";
import FeesProfilePage from "@/pages/admin/education/fees/FeesProfilePage";
import SalesInvoicesPage from "@/pages/admin/education/sales-invoice/SalesInvoicesPage";
import SalesInvoiceProfilePage from "@/pages/admin/education/sales-invoice/SalesInvoiceProfilePage";
import SalesInvoiceFormPage from "@/pages/admin/education/sales-invoice/SalesInvoiceFormPage";

import StudentFeeCollectionReportPage from "@/pages/admin/education/reports/StudentFeeCollectionReportPage";
import ClassFeeCollectionReportPage from "@/pages/admin/education/reports/ClassFeeCollectionReportPage";

import SubjectSchedulesPage from "@/pages/admin/education/subject-schedule/SubjectSchedulesPage";
import SubjectScheduleProfilePage from "@/pages/admin/education/subject-schedule/SubjectScheduleProfilePage";
import SubjectScheduleFormPage from "@/pages/admin/education/subject-schedule/SubjectScheduleFormPage";

import SubjectSchedulingToolPage from "@/pages/admin/education/subject-scheduling-tool/SubjectSchedulingToolPage";

import SubjectAssessmentReportPage from "@/pages/admin/education/reports/SubjectAssessmentReportPage";
import FinalAssessmentGradesPage from "@/pages/admin/education/reports/FinalAssessmentGradesPage";
import AssessmentPlanStatusPage from "@/pages/admin/education/reports/AssessmentPlanStatusPage";

import StudentReportGenerationToolPage from "@/pages/admin/education/student-report-generation-tool/StudentReportGenerationToolPage";

import StudentGuardianContactsPage from "@/pages/admin/education/reports/StudentGuardianContactsPage";
import StudentMonthlyAttendanceSheetPage from "@/pages/admin/education/reports/StudentMonthlyAttendanceSheetPage";
import AbsentStudentReportPage from "@/pages/admin/education/reports/AbsentStudentReportPage";
import StudentBatchWiseAttendancePage from "@/pages/admin/education/reports/StudentBatchWiseAttendancePage";
import SubjectActivitiesPage from "@/pages/admin/education/subject-activity/SubjectActivitiesPage";
import SubjectActivityProfilePage from "@/pages/admin/education/subject-activity/SubjectActivityProfilePage";
import QuizActivitiesPage from "@/pages/admin/education/quiz-activity/QuizActivitiesPage";
import QuizActivityProfilePage from "@/pages/admin/education/quiz-activity/QuizActivityProfilePage";
import StudentAttendanceToolPage from "@/pages/admin/education/student-attendance-tool/StudentAttendanceToolPage";
import AssessmentResultToolPage from "@/pages/admin/education/assessment-result-tool/AssessmentResultToolPage";
import StudentGroupCreationToolPage from "@/pages/admin/education/student-group-creation-tool/StudentGroupCreationToolPage";
import ClassEnrollmentToolPage from "@/pages/admin/education/class-enrollment-tool/ClassEnrollmentToolPage";
import SchoolTermResultsPage from "@/pages/admin/education/school-term-result-generator/SchoolTermResultsPage";
import SchoolTermResultFormPage from "@/pages/admin/education/school-term-result-generator/SchoolTermResultFormPage";
import SchoolTermResultProfilePage from "@/pages/admin/education/school-term-result-generator/SchoolTermResultProfilePage";
import BulkTermResultGeneratorPage from "@/pages/admin/education/bulk-term-result-generator/BulkTermResultGeneratorPage";
import TermResultRecalculationPage from "@/pages/admin/education/term-result-recalculation/TermResultRecalculationPage";

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

        {/* ─── HR: Company ──────────────────────────────────── */}
        <Route path="company" element={<CompaniesPage />} />
        <Route path="company/new" element={<CompanyFormPage />} />
        <Route path="company/:id/edit" element={<CompanyFormPage />} />
        <Route path="company/:id" element={<CompanyProfilePage />} />
        <Route path="branches" element={<BranchesPage />} />
        <Route path="branches/new" element={<BranchFormPage />} />
        <Route path="branches/:id" element={<BranchProfilePage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="departments/new" element={<DepartmentFormPage />} />
        <Route path="departments/:id/edit" element={<DepartmentFormPage />} />
        <Route path="departments/:id" element={<DepartmentProfilePage />} />
        <Route path="designations" element={<DesignationsPage />} />
        <Route path="designations/new" element={<DesignationFormPage />} />
        <Route path="designations/:id/edit" element={<DesignationFormPage />} />
        <Route path="designations/:id" element={<DesignationProfilePage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="employees/new" element={<EmployeeFormPage />} />
        <Route path="employees/:id/edit" element={<EmployeeFormPage />} />
        <Route path="employees/:id" element={<EmployeeProfilePage />} />
        <Route path="employee-groups" element={<EmployeeGroupsPage />} />
        <Route path="employee-groups/new" element={<EmployeeGroupFormPage />} />
        <Route path="employee-groups/:id/edit" element={<EmployeeGroupFormPage />} />
        <Route path="employee-groups/:id" element={<EmployeeGroupProfilePage />} />
        <Route path="employee-grades" element={<EmployeeGradesPage />} />
        <Route path="employee-grades/new" element={<EmployeeGradeFormPage />} />
        <Route path="employee-grades/:id/edit" element={<EmployeeGradeFormPage />} />
        <Route path="employee-grades/:id" element={<EmployeeGradeProfilePage />} />
        <Route path="leave-applications" element={<LeaveApplicationsPage />} />
        <Route path="leave-applications/new" element={<LeaveApplicationFormPage />} />
        <Route path="leave-applications/:id/edit" element={<LeaveApplicationFormPage />} />
        <Route path="leave-applications/:id" element={<LeaveApplicationProfilePage />} />
        <Route path="compensatory-leave-requests" element={<CompensatoryLeaveRequestsPage />} />
        <Route path="compensatory-leave-requests/new" element={<CompensatoryLeaveRequestFormPage />} />
        <Route path="compensatory-leave-requests/:id/edit" element={<CompensatoryLeaveRequestFormPage />} />
        <Route path="compensatory-leave-requests/:id" element={<CompensatoryLeaveRequestProfilePage />} />
        <Route path="hr-settings" element={<HRSettingsPage />} />
        <Route path="hr-settings/edit" element={<HRSettingsFormPage />} />
        <Route path="daily-work-summary-groups" element={<DailyWorkSummaryGroupsPage />} />
        <Route path="daily-work-summary-groups/new" element={<DailyWorkSummaryGroupFormPage />} />
        <Route path="daily-work-summary-groups/:id/edit" element={<DailyWorkSummaryGroupFormPage />} />
        <Route path="daily-work-summary-groups/:id" element={<DailyWorkSummaryGroupProfilePage />} />
        <Route path="team-updates" element={<TeamUpdatesPage />} />
        <Route path="attendance" element={<AttendancesPage />} />
        <Route path="attendance/new" element={<AttendanceFormPage />} />
        <Route path="attendance/:id/edit" element={<AttendanceFormPage />} />
        <Route path="attendance/:id" element={<AttendanceProfilePage />} />
        <Route path="attendance-requests" element={<AttendanceRequestsPage />} />
        <Route path="attendance-requests/new" element={<AttendanceRequestFormPage />} />
        <Route path="attendance-requests/:id/edit" element={<AttendanceRequestFormPage />} />
        <Route path="attendance-requests/:id" element={<AttendanceRequestProfilePage />} />
        <Route path="employee-checkins" element={<EmployeeCheckinsPage />} />
        <Route path="employee-checkins/new" element={<EmployeeCheckinFormPage />} />
        <Route path="employee-checkins/:id/edit" element={<EmployeeCheckinFormPage />} />
        <Route path="employee-checkins/:id" element={<EmployeeCheckinProfilePage />} />
        <Route path="expense-claims" element={<ExpenseClaimsPage />} />
        <Route path="expense-claims/new" element={<ExpenseClaimFormPage />} />
        <Route path="expense-claims/:id/edit" element={<ExpenseClaimFormPage />} />
        <Route path="expense-claims/:id" element={<ExpenseClaimProfilePage />} />
        <Route path="employee-advances" element={<EmployeeAdvancesPage />} />
        <Route path="employee-advances/new" element={<EmployeeAdvanceFormPage />} />
        <Route path="employee-advances/:id/edit" element={<EmployeeAdvanceFormPage />} />
        <Route path="employee-advances/:id" element={<EmployeeAdvanceProfilePage />} />
        <Route path="travel-requests" element={<TravelRequestsPage />} />
        <Route path="travel-requests/new" element={<TravelRequestFormPage />} />
        <Route path="travel-requests/:id/edit" element={<TravelRequestFormPage />} />
        <Route path="travel-requests/:id" element={<TravelRequestProfilePage />} />

        {/* HR Key Reports */}
        <Route path="monthly-attendance-sheet" element={<MonthlyAttendanceSheetPage />} />
        <Route path="recruitment-analytics" element={<RecruitmentAnalyticsPage />} />
        <Route path="employee-analytics" element={<EmployeeAnalyticsPage />} />
        <Route path="employee-leave-balance" element={<EmployeeLeaveBalancePage />} />
        <Route path="employee-leave-balance-summary" element={<EmployeeLeaveBalanceSummaryPage />} />
        <Route path="employee-advance-summary" element={<EmployeeAdvanceSummaryPage />} />
        <Route path="employee-exits" element={<EmployeeExitsPage />} />

        {/* HR Other Reports */}
        <Route path="employee-information" element={<EmployeeInformationPage />} />
        <Route path="employee-birthday" element={<EmployeeBirthdayPage />} />
        <Route path="employees-working-on-holiday" element={<EmployeesWorkingOnHolidayPage />} />
        <Route path="daily-work-summary-replies" element={<DailyWorkSummaryRepliesPage />} />

        <Route path="purchase-invoices" element={<PurchaseInvoicesPage />} />
        <Route path="purchase-invoices/new" element={<PurchaseInvoiceFormPage />} />
        <Route path="purchase-invoices/:id/edit" element={<PurchaseInvoiceFormPage />} />
        <Route path="purchase-invoices/:id" element={<PurchaseInvoiceProfilePage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="suppliers/new" element={<SupplierFormPage />} />
        <Route path="suppliers/:id/edit" element={<SupplierFormPage />} />
        <Route path="suppliers/:id" element={<SupplierProfilePage />} />
        <Route path="payment-entries" element={<PaymentEntriesPage />} />
        <Route path="payment-entries/new" element={<PaymentEntryFormPage />} />
        <Route path="payment-entries/:id/edit" element={<PaymentEntryFormPage />} />
        <Route path="payment-entries/:id" element={<PaymentEntryProfilePage />} />
        <Route path="journal-entries" element={<JournalEntriesPage />} />
        <Route path="journal-entries/new" element={<JournalEntryFormPage />} />
        <Route path="journal-entries/:id/edit" element={<JournalEntryFormPage />} />
        <Route path="journal-entries/:id" element={<JournalEntryProfilePage />} />
        <Route path="payment-reconciliation" element={<PaymentReconciliationPage />} />
        <Route path="accounts-payable" element={<AccountsPayablePage />} />
        <Route path="accounts-payable-summary" element={<AccountsPayableSummaryPage />} />
        <Route path="purchase-register" element={<PurchaseRegisterPage />} />
        <Route path="item-wise-purchase-register" element={<ItemWisePurchaseRegisterPage />} />
        <Route path="purchase-order-analysis" element={<PurchaseOrderAnalysisPage />} />
        <Route path="received-items-to-be-billed" element={<ReceivedItemsToBeBilledPage />} />
        <Route path="supplier-ledger-summary" element={<SupplierLedgerSummaryPage />} />

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
        <Route path="sales-invoices" element={<SalesInvoicesPage />} />
        <Route path="sales-invoices/new" element={<SalesInvoiceFormPage />} />
        <Route path="sales-invoices/:id/edit" element={<SalesInvoiceFormPage />} />
        <Route path="sales-invoices/:id" element={<SalesInvoiceProfilePage />} />
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
        <Route path="student-group-creation" element={<StudentGroupCreationToolPage />} />
        <Route path="class-enrollment-tool" element={<ClassEnrollmentToolPage />} />
        <Route path="subject-scheduling-tool-page" element={<SubjectSchedulingToolPage />} />
        <Route path="school-term-result-generator" element={<SchoolTermResultsPage />} />
        <Route path="school-term-result-generator/new" element={<SchoolTermResultFormPage />} />
        <Route path="school-term-result-generator/:id/edit" element={<SchoolTermResultFormPage />} />
        <Route path="school-term-result-generator/:id" element={<SchoolTermResultProfilePage />} />
        <Route path="bulk-term-result-generator" element={<BulkTermResultGeneratorPage />} />
        <Route path="term-result-recalculation" element={<TermResultRecalculationPage />} />
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
