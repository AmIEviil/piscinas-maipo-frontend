import { type ReactNode } from "react";
import "./InputText.css";
import EyeIcon from "../Icons/EyeIcon";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

interface InputTextProps {
  title?: string;
  caption?: string;
  value?: string | number;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
  require?: boolean;
  maxLength?: number;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  icon?: ReactNode;
  customClass?: string;
  customClassTitle?: string;
  customClassContainer?: string;
  /** Muestra botones - y + a los costados del input. Solo con type="number". */
  showButtons?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

const CustomInputText = ({
  title = "",
  value = "",
  disabled = false,
  type = "text",
  placeholder,
  require = false,
  maxLength,
  onChange = () => {},
  onBlur = () => {},
  icon,
  customClass = "",
  customClassTitle = "",
  customClassContainer = "",
  showButtons = false,
  min,
  max,
  step = 1,
}: InputTextProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.value);
    }
  };

  const isPasswordType = type === "password";
  const withStepper = type === "number" && showButtons;

  // El valor puede venir vacio mientras el usuario escribe: en ese caso los
  // botones parten desde min (o 0) en vez de quedar bloqueados.
  const numericValue = Number(value);
  const currentValue = Number.isFinite(numericValue)
    ? numericValue
    : (min ?? 0);

  const clamp = (next: number) => {
    let result = next;
    if (min !== undefined && result < min) result = min;
    if (max !== undefined && result > max) result = max;
    return result;
  };

  const handleStep = (direction: 1 | -1) => {
    if (disabled) return;
    onChange(String(clamp(currentValue + direction * step)));
  };

  const decrementDisabled =
    disabled || (min !== undefined && currentValue <= min);
  const incrementDisabled =
    disabled || (max !== undefined && currentValue >= max);

  const handleSeePassword = () => {
    const inputField = document.getElementById(
      `input-field-${title}`,
    ) as HTMLInputElement;
    if (isPasswordType && inputField.type === "password") {
      inputField.type = "text";
    } else {
      inputField.type = "password";
    }
  };

  const handleIconClick = () => {
    if (type === "password") {
      handleSeePassword();
    }
  };

  return (
    <div
      className={`input-text-container ${customClassContainer} ${
        disabled ? "disabled-container" : ""
      }`}
    >
      {title && (
        <div className={`title-container ${customClassTitle}`}>
          <label className="input-title" htmlFor={`input-field-${title}`}>
            {title} {require && <span className="required">*</span>}
          </label>
        </div>
      )}
      <div className={`input-wrapper ${withStepper ? "with-stepper" : ""}`}>
        {icon && <span className="input-icon">{icon}</span>}
        <input
          className={`input-field ${customClass} ${
            disabled ? "disabled" : ""
          } ${icon ? "with-icon" : "pl-2!"} ${
            withStepper ? "stepper-input" : ""
          }`}
          type={type}
          id={`input-field-${title}`}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          onBlur={onBlur}
          maxLength={maxLength}
          min={min}
          max={max}
          step={withStepper ? step : undefined}
        />
        {isPasswordType && (
          <span className="input-icon-password" onClick={handleIconClick}>
            <EyeIcon size={16} color={disabled ? "#A0A0A0" : "#131313"} />
          </span>
        )}
        {withStepper && (
          <div className="stepper-buttons">
            <button
              type="button"
              className="stepper-button"
              onClick={() => handleStep(1)}
              disabled={incrementDisabled}
              aria-label="Aumentar"
              tabIndex={-1}
            >
              <AddIcon fontSize="inherit" />
            </button>
            <button
              type="button"
              className="stepper-button"
              onClick={() => handleStep(-1)}
              disabled={decrementDisabled}
              aria-label="Disminuir"
              tabIndex={-1}
            >
              <RemoveIcon fontSize="inherit" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomInputText;
