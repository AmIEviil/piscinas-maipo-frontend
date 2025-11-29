import { Navigate } from "react-router";
import { useBoundStore } from "../../store/BoundedStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[]; // Ej: ["Administrador", "Soporte"]
  redirectPath?: string; // Ruta a redirigir si no tiene permisos
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
  redirectPath = "/",
}: ProtectedRouteProps) => {
  const userRole = useBoundStore(
    (state) => state.userData?.roleUser.role.nombre
  );
  const normalizedRole = userRole ? userRole.trim() : null;

  if (!normalizedRole || !allowedRoles.includes(normalizedRole)) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
