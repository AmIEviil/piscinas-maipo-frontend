import { useNavigate } from "react-router";
import { PAGE_ROUTES } from "../../constant/routes";
import style from "./TopBar.module.css";

export const TopBar = () => {
  const navigate = useNavigate();
  return (
    <div className={style.topBarContainer}>
      <button onClick={() => navigate(PAGE_ROUTES.Home)}>Home</button>
      <button onClick={() => navigate(PAGE_ROUTES.Login)}>Login</button>
      <button onClick={() => navigate(PAGE_ROUTES.Clientes)}>Clientes</button>
    </div>
  );
};
