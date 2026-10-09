import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { authService } from "../services/authService";

export default function ProtectedRoute({ children, requiredRole }) {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token) {
          setAuth(false);
          return;
        }

        if (requiredRole && role !== requiredRole) {
          setAuth(false);
          return;
        }
        try {
          await authService.getMe();
          setAuth(true);
        } catch {
          authService.logout();
          setAuth(false);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [requiredRole]);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Đang xác thực...</p>
        </div>
      </div>
    );

  return auth ? children : <Navigate to="/" replace />;
}
