import {
  LayoutDashboard, GraduationCap, Users2, CalendarCheck, ClipboardList,
  Award, CalendarClock, Contact, UsersRound, Wallet, Briefcase,
  BarChart3, Settings,
} from 'lucide-react';

export const chartTokens = {
  light: {
    grid: '#ececf1', axis: '#9097a3', brand: '#2563eb', cyan: '#06b6d4',
    purple: '#8b5cf6', green: '#10b981', amber: '#f59e0b', red: '#ef4444',
    tipBg: '#fff', tipBd: '#e1e3e9', tipInk: '#0b0d14', area: '#2563eb',
  },
  dark: {
    grid: '#222633', axis: '#717a89', brand: '#3b82f6', cyan: '#22d3ee',
    purple: '#a78bfa', green: '#34d399', amber: '#fbbf24', red: '#f87171',
    tipBg: '#13161e', tipBd: '#282d3b', tipInk: '#f1f3f7', area: '#3b82f6',
  },
};

// The portal currently ships one staff role (Teachers and School Administrators
// share the same navigation). Role-based visibility can be reintroduced later
// once the Frappe backend supplies per-user permissions.
export const roleMeta = {
  STAFF: { label: 'School Staff', short: 'ST', scope: 'School', color: '#2563eb' },
};

export function isMemberRole() { return false; }
export function isAdminRole() { return true; }

export const navigation = {
  STAFF: [
    { g: 'Overview', items: [['dashboard', 'Dashboard', LayoutDashboard]] },
    {
      g: 'Academics',
      items: [
        ['students', 'Students', GraduationCap],
        ['class-arms', 'Class Arms', Users2],
        ['attendance', 'Attendance', CalendarCheck],
        ['assessments', 'Assessments', ClipboardList],
        ['results', 'School Term Results', Award],
        ['schedule', 'Course Schedule', CalendarClock],
      ],
    },
    {
      g: 'People',
      items: [
        ['teachers', 'Teachers', Contact],
        ['guardians', 'Guardians', UsersRound],
      ],
    },
    {
      g: 'Operations',
      items: [
        ['fees', 'Fees', Wallet],
        ['hr', 'HR', Briefcase],
        ['reports', 'Reports', BarChart3],
      ],
    },
    { g: 'Workspace', items: [['settings', 'Settings', Settings]] },
  ],
};

export function getNavigation() {
  return navigation.STAFF;
}

export function pathFor(key) {
  const map = {
    dashboard: '/dashboard',
    students: '/dashboard/students',
    'class-arms': '/dashboard/class-arms',
    attendance: '/dashboard/attendance',
    assessments: '/dashboard/assessments',
    results: '/dashboard/results',
    schedule: '/dashboard/schedule',
    teachers: '/dashboard/teachers',
    guardians: '/dashboard/guardians',
    fees: '/dashboard/fees',
    hr: '/dashboard/hr',
    reports: '/dashboard/reports',
    settings: '/dashboard/settings',
  };
  return map[key] || `/dashboard/${key}`;
}

export function displayScope() {
  return 'Brightwood International School';
}
