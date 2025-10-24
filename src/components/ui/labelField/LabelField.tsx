interface LabelFieldProps {
  label: string;
  required?: boolean;
  className?: string;
}

const LabelField = ({
  label,
  required = false,
  className = "",
}: LabelFieldProps) => {
  return (
    <label
      className={`input-title ${className}`}
      htmlFor={`input-field-${label}`}
    >
      {label} {required && <span className="required">*</span>}
    </label>
  );
};
export default LabelField;
