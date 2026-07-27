import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import * as frappe from "@/services/frappeClient";
import { getPortalContext } from "@/services/portalService";

const AuthContext = createContext(null);

/**
 * Roles:
 *   "admin"   → user has "Education Manager" role
 *   "teacher" → user has an Instructor record linked to their Employee
 *   null      → still loading or not authenticated
 *
 * The backend endpoint `get_portal_context` returns:
 *   { role, instructor, school_name, school_abbreviation, school_logo }
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // "admin" | "teacher"
  const [instructor, setInstructor] = useState(null);
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    setLoading(true);
    try {
      const email = await frappe.getLoggedUser();
      if (!email || email === "Guest") {
        setUser(null);
        setRole(null);
        return;
      }

      // Fetch profile + portal context in parallel
      const [profile, portalCtx] = await Promise.all([
        frappe.getCurrentUserProfile(email).catch(() => null),
        getPortalContext().catch(() => null),
      ]);

      setUser({
        email,
        full_name: profile?.full_name || email,
        photo_url: profile?.user_image || null,
      });

      if (portalCtx) {
        setRole(portalCtx.role || "teacher");
        setInstructor(portalCtx.instructor || null);
        setSchool({
          name: portalCtx.school_name || "School Portal",
          abbreviation: portalCtx.school_abbreviation || "",
          logo: portalCtx.school_logo || null,
        });
      } else {
        // Fallback — assume admin if we can't determine
        setRole("admin");
        setSchool({ name: "School Portal", abbreviation: "", logo: null });
      }
    } catch {
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = useCallback(
    async (email, password) => {
      await frappe.login(email, password);
      await hydrate();
    },
    [hydrate],
  );

  const logout = useCallback(async () => {
    try {
      await frappe.logout();
    } finally {
      setUser(null);
      setRole(null);
    }
  }, []);

  const isAdmin = role === "admin";
  const isTeacher = role === "teacher";

  const value = useMemo(
    () => ({
      user,
      role,
      instructor,
      school,
      authenticated: Boolean(user),
      loading,
      isAdmin,
      isTeacher,
      login,
      logout,
      refresh: hydrate,
    }),
    [user, role, instructor, school, loading, isAdmin, isTeacher, login, logout, hydrate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
