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
import DailyWorkSummariesPage from "@/pages/admin/hr/employee-lifecycle/daily-work-summary/DailyWorkSummariesPage";
import DailyWorkSummaryProfilePage from "@/pages/admin/hr/employee-lifecycle/daily-work-summary/DailyWorkSummaryProfilePage";
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
import GrievanceTypesPage from "@/pages/admin/hr/employee-lifecycle/grievance-type/GrievanceTypesPage";
import GrievanceTypeFormPage from "@/pages/admin/hr/employee-lifecycle/grievance-type/GrievanceTypeFormPage";
import GrievanceTypeProfilePage from "@/pages/admin/hr/employee-lifecycle/grievance-type/GrievanceTypeProfilePage";
import TrainingProgramsPage from "@/pages/admin/hr/employee-lifecycle/training-program/TrainingProgramsPage";
import TrainingProgramFormPage from "@/pages/admin/hr/employee-lifecycle/training-program/TrainingProgramFormPage";
import TrainingProgramProfilePage from "@/pages/admin/hr/employee-lifecycle/training-program/TrainingProgramProfilePage";
import EmployeeOnboardingTemplatesPage from "@/pages/admin/hr/employee-lifecycle/employee-onboarding-template/EmployeeOnboardingTemplatesPage";
import EmployeeOnboardingTemplateFormPage from "@/pages/admin/hr/employee-lifecycle/employee-onboarding-template/EmployeeOnboardingTemplateFormPage";
import EmployeeOnboardingTemplateProfilePage from "@/pages/admin/hr/employee-lifecycle/employee-onboarding-template/EmployeeOnboardingTemplateProfilePage";
import EmployeeOnboardingsPage from "@/pages/admin/hr/employee-lifecycle/employee-onboarding/EmployeeOnboardingsPage";
import EmployeeOnboardingFormPage from "@/pages/admin/hr/employee-lifecycle/employee-onboarding/EmployeeOnboardingFormPage";
import EmployeeOnboardingProfilePage from "@/pages/admin/hr/employee-lifecycle/employee-onboarding/EmployeeOnboardingProfilePage";
import EmployeeSkillMapsPage from "@/pages/admin/hr/employee-lifecycle/employee-skill-map/EmployeeSkillMapsPage";
import EmployeeSkillMapFormPage from "@/pages/admin/hr/employee-lifecycle/employee-skill-map/EmployeeSkillMapFormPage";
import EmployeeSkillMapProfilePage from "@/pages/admin/hr/employee-lifecycle/employee-skill-map/EmployeeSkillMapProfilePage";
import EmployeeGrievancesPage from "@/pages/admin/hr/employee-lifecycle/employee-grievance/EmployeeGrievancesPage";
import EmployeeGrievanceFormPage from "@/pages/admin/hr/employee-lifecycle/employee-grievance/EmployeeGrievanceFormPage";
import EmployeeGrievanceProfilePage from "@/pages/admin/hr/employee-lifecycle/employee-grievance/EmployeeGrievanceProfilePage";
import TrainingEventsPage from "@/pages/admin/hr/employee-lifecycle/training-event/TrainingEventsPage";
import TrainingEventFormPage from "@/pages/admin/hr/employee-lifecycle/training-event/TrainingEventFormPage";
import TrainingEventProfilePage from "@/pages/admin/hr/employee-lifecycle/training-event/TrainingEventProfilePage";
import TrainingFeedbackPage from "@/pages/admin/hr/employee-lifecycle/training-feedback/TrainingFeedbackPage";
import TrainingFeedbackFormPage from "@/pages/admin/hr/employee-lifecycle/training-feedback/TrainingFeedbackFormPage";
import TrainingFeedbackProfilePage from "@/pages/admin/hr/employee-lifecycle/training-feedback/TrainingFeedbackProfilePage";
import TrainingResultsPage from "@/pages/admin/hr/employee-lifecycle/training-result/TrainingResultsPage";
import TrainingResultFormPage from "@/pages/admin/hr/employee-lifecycle/training-result/TrainingResultFormPage";
import TrainingResultProfilePage from "@/pages/admin/hr/employee-lifecycle/training-result/TrainingResultProfilePage";
import StaffingPlansPage from "@/pages/admin/hr/recruitment/staffing-plan/StaffingPlansPage";
import StaffingPlanFormPage from "@/pages/admin/hr/recruitment/staffing-plan/StaffingPlanFormPage";
import StaffingPlanProfilePage from "@/pages/admin/hr/recruitment/staffing-plan/StaffingPlanProfilePage";
import JobRequisitionsPage from "@/pages/admin/hr/recruitment/job-requisition/JobRequisitionsPage";
import JobRequisitionFormPage from "@/pages/admin/hr/recruitment/job-requisition/JobRequisitionFormPage";
import JobRequisitionProfilePage from "@/pages/admin/hr/recruitment/job-requisition/JobRequisitionProfilePage";
import JobOpeningsPage from "@/pages/admin/hr/recruitment/job-opening/JobOpeningsPage";
import JobOpeningFormPage from "@/pages/admin/hr/recruitment/job-opening/JobOpeningFormPage";
import JobOpeningProfilePage from "@/pages/admin/hr/recruitment/job-opening/JobOpeningProfilePage";
import JobApplicantsPage from "@/pages/admin/hr/recruitment/job-applicant/JobApplicantsPage";
import JobApplicantFormPage from "@/pages/admin/hr/recruitment/job-applicant/JobApplicantFormPage";
import JobApplicantProfilePage from "@/pages/admin/hr/recruitment/job-applicant/JobApplicantProfilePage";
import JobOffersPage from "@/pages/admin/hr/recruitment/job-offer/JobOffersPage";
import JobOfferFormPage from "@/pages/admin/hr/recruitment/job-offer/JobOfferFormPage";
import JobOfferProfilePage from "@/pages/admin/hr/recruitment/job-offer/JobOfferProfilePage";
import EmployeeReferralsPage from "@/pages/admin/hr/recruitment/employee-referral/EmployeeReferralsPage";
import EmployeeReferralFormPage from "@/pages/admin/hr/recruitment/employee-referral/EmployeeReferralFormPage";
import EmployeeReferralProfilePage from "@/pages/admin/hr/recruitment/employee-referral/EmployeeReferralProfilePage";
import InterviewTypesPage from "@/pages/admin/hr/recruitment/interview-type/InterviewTypesPage";
import InterviewTypeFormPage from "@/pages/admin/hr/recruitment/interview-type/InterviewTypeFormPage";
import InterviewTypeProfilePage from "@/pages/admin/hr/recruitment/interview-type/InterviewTypeProfilePage";
import InterviewRoundsPage from "@/pages/admin/hr/recruitment/interview-round/InterviewRoundsPage";
import InterviewRoundFormPage from "@/pages/admin/hr/recruitment/interview-round/InterviewRoundFormPage";
import InterviewRoundProfilePage from "@/pages/admin/hr/recruitment/interview-round/InterviewRoundProfilePage";
import InterviewsPage from "@/pages/admin/hr/recruitment/interview/InterviewsPage";
import InterviewFormPage from "@/pages/admin/hr/recruitment/interview/InterviewFormPage";
import InterviewProfilePage from "@/pages/admin/hr/recruitment/interview/InterviewProfilePage";
import InterviewFeedbackPage from "@/pages/admin/hr/recruitment/interview-feedback/InterviewFeedbackPage";
import InterviewFeedbackFormPage from "@/pages/admin/hr/recruitment/interview-feedback/InterviewFeedbackFormPage";
import InterviewFeedbackProfilePage from "@/pages/admin/hr/recruitment/interview-feedback/InterviewFeedbackProfilePage";
import AppointmentLetterTemplatesPage from "@/pages/admin/hr/recruitment/appointment-letter-template/AppointmentLetterTemplatesPage";
import AppointmentLetterTemplateFormPage from "@/pages/admin/hr/recruitment/appointment-letter-template/AppointmentLetterTemplateFormPage";
import AppointmentLetterTemplateProfilePage from "@/pages/admin/hr/recruitment/appointment-letter-template/AppointmentLetterTemplateProfilePage";
import AppointmentLettersPage from "@/pages/admin/hr/recruitment/appointment-letter/AppointmentLettersPage";
import AppointmentLetterFormPage from "@/pages/admin/hr/recruitment/appointment-letter/AppointmentLetterFormPage";
import AppointmentLetterProfilePage from "@/pages/admin/hr/recruitment/appointment-letter/AppointmentLetterProfilePage";

// HR Key Reports
import MonthlyAttendanceSheetPage from "@/pages/admin/hr/reports/MonthlyAttendanceSheetPage";
import RecruitmentAnalyticsPage from "@/pages/admin/hr/reports/RecruitmentAnalyticsPage";
import EmployeeAnalyticsPage from "@/pages/admin/hr/reports/EmployeeAnalyticsPage";
import EmployeeLeaveBalancePage from "@/pages/admin/hr/reports/EmployeeLeaveBalancePage";
import EmployeeLeaveBalanceSummaryPage from "@/pages/admin/hr/reports/EmployeeLeaveBalanceSummaryPage";
import EmployeeAdvanceSummaryPage from "@/pages/admin/hr/reports/EmployeeAdvanceSummaryPage";
import UnpaidExpenseClaimPage from "@/pages/admin/hr/reports/UnpaidExpenseClaimPage";
import VehicleExpensesPage from "@/pages/admin/hr/reports/VehicleExpensesPage";
import AccountingDocumentList from "@/pages/admin/accounting/components/AccountingDocumentList";
import AccountingDocumentFormPage from "@/pages/admin/accounting/components/AccountingDocumentFormPage";
import AccountingDocumentProfile from "@/pages/admin/accounting/components/AccountingDocumentProfile";
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
import CustomersPage from "@/pages/admin/accounting/customer/CustomersPage";
import CustomerProfilePage from "@/pages/admin/accounting/customer/CustomerProfilePage";
import CustomerFormPage from "@/pages/admin/accounting/customer/CustomerFormPage";
import DunningPage from "@/pages/admin/accounting/dunning/DunningPage";
import DunningProfilePage from "@/pages/admin/accounting/dunning/DunningProfilePage";
import DunningFormPage from "@/pages/admin/accounting/dunning/DunningFormPage";
import DunningTypesPage from "@/pages/admin/accounting/dunning-type/DunningTypesPage";
import DunningTypeProfilePage from "@/pages/admin/accounting/dunning-type/DunningTypeProfilePage";
import DunningTypeFormPage from "@/pages/admin/accounting/dunning-type/DunningTypeFormPage";
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
import AccountsReceivablePage from "@/pages/admin/accounting/reports/AccountsReceivablePage";
import AccountsReceivableSummaryPage from "@/pages/admin/accounting/reports/AccountsReceivableSummaryPage";
import SalesRegisterPage from "@/pages/admin/accounting/reports/SalesRegisterPage";
import ItemWiseSalesRegisterPage from "@/pages/admin/accounting/reports/ItemWiseSalesRegisterPage";
import DeliveredItemsToBeBilledPage from "@/pages/admin/accounting/reports/DeliveredItemsToBeBilledPage";
import GeneralLedgerPage from "@/pages/admin/accounting/reports/GeneralLedgerPage";
import CustomerLedgerSummaryPage from "@/pages/admin/accounting/reports/CustomerLedgerSummaryPage";
import TrialBalancePage from "@/pages/admin/accounting/reports/TrialBalancePage";
import ProfitAndLossStatementPage from "@/pages/admin/accounting/reports/ProfitAndLossStatementPage";
import BalanceSheetPage from "@/pages/admin/accounting/reports/BalanceSheetPage";
import CashFlowPage from "@/pages/admin/accounting/reports/CashFlowPage";
import ConsolidatedFinancialStatementPage from "@/pages/admin/accounting/reports/ConsolidatedFinancialStatementPage";
import GrossProfitPage from "@/pages/admin/accounting/reports/GrossProfitPage";
import ProfitabilityAnalysisPage from "@/pages/admin/accounting/reports/ProfitabilityAnalysisPage";
import SalesInvoiceTrendsPage from "@/pages/admin/accounting/reports/SalesInvoiceTrendsPage";
import PurchaseInvoiceTrendsPage from "@/pages/admin/accounting/reports/PurchaseInvoiceTrendsPage";
import TrialBalanceForPartyPage from "@/pages/admin/accounting/reports/TrialBalanceForPartyPage";
import PaymentPeriodBasedOnInvoiceDatePage from "@/pages/admin/accounting/reports/PaymentPeriodBasedOnInvoiceDatePage";
import SalesPartnersCommissionPage from "@/pages/admin/accounting/reports/SalesPartnersCommissionPage";
import CustomerCreditBalancePage from "@/pages/admin/accounting/reports/CustomerCreditBalancePage";
import SalesPaymentSummaryPage from "@/pages/admin/accounting/reports/SalesPaymentSummaryPage";
import AddressAndContactsPage from "@/pages/admin/accounting/reports/AddressAndContactsPage";

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
        <Route path="daily-work-summaries" element={<DailyWorkSummariesPage />} />
        <Route path="daily-work-summaries/:id" element={<DailyWorkSummaryProfilePage />} />
        <Route path="team-updates" element={<TeamUpdatesPage />} />
        <Route path="grievance-type" element={<GrievanceTypesPage />} />
        <Route path="grievance-type/new" element={<GrievanceTypeFormPage />} />
        <Route path="grievance-type/:id/edit" element={<GrievanceTypeFormPage />} />
        <Route path="grievance-type/:id" element={<GrievanceTypeProfilePage />} />
        <Route path="training-program" element={<TrainingProgramsPage />} />
        <Route path="training-program/new" element={<TrainingProgramFormPage />} />
        <Route path="training-program/:id/edit" element={<TrainingProgramFormPage />} />
        <Route path="training-program/:id" element={<TrainingProgramProfilePage />} />
        <Route path="employee-onboarding-template" element={<EmployeeOnboardingTemplatesPage />} />
        <Route path="employee-onboarding-template/new" element={<EmployeeOnboardingTemplateFormPage />} />
        <Route path="employee-onboarding-template/:id/edit" element={<EmployeeOnboardingTemplateFormPage />} />
        <Route path="employee-onboarding-template/:id" element={<EmployeeOnboardingTemplateProfilePage />} />
        <Route path="employee-onboarding" element={<EmployeeOnboardingsPage />} />
        <Route path="employee-onboarding/new" element={<EmployeeOnboardingFormPage />} />
        <Route path="employee-onboarding/:id/edit" element={<EmployeeOnboardingFormPage />} />
        <Route path="employee-onboarding/:id" element={<EmployeeOnboardingProfilePage />} />
        <Route path="employee-skill-map" element={<EmployeeSkillMapsPage />} />
        <Route path="employee-skill-map/new" element={<EmployeeSkillMapFormPage />} />
        <Route path="employee-skill-map/:id/edit" element={<EmployeeSkillMapFormPage />} />
        <Route path="employee-skill-map/:id" element={<EmployeeSkillMapProfilePage />} />
        <Route path="employee-grievance" element={<EmployeeGrievancesPage />} />
        <Route path="employee-grievance/new" element={<EmployeeGrievanceFormPage />} />
        <Route path="employee-grievance/:id/edit" element={<EmployeeGrievanceFormPage />} />
        <Route path="employee-grievance/:id" element={<EmployeeGrievanceProfilePage />} />
        <Route path="training-event" element={<TrainingEventsPage />} />
        <Route path="training-event/new" element={<TrainingEventFormPage />} />
        <Route path="training-event/:id/edit" element={<TrainingEventFormPage />} />
        <Route path="training-event/:id" element={<TrainingEventProfilePage />} />
        <Route path="training-feedback" element={<TrainingFeedbackPage />} />
        <Route path="training-feedback/new" element={<TrainingFeedbackFormPage />} />
        <Route path="training-feedback/:id/edit" element={<TrainingFeedbackFormPage />} />
        <Route path="training-feedback/:id" element={<TrainingFeedbackProfilePage />} />
        <Route path="training-result" element={<TrainingResultsPage />} />
        <Route path="training-result/new" element={<TrainingResultFormPage />} />
        <Route path="training-result/:id/edit" element={<TrainingResultFormPage />} />
        <Route path="training-result/:id" element={<TrainingResultProfilePage />} />
        <Route path="staffing-plan" element={<StaffingPlansPage />} />
        <Route path="staffing-plan/new" element={<StaffingPlanFormPage />} />
        <Route path="staffing-plan/:id/edit" element={<StaffingPlanFormPage />} />
        <Route path="staffing-plan/:id" element={<StaffingPlanProfilePage />} />
        <Route path="job-requisition" element={<JobRequisitionsPage />} />
        <Route path="job-requisition/new" element={<JobRequisitionFormPage />} />
        <Route path="job-requisition/:id/edit" element={<JobRequisitionFormPage />} />
        <Route path="job-requisition/:id" element={<JobRequisitionProfilePage />} />
        <Route path="job-opening" element={<JobOpeningsPage />} />
        <Route path="job-opening/new" element={<JobOpeningFormPage />} />
        <Route path="job-opening/:id/edit" element={<JobOpeningFormPage />} />
        <Route path="job-opening/:id" element={<JobOpeningProfilePage />} />
        <Route path="job-applicants" element={<JobApplicantsPage />} />
        <Route path="job-applicants/new" element={<JobApplicantFormPage />} />
        <Route path="job-applicants/:id/edit" element={<JobApplicantFormPage />} />
        <Route path="job-applicants/:id" element={<JobApplicantProfilePage />} />
        <Route path="job-offers" element={<JobOffersPage />} />
        <Route path="job-offers/new" element={<JobOfferFormPage />} />
        <Route path="job-offers/:id/edit" element={<JobOfferFormPage />} />
        <Route path="job-offers/:id" element={<JobOfferProfilePage />} />
        <Route path="employee-referrals" element={<EmployeeReferralsPage />} />
        <Route path="employee-referrals/new" element={<EmployeeReferralFormPage />} />
        <Route path="employee-referrals/:id/edit" element={<EmployeeReferralFormPage />} />
        <Route path="employee-referrals/:id" element={<EmployeeReferralProfilePage />} />
        <Route path="interview-types" element={<InterviewTypesPage />} />
        <Route path="interview-types/new" element={<InterviewTypeFormPage />} />
        <Route path="interview-types/:id/edit" element={<InterviewTypeFormPage />} />
        <Route path="interview-types/:id" element={<InterviewTypeProfilePage />} />
        <Route path="interview-rounds" element={<InterviewRoundsPage />} />
        <Route path="interview-rounds/new" element={<InterviewRoundFormPage />} />
        <Route path="interview-rounds/:id/edit" element={<InterviewRoundFormPage />} />
        <Route path="interview-rounds/:id" element={<InterviewRoundProfilePage />} />
        <Route path="interviews" element={<InterviewsPage />} />
        <Route path="interviews/new" element={<InterviewFormPage />} />
        <Route path="interviews/:id/edit" element={<InterviewFormPage />} />
        <Route path="interviews/:id" element={<InterviewProfilePage />} />
        <Route path="interview-feedback" element={<InterviewFeedbackPage />} />
        <Route path="interview-feedback/new" element={<InterviewFeedbackFormPage />} />
        <Route path="interview-feedback/:id/edit" element={<InterviewFeedbackFormPage />} />
        <Route path="interview-feedback/:id" element={<InterviewFeedbackProfilePage />} />
        <Route path="appointment-letter-templates" element={<AppointmentLetterTemplatesPage />} />
        <Route path="appointment-letter-templates/new" element={<AppointmentLetterTemplateFormPage />} />
        <Route path="appointment-letter-templates/:id/edit" element={<AppointmentLetterTemplateFormPage />} />
        <Route path="appointment-letter-templates/:id" element={<AppointmentLetterTemplateProfilePage />} />
        <Route path="appointment-letters" element={<AppointmentLettersPage />} />
        <Route path="appointment-letters/new" element={<AppointmentLetterFormPage />} />
        <Route path="appointment-letters/:id/edit" element={<AppointmentLetterFormPage />} />
        <Route path="appointment-letters/:id" element={<AppointmentLetterProfilePage />} />
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
        <Route path="unpaid-expense-claim" element={<UnpaidExpenseClaimPage />} />
        <Route path="vehicle-expenses" element={<VehicleExpensesPage />} />
        <Route path="expense-claim-types" element={<AccountingDocumentList doctype="Expense Claim Type" base="expense-claim-types" title="Expense Claim Types" />} />
        <Route path="expense-claim-types/new" element={<AccountingDocumentFormPage doctype="Expense Claim Type" base="expense-claim-types" />} />
        <Route path="expense-claim-types/:id/edit" element={<AccountingDocumentFormPage doctype="Expense Claim Type" base="expense-claim-types" />} />
        <Route path="expense-claim-types/:id" element={<AccountingDocumentProfile doctype="Expense Claim Type" base="expense-claim-types" />} />
        <Route path="purposes-of-travel" element={<AccountingDocumentList doctype="Purpose of Travel" base="purposes-of-travel" title="Purposes of Travel" />} />
        <Route path="purposes-of-travel/new" element={<AccountingDocumentFormPage doctype="Purpose of Travel" base="purposes-of-travel" />} />
        <Route path="purposes-of-travel/:id/edit" element={<AccountingDocumentFormPage doctype="Purpose of Travel" base="purposes-of-travel" />} />
        <Route path="purposes-of-travel/:id" element={<AccountingDocumentProfile doctype="Purpose of Travel" base="purposes-of-travel" />} />
        <Route path="additional-salaries" element={<AccountingDocumentList doctype="Additional Salary" base="additional-salaries" title="Additional Salaries" />} />
        <Route path="additional-salaries/new" element={<AccountingDocumentFormPage doctype="Additional Salary" base="additional-salaries" />} />
        <Route path="additional-salaries/:id/edit" element={<AccountingDocumentFormPage doctype="Additional Salary" base="additional-salaries" />} />
        <Route path="additional-salaries/:id" element={<AccountingDocumentProfile doctype="Additional Salary" base="additional-salaries" />} />
        <Route path="vehicles" element={<AccountingDocumentList doctype="Vehicle" base="vehicles" title="Vehicles" />} />
        <Route path="vehicles/new" element={<AccountingDocumentFormPage doctype="Vehicle" base="vehicles" />} />
        <Route path="vehicles/:id/edit" element={<AccountingDocumentFormPage doctype="Vehicle" base="vehicles" />} />
        <Route path="vehicles/:id" element={<AccountingDocumentProfile doctype="Vehicle" base="vehicles" />} />
        <Route path="drivers" element={<AccountingDocumentList doctype="Driver" base="drivers" title="Drivers" />} />
        <Route path="drivers/new" element={<AccountingDocumentFormPage doctype="Driver" base="drivers" />} />
        <Route path="drivers/:id/edit" element={<AccountingDocumentFormPage doctype="Driver" base="drivers" />} />
        <Route path="drivers/:id" element={<AccountingDocumentProfile doctype="Driver" base="drivers" />} />
        <Route path="vehicle-service-items" element={<AccountingDocumentList doctype="Vehicle Service Item" base="vehicle-service-items" title="Vehicle Service Items" />} />
        <Route path="vehicle-service-items/new" element={<AccountingDocumentFormPage doctype="Vehicle Service Item" base="vehicle-service-items" />} />
        <Route path="vehicle-service-items/:id/edit" element={<AccountingDocumentFormPage doctype="Vehicle Service Item" base="vehicle-service-items" />} />
        <Route path="vehicle-service-items/:id" element={<AccountingDocumentProfile doctype="Vehicle Service Item" base="vehicle-service-items" />} />
        <Route path="vehicle-logs" element={<AccountingDocumentList doctype="Vehicle Log" base="vehicle-logs" title="Vehicle Logs" />} />
        <Route path="vehicle-logs/new" element={<AccountingDocumentFormPage doctype="Vehicle Log" base="vehicle-logs" />} />
        <Route path="vehicle-logs/:id/edit" element={<AccountingDocumentFormPage doctype="Vehicle Log" base="vehicle-logs" />} />
        <Route path="vehicle-logs/:id" element={<AccountingDocumentProfile doctype="Vehicle Log" base="vehicle-logs" />} />
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
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/new" element={<CustomerFormPage />} />
        <Route path="customers/:id/edit" element={<CustomerFormPage />} />
        <Route path="customers/:id" element={<CustomerProfilePage />} />
        <Route path="dunning" element={<DunningPage />} />
        <Route path="dunning/new" element={<DunningFormPage />} />
        <Route path="dunning/:id/edit" element={<DunningFormPage />} />
        <Route path="dunning/:id" element={<DunningProfilePage />} />
        <Route path="dunning-types" element={<DunningTypesPage />} />
        <Route path="dunning-types/new" element={<DunningTypeFormPage />} />
        <Route path="dunning-types/:id/edit" element={<DunningTypeFormPage />} />
        <Route path="dunning-types/:id" element={<DunningTypeProfilePage />} />
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
        <Route path="accounts-receivable" element={<AccountsReceivablePage />} />
        <Route path="accounts-receivable-summary" element={<AccountsReceivableSummaryPage />} />
        <Route path="sales-register" element={<SalesRegisterPage />} />
        <Route path="item-wise-sales-register" element={<ItemWiseSalesRegisterPage />} />
        <Route path="delivered-items-to-be-billed" element={<DeliveredItemsToBeBilledPage />} />
        <Route path="general-ledger" element={<GeneralLedgerPage />} />
        <Route path="customer-ledger-summary" element={<CustomerLedgerSummaryPage />} />
        <Route path="trial-balance" element={<TrialBalancePage />} />
        <Route path="profit-and-loss" element={<ProfitAndLossStatementPage />} />
        <Route path="balance-sheet" element={<BalanceSheetPage />} />
        <Route path="cash-flow" element={<CashFlowPage />} />
        <Route path="consolidated-financial-statement" element={<ConsolidatedFinancialStatementPage />} />
        <Route path="gross-profit" element={<GrossProfitPage />} />
        <Route path="profitability-analysis" element={<ProfitabilityAnalysisPage />} />
        <Route path="sales-invoice-trends" element={<SalesInvoiceTrendsPage />} />
        <Route path="purchase-invoice-trends" element={<PurchaseInvoiceTrendsPage />} />
        <Route path="trial-balance-for-party" element={<TrialBalanceForPartyPage />} />
        <Route path="payment-period-based-on-invoice-date" element={<PaymentPeriodBasedOnInvoiceDatePage />} />
        <Route path="sales-partners-commission" element={<SalesPartnersCommissionPage />} />
        <Route path="customer-credit-balance" element={<CustomerCreditBalancePage />} />
        <Route path="sales-payment-summary" element={<SalesPaymentSummaryPage />} />
        <Route path="address-and-contacts" element={<AddressAndContactsPage />} />

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
