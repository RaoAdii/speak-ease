import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/page-loader";
export function ProtectedRoute({ children }) {
    const { loading, isAuthenticated } = useAuth();
    if (loading) {
        return <PageLoader label="Checking your session..."/>;
    }
    return isAuthenticated ? children : <Navigate to="/sign-in" replace/>;
}
export function GuestRoute({ children }) {
    const { loading, isAuthenticated } = useAuth();
    if (loading) {
        return <PageLoader label="Checking your session..."/>;
    }
    return isAuthenticated ? <Navigate to="/learn" replace/> : children;
}
