import { useNavigate } from "react-router";
import { PAGE_ROUTES } from "../../constant/routes";

export const TopBar = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div style={{ display: "flex", gap: "6px", flexDirection: "column" }}>
        <button onClick={() => navigate(PAGE_ROUTES.Home)}>Home</button>
        <button onClick={() => navigate(PAGE_ROUTES.Login)}>Login</button>
        <button onClick={() => navigate(PAGE_ROUTES.Clientes)}>Clientes</button>
      </div>
    </div>
  );
};
