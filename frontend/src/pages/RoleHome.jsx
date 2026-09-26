import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleHome() {
  const { user } = useAuth();
  return <Navigate to={user?.role === "agent" ? "/agent" : "/dashboard"} replace />;
}
