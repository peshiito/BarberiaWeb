import { Navigate, useLocation } from "react-router-dom";
import { useClientAuth } from "../hooks/useClientAuth";

export default function ClientProtectedRoute({ children }) {
    const { isAuthenticated } = useClientAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/ingresar" replace state={{ from: location }} />;
    }

    return children;
}
