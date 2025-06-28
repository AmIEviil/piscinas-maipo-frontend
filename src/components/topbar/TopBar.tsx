import { useNavigate, useLocation } from "react-router";
import { PAGE_ROUTES } from "../../constant/routes";
import style from "./TopBar.module.css";
import PiscinasElMaipoIcon from "../ui/Icons/piscinasDelMaipoIcon";
import { useEffect, useState } from "react";
import CustomNavBar from "./MobileNavBar";
export const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const actualRoute = location.pathname.replace("/", "") || "Inicio";

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Limpieza al desmontar
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className={style.topBarContainer}>
      <div className={style.headerModuleContainer}>
        <PiscinasElMaipoIcon
          size={90}
          color="white"
          className={style.iconHeader}
        />
        <span>Piscinas El Maipo</span>
      </div>
      {windowWidth > 720 && (
        <span>
          {actualRoute.charAt(0).toUpperCase() + actualRoute.slice(1)}
        </span>
      )}
      <div className={style.tabsContainer}>
        {windowWidth > 720 ? (
          <>
            <button onClick={() => navigate("/")}>Inicio</button>
            <button onClick={() => navigate(PAGE_ROUTES.Clientes)}>
              Clientes
            </button>
            <button onClick={() => navigate(PAGE_ROUTES.Inventario)}>
              Inventario
            </button>
          </>
        ) : (
          <>
            <CustomNavBar />
          </>
        )}
      </div>
    </div>
  );
};
