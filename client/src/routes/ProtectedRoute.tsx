import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/page-loader";

export function ProtectedRoute({ children }: { children: ReactElement }) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <PageLoader label="Checking your session..." />;
  }

  return isAuthenticated ? children : <Navigate to="/sign-in" replace />;
}

export function GuestRoute({ children }: { children: ReactElement }) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <PageLoader label="Checking your session..." />;
  }

  return isAuthenticated ? <Navigate to="/learn" replace /> : children;
}

export function AdminRoute({ children }: { children: ReactElement }) {
  const { loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return <PageLoader label="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return isAdmin ? children : <Navigate to="/" replace />;
}
