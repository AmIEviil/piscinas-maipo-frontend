import { type ReactNode } from "react";
import "./InputText.css";

interface InputTextProps {
  title?: string;
  caption?: string;
  value?: string | number;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
  require?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  icon?: ReactNode;
  customClass?: string;
}

const CustomInputText = ({
  title = "Soy un título",
  value = "",
  disabled = false,
  type = "text",
  placeholder,
  onChange = () => {},
  onBlur = () => {},
  require = true,
  icon,
  customClass = "",
}: InputTextProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
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
          className={`input-field ${customClass} ${
            disabled ? "disabled" : ""
          } ${icon ? "with-icon" : "pl-2!"}`}
          type={type}
          id={`input-field-${title}`}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          onBlur={onBlur}
        />
      </div>
    </div>
  );
};

export default CustomInputText;
