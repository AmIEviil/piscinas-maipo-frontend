import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import { debounce } from "@mui/material";

interface InputTextProps {
  title?: string;
  initialValue?: string;
  value?: string; // 👈 agregar esta prop
  disabled?: boolean;
  placeholder?: string;
  onChange?: (value: string) => void;
}

const InputText = ({
  title = "Soy un título",
  initialValue = "",
  value,
  disabled = false,
  placeholder,
  onChange = () => {},
}: InputTextProps) => {
  const [internalValue, setInternalValue] = useState(initialValue);

  const debouncedChange = debounce((val: string) => {
    onChange(val);
  }, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    debouncedChange(newValue);
  };

  useEffect(() => {
    // Mantener sincronización con el valor externo si se provee
    if (typeof value === "string") {
      setInternalValue(value);
    }
  }, [value]);

  return (
    // El dimensionado va en una clase y no en un estilo en linea porque
    // depende del eje del contenedor: en escritorio la barra de filtros es una
    // fila y el campo debe crecer a lo ancho, mientras que en celular es una
    // columna, donde un flex-basis se interpreta como alto y dejaba un hueco
    // vacio debajo del campo. Ver .input-text-block en styles/responsive.css.
    <div className="input-text-block">
      <TextField
        label={title}
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        sx={{
          width: "100%",
          "& .MuiOutlinedInput-input": {
            padding: "0.5rem",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderRadius: "24px",
          },
          "& .MuiInputLabel-root": {
            top: "-0.5rem",
          },
          "& .MuiInputLabel-shrink": {
            top: "-0.1rem",
          },
        }}
      />
    </div>
  );
};

export default InputText;
