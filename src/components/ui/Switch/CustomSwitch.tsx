import style from "./CustomSwitch.module.css";

interface CustomSwitchProps {
  title: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  customClass?: string;
}

export const CustomSwitch: React.FC<CustomSwitchProps> = ({
  title,
  checked,
  onChange,
  required,
  customClass,
}) => {
  const options = [
    { label: "Sí", value: true },
    { label: "No", value: false },
  ];

  return (
    <div className={`${style.customSwitchContainer} ${customClass}`}>
      <span className="input-title">
        {title}
        {required && <span className="required">*</span>}
      </span>
      <div className={`${style.switchContainerShort}`}>
        {options.map((option) => (
          <button
            key={option.label}
            onClick={() => onChange(option.value)}
            className={`${style.btnSwitchShort} ${
              checked === option.value ? style.active : ""
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
