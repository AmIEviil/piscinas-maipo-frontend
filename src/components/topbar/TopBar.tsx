import { useNavigate, useLocation } from "react-router";
import { PAGE_ROUTES } from "../../constant/routes";
import style from "./TopBar.module.css";

export const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const actualRoute = location.pathname.replace("/", "");

  return (
    <div className={style.topBarContainer}>
      <div className={style.headerModuleContainer}>
        <span>
          {actualRoute.charAt(0).toUpperCase() + actualRoute.slice(1)}
        </span>
      </div>
      <div className={style.tabsContainer}>
        <button onClick={() => navigate(PAGE_ROUTES.Home)}>Home</button>
        <button onClick={() => navigate(PAGE_ROUTES.Login)}>Login</button>
        <button onClick={() => navigate(PAGE_ROUTES.Clientes)}>Clientes</button>
      </div>
    </div>
  );
};
