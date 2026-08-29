import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import style from "./MonthBar.module.css";
import type { MesDisponible } from "../hooks/useMonthNavigation";

interface MonthBarProps {
  meses: MesDisponible[];
  mesActivo: string | null;
  onCambiarMes: (clave: string) => void;
  etiquetaAccion: string;
  onAccion: () => void;
  mostrarAccion: boolean;
}

/**
 * Carrusel de meses compartido por Mantenciones y Cobros.
 *
 * Vive bajo el tablist, no dentro de los paneles: al cambiar de pestana el mes
 * se conserva. Lo unico que cambia entre pestanas es el boton de la derecha.
 *
 * Con muchos meses (los clientes antiguos pasan largo de seis) la pista no
 * cabe y quedaba solo el scroll horizontal, que en escritorio no tiene
 * affordance visible: no hay barra hasta que se rueda, asi que los meses de
 * los extremos simplemente parecen no existir. Por eso la pista lleva ahora
 * un boton de flecha en cada extremo, que aparecen solo cuando hay desborde y
 * se apagan al llegar a cada tope. El scroll con dedo o rueda sigue
 * funcionando igual: las flechas se suman a el, no lo reemplazan.
 */
const MonthBar = ({
  meses,
  mesActivo,
  onCambiarMes,
  etiquetaAccion,
  onAccion,
  mostrarAccion,
}: MonthBarProps) => {
  const pistaRef = useRef<HTMLDivElement | null>(null);
  const [puedeIzquierda, setPuedeIzquierda] = useState(false);
  const [puedeDerecha, setPuedeDerecha] = useState(false);

  // Las flechas se montan como par: basta con que se pueda avanzar en algun
  // sentido. Se deriva aca arriba porque el efecto de centrado la necesita
  // como dependencia (ver mas abajo).
  const hayFlechas = puedeIzquierda || puedeDerecha;

  // Huella del listado por contenido, no por identidad. `useMonthNavigation`
  // arma `meses` con un useMemo sobre `maintenancesClient`, asi que devuelve
  // un arreglo nuevo en cada refetch aunque los meses sean los mismos. Con la
  // identidad como dependencia, el efecto de centrado se disparaba con cada
  // refresco de datos y devolvia el scroll al mes activo en medio de la
  // navegacion del usuario.
  const clavesMeses = meses.map((mes) => mes.clave).join("|");

  const revisarDesborde = useCallback(() => {
    const pista = pistaRef.current;
    if (!pista) return;

    // Margen de 1px: con zoom del navegador o anchos fraccionarios,
    // scrollLeft + clientWidth no llega a igualar scrollWidth exacto y la
    // flecha derecha quedaria habilitada para siempre en el tope.
    const restante = pista.scrollWidth - pista.clientWidth - pista.scrollLeft;
    setPuedeIzquierda(pista.scrollLeft > 1);
    setPuedeDerecha(restante > 1);
  }, []);

  // useLayoutEffect y no useEffect: se mide el DOM. Con un efecto pasivo hay
  // un frame en el que las flechas ya se pintaron con el estado anterior
  // (p. ej. visibles al cambiar a un cliente con un solo mes), y se ve el
  // parpadeo.
  useLayoutEffect(() => {
    revisarDesborde();
  }, [clavesMeses, mostrarAccion, revisarDesborde]);

  // El desborde tambien cambia sin que cambien las props: al redimensionar la
  // ventana, al abrirse la hoja lateral que angosta el modal, o al subir el
  // nivel de fuente del TopBar (las pildoras crecen en rem). ResizeObserver
  // cubre los tres casos; el listener de resize queda como respaldo para
  // navegadores sin soporte.
  useEffect(() => {
    const pista = pistaRef.current;
    if (!pista) return;

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", revisarDesborde);
      return () => window.removeEventListener("resize", revisarDesborde);
    }

    const observador = new ResizeObserver(revisarDesborde);
    observador.observe(pista);
    return () => observador.disconnect();
  }, [revisarDesborde]);

  // Al cambiar de mes -sea por click en una pildora o por el boton de accion
  // del padre- el mes activo puede quedar fuera de la ventana visible de la
  // pista. Se lo trae al centro.
  //
  // Se calcula el scrollLeft a mano en vez de usar scrollIntoView: ese metodo
  // desplaza TODOS los ancestros desplazables, y `.modal` de
  // InfoDialogClient.module.css lo es -- `overflow: hidden` impide el scroll
  // del usuario, pero no el programatico. El resultado era que centrar el mes
  // activo corria el modal entero hacia la izquierda y le cortaba la cabecera.
  //
  // `hayFlechas` esta en las dependencias porque montar las flechas angosta la
  // pista: cuando el mes activo se fija recien llegados los datos, este efecto
  // corre antes de que aparezcan, y con el ancho viejo el centro cae en otro
  // lugar. Al montarse, el efecto vuelve a correr y recalcula sobre el ancho
  // real.
  //
  // Es `hayFlechas` y NO `puedeIzquierda`/`puedeDerecha` por separado, aunque
  // sea de ellas de donde sale. Con las dos por separado, cada pulsacion de
  // una flecha se cancelaba sola: desplazaba la pista, el `onScroll` de la
  // pista actualizaba que topes quedaban alcanzables, eso reejecutaba este
  // efecto y el efecto devolvia el scroll al mes activo. Al aterrizar de
  // vuelta en el tope, la flecha se deshabilitaba y el cursor parpadeaba a
  // `not-allowed`. `hayFlechas` en cambio no se inmuta mientras el usuario se
  // desplaza -- si hay desborde, siempre queda al menos un sentido disponible,
  // asi que se mantiene en true --, y solo cambia en la transicion real que a
  // este efecto le importa: la aparicion o desaparicion de las flechas.
  //
  // Se usa useLayoutEffect y no un requestAnimationFrame diferido: en una
  // pestana en segundo plano el navegador no entrega frames, y el centrado
  // quedaria pendiente hasta que el usuario vuelva a mirar.
  useLayoutEffect(() => {
    const pista = pistaRef.current;
    const activa = pista?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!pista || !mesActivo || !activa) return;

    // Se mide con getBoundingClientRect y no con offsetLeft: `.pista` es
    // position:static, asi que no es el offsetParent de las pildoras -lo es
    // `.modal`, que si declara position:relative-, y offsetLeft devolveria
    // la distancia al modal en vez de a la pista.
    const caja = pista.getBoundingClientRect();
    const cajaActiva = activa.getBoundingClientRect();
    const centrado =
      pista.scrollLeft +
      (cajaActiva.left - caja.left) -
      (caja.width - cajaActiva.width) / 2;

    pista.scrollTo({ left: Math.max(0, centrado), behavior: "smooth" });
  }, [mesActivo, clavesMeses, hayFlechas]);

  const desplazar = (direccion: 1 | -1) => {
    const pista = pistaRef.current;
    if (!pista) return;

    // Se desplaza el 80% del ancho visible, no el 100%: deja una pildora de
    // solapamiento como punto de referencia de donde se venia.
    pista.scrollBy({ left: direccion * pista.clientWidth * 0.8, behavior: "smooth" });
  };

  if (meses.length === 0 && !mostrarAccion) return null;

  return (
    <div className={style.barra}>
      <div className={style.carrusel}>
        {hayFlechas && (
          <button
            type="button"
            className={style.flecha}
            onClick={() => desplazar(-1)}
            disabled={!puedeIzquierda}
            aria-label="Ver meses anteriores"
          >
            <ChevronLeftIcon fontSize="inherit" />
          </button>
        )}

        <div
          className={style.pista}
          role="group"
          aria-label="Elegir mes"
          ref={pistaRef}
          onScroll={revisarDesborde}
        >
          {meses.map((mes) => {
            const activo = mes.clave === mesActivo;
            return (
              <button
                key={mes.clave}
                type="button"
                className={style.pildora}
                aria-current={activo ? "true" : undefined}
                onClick={() => onCambiarMes(mes.clave)}
              >
                {mes.etiqueta}
                <small>
                  {mes.realizadas} de {mes.totalVisitas} hechas
                </small>
              </button>
            );
          })}
        </div>

        {hayFlechas && (
          <button
            type="button"
            className={style.flecha}
            onClick={() => desplazar(1)}
            disabled={!puedeDerecha}
            aria-label="Ver meses siguientes"
          >
            <ChevronRightIcon fontSize="inherit" />
          </button>
        )}
      </div>

      {mostrarAccion && (
        <div className={style.accion}>
          <button type="button" className={style.botonAccion} onClick={onAccion}>
            + {etiquetaAccion}
          </button>
        </div>
      )}
    </div>
  );
};

export default MonthBar;
