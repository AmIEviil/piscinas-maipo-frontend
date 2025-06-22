import { useState, useEffect, type ReactNode } from "react";
import "./InputText.css";

interface InputTextProps {
  title?: string;
  caption?: string;
  initialValue?: string | number;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
  require?: boolean;
  onChange?: (value: string) => void;
  icon?: ReactNode; // Nuevo: ícono al inicio
}

const CustomInputText = ({
  title = "Soy un título",
  initialValue = "",
  disabled = false,
  type = "text",
  placeholder,
  onChange = () => {},
  require = true,
  icon, // Nuevo
}: InputTextProps) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    onChange(String(value));
  }, [value, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      setValue(e.target.value);
      onChange(e.target.value);
    }
  };

  return (
    <div
      className={`input-text-container ${disabled ? "disabled-container" : ""}`}
    >
      <div className="title-container">
        <label className="input-title" htmlFor={`input-field-${title}`}>
          {title} {require && <span className="required">*</span>}
        </label>
      </div>
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          className={`input-field ${disabled ? "disabled" : ""} ${
            icon ? "with-icon" : ""
          }`}
          type={type}
          id={`input-field-${title}`}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default CustomInputText;
