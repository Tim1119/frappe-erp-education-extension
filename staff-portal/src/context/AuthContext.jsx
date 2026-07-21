import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import * as frappe from "../services/frappeClient";

const AuthContext = createContext(null);

/**
 * Real Frappe session auth. On mount we ask Frappe who the current session
 * belongs to (the `sid` cookie, if any, is sent automatically since the
 * frontend is served from the same origin as the site). If the session
 * cookie is missing/expired, Frappe reports the user as "Guest".
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    setLoading(true);
    try {
      const email = await frappe.getLoggedUser();
      if (!email || email === "Guest") {
        setUser(null);
      } else {
        let profile = null;
        try {
          profile = await frappe.getCurrentUserProfile(email);
        } catch {
          /* fall back below */
        }
        setUser({
          email,
          full_name: profile?.full_name || email,
          photo_url: profile?.user_image || null,
        });
      }
    } catch {
      setUser(null);
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
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      role: "STAFF",
      authenticated: Boolean(user),
      loading,
      login,
      logout,
      refresh: hydrate,
    }),
    [user, loading, login, logout, hydrate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
