import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListSubheader from "@mui/material/ListSubheader";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { type SelectChangeEvent } from "@mui/material/Select";
import Select from "@mui/material/Select";
import CheckIcon from "@mui/icons-material/Check";
import SearchIcon from "@mui/icons-material/Search";
import style from "./SelectStyle.module.css";
import { useMemo, useState, type ReactNode } from "react";

export interface IOptionsSelect {
  value: string | number;
  label: string;
}
interface CustomSelectProps {
  title?: string;
  required?: boolean;
  label?: string;
  options?: IOptionsSelect[];
  value?: string | number;
  disabled?: boolean;
  onChange?: (
    event: SelectChangeEvent<string | number>,
    child?: ReactNode
  ) => void;
  icon?: ReactNode;
  /** Habilita un campo de busqueda dentro del menu para filtrar las opciones. */
  searchable?: boolean;
  searchPlaceholder?: string;
}

// Sin tildes y en minusculas: asi "Cloro Granulado" tambien matchea "clóro".
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const CustomSelect = ({
  title,
  required = false,
  label = "Soy un select",
  options,
  value,
  onChange,
  icon,
  searchable = false,
  searchPlaceholder = "Buscar...",
}: CustomSelectProps) => {
  const [search, setSearch] = useState("");

  const handleChange = (
    event: SelectChangeEvent<string | number>,
    child?: ReactNode
  ) => {
    if (onChange) {
      onChange(event, child);
    }
  };

  const filteredOptions = useMemo(() => {
    if (!searchable || !search) return options ?? [];
    const term = normalize(search);
    return (options ?? []).filter((option) =>
      normalize(option.label).includes(term)
    );
  }, [options, search, searchable]);

  const isSelected = (optionValue: string | number) =>
    value !== undefined && value !== "" && String(optionValue) === String(value);

  // Si el filtro deja fuera a la opcion seleccionada, MUI avisa "out-of-range
  // value": hay que mantenerla montada aunque no se vea.
  const hiddenSelectedOption =
    searchable && value !== undefined && value !== ""
      ? (options ?? []).find(
          (option) =>
            String(option.value) === String(value) &&
            !filteredOptions.some(
              (visible) => String(visible.value) === String(option.value)
            )
        )
      : undefined;

  return (
    <div>
      {title && (
        <label className="input-title" htmlFor={`input-field-${title}`}>
          {title} {required && <span className="required">*</span>}
        </label>
      )}
      {/* minWidth en rem y no en px: con 150px fijos la etiqueta "Buscar por
          Comuna" quedaba cortada apenas se subia el tamano de letra. */}
      <FormControl sx={{ m: 0.5, minWidth: "12rem", width: "100%" }}>
        <InputLabel
          className={`${style.customInputLabel} ${icon ? style.withIcon : ""}`}
          id="demo-simple-select"
          sx={{
            top: "-0.5rem",
            paddingLeft: icon ? "2rem" : "0rem",
            fontWeight: "500",
            "&.MuiInputLabel-shrink": {
              top: "-0.1rem",
              left: "0px",
            },
          }}
        >
          {icon && <span className={style.iconInputLabel}>{icon}</span>}
          <span className={style.InputLabel}>{label}</span>
        </InputLabel>
        <Select
          value={value}
          onChange={handleChange}
          label={label}
          onClose={() => setSearch("")}
          // El check verde vive dentro del MenuItem; sin renderValue MUI clona
          // los hijos del item seleccionado y el check aparece tambien dentro
          // del campo cerrado.
          renderValue={(selected) =>
            options?.find((option) => String(option.value) === String(selected))
              ?.label ?? ""
          }
          MenuProps={{
            // Sin esto el menu roba el foco al abrirse y el campo de busqueda
            // no puede escribirse.
            autoFocus: !searchable,
            PaperProps: {
              style: {
                maxHeight: 200, // Ajusta a lo que necesites
                overflowY: "auto",
              },
            },
            style: {
              width: "1rem",
            },
          }}
          sx={{
            "& .MuiOutlinedInput-input": {
              margin: "0px",
              padding: "0.5rem",
            },
            "&.MuiInputLabel-root": {
              backgroundColor: "blue",
            },
            // MuiFormLabel-root-MuiInputLabel-root
            "& .MuiOutlinedInput-notchedOutline": {
              borderRadius: "24px",
              // backgroundColor: "red",
            },
            "& .MuiInputLabel-root": {
              top: "-0.5rem",
              backgroundColor: " red",
            },
            "& .MuiInputLabel-shrink": {
              top: "-0.1rem",
              backgroundColor: " blue",
            },
          }}
        >
          {searchable && (
            <ListSubheader className={style.searchHeader}>
              <TextField
                size="small"
                fullWidth
                autoFocus
                placeholder={searchPlaceholder}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                // El Select clona a sus hijos con un onClick que selecciona:
                // sin esto, hacer click en el buscador cierra el menu.
                onClick={(event) => event.stopPropagation()}
                // El Select captura las teclas para su typeahead y cierra el
                // menu con la barra espaciadora: hay que cortar la propagacion.
                onKeyDown={(event) => {
                  if (event.key !== "Escape") {
                    event.stopPropagation();
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </ListSubheader>
          )}
          {filteredOptions.length === 0 && searchable ? (
            <MenuItem disabled value="">
              Sin resultados
            </MenuItem>
          ) : (
            filteredOptions.map((option, index) => (
              <MenuItem
                key={index}
                value={option.value}
                className="custom-scrollbar"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <span>{option.label}</span>
                {isSelected(option.value) && (
                  <CheckIcon fontSize="small" className={style.selectedCheck} />
                )}
              </MenuItem>
            ))
          )}
          {hiddenSelectedOption && (
            <MenuItem
              value={hiddenSelectedOption.value}
              sx={{ display: "none" }}
            >
              {hiddenSelectedOption.label}
            </MenuItem>
          )}
        </Select>
      </FormControl>
    </div>
  );
};

export default CustomSelect;
