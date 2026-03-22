import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useActivationStore } from "../store/useActivationStore";

export function ProtectedLayout() {
  const location = useLocation();
  const activation = useActivationStore((state) => state.activation);

  if (!activation) {
    return <Navigate to="/activate" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
