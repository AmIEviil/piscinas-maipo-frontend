import { useNavigate, useLocation } from "react-router";
import { PAGE_ROUTES } from "../../constant/routes";
import style from "./TopBar.module.css";
import PiscinasElMaipoIcon from "../ui/Icons/piscinasDelMaipoIcon";
export const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const actualRoute = location.pathname.replace("/", "") || "Home";

  return (
    <div className={style.topBarContainer}>
      <div className={style.headerModuleContainer}>
        <PiscinasElMaipoIcon size={90} color="white" className={style.iconHeader}/>
        <span>Piscinas El Maipo</span>
      </div>
      <span>{actualRoute.charAt(0).toUpperCase() + actualRoute.slice(1)}</span>
      <div className={style.tabsContainer}>
        <button onClick={() => navigate("/")}>Home</button>
        <button onClick={() => navigate(PAGE_ROUTES.Clientes)}>Clientes</button>
        <button onClick={() => navigate(PAGE_ROUTES.Inventario)}>
          Inventario
        </button>
      </div>
    </div>
  );
};
