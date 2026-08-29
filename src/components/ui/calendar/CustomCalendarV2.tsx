import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarIcon from "../Icons/CalendarIcon";
import styles from "./CustomCalendarV2.module.css";
import { formatDateToDDMMYYYY } from "../../../utils/DateUtils";
import {
  type CalendarBound,
  type CalendarFutureBoundToken,
  type CalendarPastBoundToken,
  getSantiagoToday,
  resolveCalendarBoundKey,
  toDateKey,
} from "../../../utils/calendarBounds";

interface CustomCalendarV2Props {
  label?: string;
  placeholder?: string;
  initialDate?: Date;
  availableDates?: string[];
  disabled?: boolean;
  /** Marca el campo como obligatorio junto a la etiqueta. */
  require?: boolean;
  /**
   * Límite hacia el pasado (inclusive): no se puede seleccionar antes de esta
   * fecha, sin necesidad de enumerar cada día futuro en `availableDates`.
   * Acepta un `Date` fijo o un token relativo a hoy (`"today"`, `"yesterday"`…).
   * Opcional — sin él el calendario se comporta como antes (sin restricción).
   */
  minDate?: CalendarBound<CalendarPastBoundToken>;
  /**
   * Límite hacia el futuro: no se puede seleccionar después de esta fecha.
   * Opcional — sin él el calendario se comporta como antes (sin restricción).
   */
  maxDate?: CalendarBound<CalendarFutureBoundToken>;
  /**
   * Alto del campo (el botón que abre el calendario), para alinearlo con los
   * inputs que lo rodean. Un `number` se interpreta en px; un `string` se pasa
   * tal cual (`"3rem"`, `"100%"`). Opcional — sin él manda el CSS del módulo.
   */
  height?: number | string;
  customClassName?: string;
  onSave?: (date: Date | null) => void;
  onCancel?: () => void;
}

interface MonthCell {
  day: number | null;
  key: string;
}

const WEEK_DAYS = ["L", "M", "M", "J", "V", "S", "D"];

const normalizeDate = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const parseDateKey = (value: string) => {
  const normalized = value.trim();

  const yyyyMmDdMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
  if (yyyyMmDdMatch) {
    const [, year, month, day] = yyyyMmDdMatch;
    return `${year}-${month}-${day}`;
  }

  const ddMmYyyyMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(normalized);
  if (ddMmYyyyMatch) {
    const [, day, month, year] = ddMmYyyyMatch;
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return toDateKey(parsed);
};

const dateFromDateKey = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
};

const getMonthLabel = (date: Date) => {
  const month = date.toLocaleString("es-CL", { month: "short" });
  const shortMonth = month.replace(".", "");
  return `${shortMonth.charAt(0).toUpperCase()}${shortMonth.slice(1)} ${date.getFullYear()}`;
};

export const CustomCalendarV2 = ({
  label = "Fecha",
  placeholder = "Selecciona una fecha",
  initialDate,
  availableDates,
  disabled = false,
  require = false,
  minDate,
  maxDate,
  height,
  customClassName = "",
  onSave,
  onCancel,
}: CustomCalendarV2Props) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLElement>(null);
  const etiquetaId = useId();

  const fieldHeight = useMemo(() => {
    if (height === undefined || height === null || height === "") {
      return undefined;
    }

    return typeof height === "number" ? `${height}px` : height;
  }, [height]);

  // Se memoizan como string ("YYYY-MM-DD") y no como Date para que un `minDate`
  // creado inline en el padre no cambie de identidad en cada render.
  const minDateKey = useMemo(() => resolveCalendarBoundKey(minDate), [minDate]);
  const maxDateKey = useMemo(() => resolveCalendarBoundKey(maxDate), [maxDate]);

  // Mismo motivo, y ademas uno mas grave: `startingDate` alimenta un efecto
  // que hace setState. Si dependiera de la identidad de `initialDate` -que el
  // padre suele construir inline con `new Date(...)`- ese efecto correria en
  // cada render y el componente entraria en un bucle. Anclarlo a la clave
  // "YYYY-MM-DD" lo vuelve estable mientras el dia no cambie.
  const initialDateKey = useMemo(() => {
    if (!initialDate || Number.isNaN(initialDate.getTime())) return null;
    return toDateKey(normalizeDate(initialDate));
  }, [initialDate]);

  // Las claves "YYYY-MM-DD" son comparables lexicográficamente.
  const isOutOfBounds = useCallback(
    (dateKey: string) => {
      if (minDateKey && dateKey < minDateKey) return true;
      if (maxDateKey && dateKey > maxDateKey) return true;
      return false;
    },
    [minDateKey, maxDateKey],
  );

  const clampToBounds = useCallback(
    (date: Date) => {
      const dateKey = toDateKey(date);
      if (minDateKey && dateKey < minDateKey) {
        return dateFromDateKey(minDateKey) ?? date;
      }
      if (maxDateKey && dateKey > maxDateKey) {
        return dateFromDateKey(maxDateKey) ?? date;
      }
      return date;
    },
    [minDateKey, maxDateKey],
  );

  // `availableDates` tambien suele llegar como arreglo nuevo en cada render
  // del padre: se ancla el memo a su contenido, no a su identidad.
  const availableDatesKey = availableDates?.join("|") ?? "";

  const allowedDateKeys = useMemo(() => {
    if (availableDatesKey === "") {
      return null;
    }

    const parsedDates = availableDatesKey
      .split("|")
      .map(parseDateKey)
      .filter((key): key is string => Boolean(key));

    if (parsedDates.length === 0) {
      return null;
    }

    return new Set(parsedDates);
  }, [availableDatesKey]);

  const firstAllowedDate = useMemo(() => {
    if (!allowedDateKeys || allowedDateKeys.size === 0) {
      return null;
    }

    const sortedKeys = Array.from(allowedDateKeys).sort((left, right) =>
      left.localeCompare(right),
    );
    return dateFromDateKey(sortedKeys[0]);
  }, [allowedDateKeys]);

  const startingDate = useMemo(() => {
    if (!initialDateKey) {
      return null;
    }

    // Una fecha inicial fuera de los límites (o fuera de `availableDates`) se
    // descarta: el trigger queda en placeholder y el padre se entera porque
    // `onSave` sólo puede devolver un día válido.
    if (isOutOfBounds(initialDateKey)) {
      return null;
    }

    if (allowedDateKeys && !allowedDateKeys.has(initialDateKey)) {
      return null;
    }

    return dateFromDateKey(initialDateKey);
  }, [initialDateKey, allowedDateKeys, isOutOfBounds]);

  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const baseDate = startingDate ?? clampToBounds(getSantiagoToday());
    return new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  });

  const [savedDate, setSavedDate] = useState<Date | null>(startingDate);
  const [draftDate, setDraftDate] = useState<Date | null>(startingDate);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [popupPosition, setPopupPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  useEffect(() => {
    setSavedDate(startingDate);
    setDraftDate(startingDate);
    const baseDate =
      startingDate ?? firstAllowedDate ?? clampToBounds(getSantiagoToday());
    setCurrentMonth(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1));
  }, [startingDate, firstAllowedDate, clampToBounds]);

  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
    }
  }, [disabled]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideWrapper = !wrapperRef.current?.contains(target);
      const isOutsidePopup = !popupRef.current?.contains(target);

      if (isOutsideWrapper && isOutsidePopup) {
        setDraftDate(savedDate);
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, savedDate]);

  const updatePopupPosition = () => {
    if (!wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const popupWidth = Math.max(Math.min(rect.width, 320), 250);
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = rect.left;
    let top = rect.bottom + 8;

    if (left + popupWidth > viewportWidth - 8) {
      left = Math.max(8, viewportWidth - popupWidth - 8);
    }

    const estimatedHeight = 360;
    if (top + estimatedHeight > viewportHeight - 8) {
      top = Math.max(8, rect.top - estimatedHeight - 8);
    }

    setPopupPosition({
      top,
      left,
      width: popupWidth,
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    updatePopupPosition();

    const handleScroll = () => updatePopupPosition();
    const handleResize = () => updatePopupPosition();

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  // El popup se porta a document.body, asi que queda fuera del subarbol de
  // cualquier dialogo que lo contenga. Llevarle el foco al abrirlo es lo que
  // permite que la trampa de foco de SlideSheet lo reconozca como capa
  // portada legitima (ver `enCapaPortada` en SlideSheet.tsx) en vez de
  // arrastrar el foco de vuelta a la hoja en el primer Tab.
  useEffect(() => {
    if (!isOpen) return;
    popupRef.current?.focus();
  }, [isOpen]);

  const monthDays = useMemo<MonthCell[]>(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: MonthCell[] = [];

    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, key: `empty-start-${year}-${month}-${i}` });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, key: `day-${year}-${month}-${day}` });
    }

    let trailingIndex = 0;
    while (days.length % 7 !== 0) {
      days.push({
        day: null,
        key: `empty-end-${year}-${month}-${trailingIndex}`,
      });
      trailingIndex++;
    }

    return days;
  }, [currentMonth]);

  const openCalendar = () => {
    if (disabled) {
      return;
    }

    const baseDate =
      savedDate ?? firstAllowedDate ?? clampToBounds(getSantiagoToday());
    setCurrentMonth(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1));
    setDraftDate(savedDate);
    setIsOpen(true);
  };

  const formattedSavedDate = useMemo(() => {
    if (!savedDate) {
      return "";
    }
    return formatDateToDDMMYYYY(savedDate);
  }, [savedDate]);

  // Navegar a un mes íntegramente fuera de los límites sólo mostraría una
  // grilla de días deshabilitados, así que se corta ahí.
  const isPreviousMonthDisabled = useMemo(() => {
    if (!minDateKey) return false;

    const lastDayOfPreviousMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      0,
    );
    return toDateKey(lastDayOfPreviousMonth) < minDateKey;
  }, [currentMonth, minDateKey]);

  const isNextMonthDisabled = useMemo(() => {
    if (!maxDateKey) return false;

    const firstDayOfNextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1,
    );
    return toDateKey(firstDayOfNextMonth) > maxDateKey;
  }, [currentMonth, maxDateKey]);

  const goToPreviousMonth = () => {
    if (isPreviousMonthDisabled) {
      return;
    }

    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    if (isNextMonthDisabled) {
      return;
    }

    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  const handleCancel = () => {
    setDraftDate(savedDate);
    setIsOpen(false);
    wrapperRef.current?.querySelector("button")?.focus();
    onCancel?.();
  };

  // Un día es seleccionable si cae dentro de los límites (`minDate`/`maxDate`)
  // y, cuando el padre acota el universo con `availableDates`, si además está
  // en esa lista. Sin fecha no hay nada que validar.
  const isSelectableDate = (date: Date | null) => {
    if (!date) return true;

    const dateKey = toDateKey(date);
    if (isOutOfBounds(dateKey)) return false;
    return !allowedDateKeys || allowedDateKeys.has(dateKey);
  };

  const handleSave = () => {
    const dateToSave = isSelectableDate(draftDate) ? draftDate : null;

    setSavedDate(dateToSave);
    setIsOpen(false);
    wrapperRef.current?.querySelector("button")?.focus();
    onSave?.(dateToSave);
  };

  const isSelectedDay = (day: number) => {
    if (!draftDate) {
      return false;
    }

    return (
      draftDate.getDate() === day &&
      draftDate.getMonth() === currentMonth.getMonth() &&
      draftDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isDisabledDay = (day: number) => {
    if (!allowedDateKeys && !minDateKey && !maxDateKey) {
      return false;
    }

    const dayDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );

    return !isSelectableDate(dayDate);
  };

  return (
    <section
      className={`${styles.wrapper} ${customClassName}`.trim()}
      ref={wrapperRef}
    >
      <label
        id={etiquetaId}
        className={`${styles.label} ${disabled ? styles.labelDisabled : ""}`}
      >
        {label} {require && <span className={styles.required}>*</span>}
      </label>
      <button
        type="button"
        className={`${styles.inputField} ${isOpen ? styles.inputOpen : ""} ${disabled ? styles.inputDisabled : ""}`}
        style={
          fieldHeight ? { height: fieldHeight, minHeight: fieldHeight } : undefined
        }
        onClick={openCalendar}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-labelledby={etiquetaId}
      >
        <span className={formattedSavedDate ? "" : styles.placeholder}>
          {formattedSavedDate || placeholder}
        </span>
        <CalendarIcon size={16} className={styles.inputIcon} color="currentColor" />
      </button>

      {isOpen && !disabled &&
        createPortal(
          <article
            ref={popupRef}
            /* Marca que identifica esta capa como popup portado propio. La
               trampa de foco de SlideSheet la busca por este atributo (no por
               clase de modulo CSS, que se ofusca al compilar) para no
               robarle el foco ni el Escape. */
            data-portal-popup="calendario"
            role="dialog"
            aria-modal="false"
            aria-label={label}
            tabIndex={-1}
            className={styles.calendarPopup}
            style={{
              top: `${popupPosition.top}px`,
              left: `${popupPosition.left}px`,
              width: `${popupPosition.width}px`,
            }}
            onKeyDown={(evento) => {
              if (evento.key !== "Escape") return;
              // Se corta la propagacion para que el Escape cierre el
              // calendario y no la hoja o el modal que lo contiene.
              evento.stopPropagation();
              handleCancel();
            }}
          >
          <header className={styles.header}>
            <button
              type="button"
              className={styles.navButton}
              onClick={goToPreviousMonth}
              disabled={isPreviousMonthDisabled}
              aria-label="Mes anterior"
            >
              <ChevronLeftIcon fontSize="inherit" />
            </button>

            <span className={styles.monthLabel}>
              {getMonthLabel(currentMonth)}
            </span>

            <button
              type="button"
              className={styles.navButton}
              onClick={goToNextMonth}
              disabled={isNextMonthDisabled}
              aria-label="Mes siguiente"
            >
              <ChevronRightIcon fontSize="inherit" />
            </button>
          </header>

          <section className={styles.weekDays}>
            {WEEK_DAYS.map((day, index) => (
              <span key={day + index}>{day}</span>
            ))}
          </section>

          <section className={styles.dayGrid}>
            {monthDays.map(({ day, key }) => {
              if (!day) {
                return <span key={key} className={styles.emptyCell} />;
              }

              return (
                <button
                  key={key}
                  type="button"
                  disabled={isDisabledDay(day)}
                  className={`${styles.dayButton} ${isSelectedDay(day) ? styles.selectedDay : ""} ${isDisabledDay(day) ? styles.disabledDay : ""}`}
                  onClick={() => {
                    if (isDisabledDay(day)) {
                      return;
                    }

                    setDraftDate(
                      normalizeDate(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth(),
                          day,
                        ),
                      ),
                    );
                  }}
                >
                  {day}
                </button>
              );
            })}
          </section>

          <footer className={styles.footer}>
            <button
              type="button"
              className={`${styles.actionButton} ${styles.actionSecondary}`}
              onClick={handleCancel}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={`${styles.actionButton} ${styles.actionPrimary}`}
              onClick={handleSave}
            >
              Guardar
            </button>
          </footer>
          </article>,
          document.body,
        )}
    </section>
  );
};

export default CustomCalendarV2;
