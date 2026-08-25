import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * Route guard that checks the user's portal role.
 *
 * Usage:
 *   // Admin only (principal)
 *   <Route path="employees" element={<RequireRole allowed={["admin"]}><EmployeesPage /></RequireRole>} />
 *
 *   // Admin + Bursar (both can see fees/accounting)
 *   <Route path="fees" element={<RequireRole allowed={["admin", "bursar"]}><FeesPage /></RequireRole>} />
 *
 *   // Admin + Teacher (education pages)
 *   <Route path="students" element={<RequireRole allowed={["admin", "teacher"]}><StudentsPage /></RequireRole>} />
 *
 *   // Everyone
 *   <Route path="dashboard" element={<RequireRole allowed={["admin", "teacher", "bursar"]}><Dashboard /></RequireRole>} />
 *
 * If the user's role is not in `allowed`, they are redirected to /dashboard.
 * This is a UX guard — Frappe's doctype permissions are the real security layer.
 */
export default function RequireRole({ allowed, children }) {
  const { role, loading } = useAuth();

  // Still loading auth — don't flash anything
  if (loading) return null;

  // Role determined but not in allowed list — bounce to dashboard
  if (role && !allowed.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}