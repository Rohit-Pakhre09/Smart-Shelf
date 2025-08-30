import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

    useEffect(() => {
        // Optional: Add an event listener to detect storage changes (e.g., logout from another tab)
        const handleStorageChange = () => {
            setIsAuthenticated(!!localStorage.getItem("token"));
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    return children;
}

export default PrivateRoute;