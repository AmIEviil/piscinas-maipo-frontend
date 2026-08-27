import { useEffect, useRef } from "react";
import style from "./TopBar.module.css";
import PiscinasElMaipoIcon from "../ui/Icons/piscinasDelMaipoIcon";
import CustomDropmenu from "../ui/customdropmenu/NavBarComponent";
import FontSizeControls from "./FontSizeControls";

export const TopBar = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  /**
   * La barra esta fija, asi que el contenido de abajo necesita saber cuanto
   * mide para no quedar tapado. El alto ya no es constante: cambia con el
   * nivel de letra y con el ancho de la ventana, por lo que se mide y se
   * publica en --topbar-h en lugar de repetirse como numero magico.
   */
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const publishHeight = () => {
      document.documentElement.style.setProperty(
        "--topbar-h",
        `${element.offsetHeight}px`
      );
    };

    publishHeight();

    const observer = new ResizeObserver(publishHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={style.topBarContainer} ref={containerRef}>
      <div className={style.headerModuleContainer}>
        <PiscinasElMaipoIcon
          size={90}
          color="white"
          className={`${style.iconHeader} icon`}
        />
        <span className={style.brandName}>Piscinas El Maipo</span>
      </div>
      <div className={style.actionsContainer}>
        <FontSizeControls />
        <CustomDropmenu />
      </div>
    </div>
  );
};
