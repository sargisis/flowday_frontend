import type { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    // Save the current location they were trying to go to
    return <Navigate to="/app/v1/login" state={{ from: location }} replace />;
  }

  return children;
}
