import { useEffect, useState } from "react";
import { getWindowWidth } from "../../utils/WindowUtils";
import PiscinasElMaipoIcon from "../ui/Icons/piscinasDelMaipoIcon";
import style from "./HeaderLogin.module.css";

const HeaderLogin = () => {
  const [windowWidth, setWindowWidth] = useState(getWindowWidth());

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
    <div className={style.headerLogin}>
      <div className={style.headerContent}>
        <span className={style.iconHeader}>
          <PiscinasElMaipoIcon size={windowWidth < 1000 ? 120 : 180} />
        </span>
        <div className={style.textHeader}>
          Bienvenido a la plataforma. Por favor, ingresa tus credenciales para
          continuar.
        </div>
      </div>
    </div>
  );
};

export default HeaderLogin;
