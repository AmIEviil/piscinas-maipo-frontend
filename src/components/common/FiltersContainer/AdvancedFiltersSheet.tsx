import SlideSheet from "../../ui/sheet/SlideSheet";
import Button from "../../ui/button/Button";
import FilterField, { type FilterItem } from "./FilterField";
import style from "./AdvancedFiltersSheet.module.css";

export interface GrupoFiltros {
  /** Rotulo del grupo. Un divider sin nombre no dice que separa. */
  titulo: string;
  filtros: FilterItem[];
}

interface AdvancedFiltersSheetProps {
  abierta: boolean;
  grupos: GrupoFiltros[];
  /** Cuantos filtros estan aplicados, para el subtitulo. */
  activos: number;
  onCerrar: () => void;
  onLimpiar: () => void;
}

/**
 * Hoja lateral con todos los filtros de la vista, agrupados.
 *
 * Entra por la derecha, igual que la hoja de registrar mantencion: es el mismo
 * gesto para el mismo tipo de tarea, y ahorra explicar dos patrones distintos
 * de "algo se abre al costado".
 *
 * Incluye tambien los filtros que ya estan en la barra. Duplicarlos es
 * deliberado: quien abre la busqueda avanzada esta armando una consulta
 * completa y no deberia tener que cerrar la hoja para tocar el nombre o el
 * dia. Ambas copias leen y escriben el mismo estado, asi que no pueden
 * desincronizarse.
 */
const AdvancedFiltersSheet = ({
  abierta,
  grupos,
  activos,
  onCerrar,
  onLimpiar,
}: AdvancedFiltersSheetProps) => (
  <div className={style.capa} data-abierto={abierta ? "si" : "no"}>
    <SlideSheet
      abierta={abierta}
      titulo="Busqueda avanzada"
      subtitulo={
        activos > 0
          ? `${activos} filtro(s) aplicado(s)`
          : "Ningun filtro aplicado"
      }
      onCerrar={onCerrar}
      pie={
        <>
          <Button
            label="Limpiar filtros"
            variant="tertiary"
            onClick={onLimpiar}
            disabled={activos === 0}
          />
          <Button label="Listo" variant="primary" onClick={onCerrar} />
        </>
      }
    >
      {/* Los filtros aplican al instante, como en la barra: la hoja no tiene
          un "Aplicar" propio porque eso obligaria a mantener un borrador
          aparte que se puede desincronizar del filtro real. "Listo" solo
          cierra. */}
      {grupos.map((grupo, indice) => (
        <section
          key={grupo.titulo}
          className={style.grupo}
          aria-labelledby={`grupo-${indice}`}
        >
          <h3 id={`grupo-${indice}`} className={style.grupoTitulo}>
            {grupo.titulo}
          </h3>
          <div className={style.campos}>
            {grupo.filtros.map((filter, index) => (
              <FilterField
                key={filter.title + index}
                filter={filter}
                scope="avanzada"
              />
            ))}
          </div>
        </section>
      ))}
    </SlideSheet>
  </div>
);

export default AdvancedFiltersSheet;
