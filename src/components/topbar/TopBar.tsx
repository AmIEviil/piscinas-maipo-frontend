import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import style from "./TopBar.module.css";
import PiscinasElMaipoIcon from "../ui/Icons/piscinasDelMaipoIcon";
import CustomDropmenu from "../ui/customdropmenu/NavBarComponent";
import FontSizeControls from "./FontSizeControls";
import { useHideOnScroll } from "../../hooks/useHideOnScroll";

export const TopBar = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { pathname } = useLocation();
  const { isHidden, reveal } = useHideOnScroll();

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

  /**
   * Al cambiar de vista la barra vuelve siempre a la vista: si el usuario
   * navego con la barra escondida, la nueva pagina quedaria sin cabecera y
   * sin un scroll hacia arriba que la devuelva.
   */
  useEffect(() => {
    reveal();
  }, [pathname, reveal]);

  return (
    <div
      className={`${style.topBarContainer} ${isHidden ? style.isHidden : ""}`}
      ref={containerRef}
    >
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
