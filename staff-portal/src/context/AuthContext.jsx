import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as frappe from "@/services/frappeClient";
import { getPortalContext } from "@/services/portalService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [frappeRoles, setFrappeRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [instructor, setInstructor] = useState(null);
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  const redirectToFrappeLogin = useCallback(() => {
    const target = `${window.location.pathname}${window.location.search}`;
    window.location.href = `/login?redirect-to=${encodeURIComponent(target)}`;
  }, []);

  const hydrate = useCallback(async () => {
    setLoading(true);

    try {
      const email = await frappe.getLoggedUser();

      if (!email || email === "Guest") {
        redirectToFrappeLogin();
        return;
      }

      const [profile, portalCtx] = await Promise.all([
        frappe.getCurrentUserProfile(email).catch(() => null),
        getPortalContext(),
      ]);

      if (!portalCtx?.role) {
        throw new Error("Staff portal access could not be determined");
      }

      setUser({
        email,
        full_name: profile?.full_name || email,
        photo_url: profile?.user_image || null,
      });

      setRole(portalCtx.role);
      setFrappeRoles(portalCtx.frappe_roles || []);
      setPermissions(portalCtx.permissions || {});
      setInstructor(portalCtx.instructor || null);
      setSchool({
        name: portalCtx.school_name || "School Portal",
        abbreviation: portalCtx.school_abbreviation || "",
        logo: portalCtx.school_logo || null,
      });
    } catch (error) {
      console.error("Unable to hydrate staff portal context", error);

      setUser(null);
      setRole(null);
      setFrappeRoles([]);
      setPermissions({});
      setInstructor(null);
      setSchool(null);

      redirectToFrappeLogin();
    } finally {
      setLoading(false);
    }
  }, [redirectToFrappeLogin]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const logout = useCallback(async () => {
    try {
      await frappe.logout();
    } finally {
      setUser(null);
      setRole(null);
      setFrappeRoles([]);
      setPermissions({});
      setInstructor(null);
      setSchool(null);
      window.location.replace("/login?redirect-to=%2Fstaff-dashboard");
    }
  }, []);

  const isAdmin = role === "admin";
  const isTeacher = role === "teacher";
  const isBursar = role === "bursar";

  const hasFrappeRole = useCallback(
    (roleName) => frappeRoles.includes(roleName),
    [frappeRoles],
  );

  const can = useCallback(
    (doctype, permission = "read") =>
      Boolean(permissions?.[doctype]?.[permission]),
    [permissions],
  );

  const value = useMemo(
    () => ({
      user,
      role,
      frappeRoles,
      permissions,
      instructor,
      school,
      authenticated: Boolean(user),
      loading,
      isAdmin,
      isTeacher,
      isBursar,
      hasFrappeRole,
      can,
      logout,
      refresh: hydrate,
    }),
    [
      user,
      role,
      frappeRoles,
      permissions,
      instructor,
      school,
      loading,
      isAdmin,
      isTeacher,
      isBursar,
      hasFrappeRole,
      can,
      logout,
      hydrate,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
}
