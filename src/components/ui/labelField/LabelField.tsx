interface LabelFieldProps {
  label: string;
  required?: boolean;
  children?: React.ReactNode;
  className?: string;
  showError?: boolean;
  errorMessage?: string;
}

const LabelField = ({
  label,
  required = false,
  className = "",
  children,
  showError = false,
  errorMessage,
}: LabelFieldProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label
        className={`input-title ${className}`}
        htmlFor={`input-field-${label}`}
      >
        {label} {required && <span className="required">*</span>}
        {children}
        {showError && errorMessage && (
          <span className="text-red-500 text-sm">{errorMessage}</span>
        )}
      </label>
    </div>
  );
};
export default LabelField;
