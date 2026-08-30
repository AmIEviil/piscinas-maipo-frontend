import { useSnackBarModalStore } from "../../../store/snackBarStore";
import style from "./CustomSnackBar.module.css";

interface CustomSnackBarProps {
  onClick: () => void;
  /**
   * Contenido opcional pegado al mensaje, separado por una linea.
   *
   * Se usa para el boton de acciones en bloque del listado de clientes: el
   * aviso ya dice cuantos clientes hay seleccionados, asi que el disparador de
   * las acciones sobre esa seleccion pertenece ahi y no en otra esquina de la
   * pantalla. Los clicks dentro de esta zona no abren el detalle.
   */
  trailing?: React.ReactNode;
}

export const CustomSnackBar: React.FC<CustomSnackBarProps> = ({
  onClick,
  trailing,
}) => {
  const { open, message } = useSnackBarModalStore();

  if (!open) return null;

  return (
    <div
      className={`${style.snackBarContainer} ${open ? style.show : style.hide}`}
      onClick={onClick}
    >
      <span>{message}</span>
      {trailing && (
        <div
          className={style.trailing}
          onClick={(evento) => evento.stopPropagation()}
        >
          {trailing}
        </div>
      )}
    </div>
  );
};
