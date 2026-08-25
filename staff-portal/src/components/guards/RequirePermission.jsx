import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function RequirePermission({
  doctype,
  permission = "read",
  children,
}) {
  const { can, loading } = useAuth();

  if (loading) return null;

  if (!can(doctype, permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
