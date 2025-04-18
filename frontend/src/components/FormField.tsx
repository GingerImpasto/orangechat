interface FormFieldProps {
  htmlFor: string;
  label: string;
  type?: string;
  value: any;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
}

function FormField({
  htmlFor,
  label,
  type = "text",
  value,
  onChange,
  error = "",
  placeholder,
  required = false,
}: FormFieldProps) {
  return (
    <div className={`form-field ${error ? "error" : ""}`}>
      <div className="label-container">
        <label className="form-label" htmlFor={htmlFor}>
          {label}
        </label>
        {required && <span className="required-indicator">*</span>}
      </div>
      <input
        id={htmlFor}
        type={type}
        value={value}
        onChange={onChange}
        className={`form-input ${error ? "input-error" : ""}`}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${htmlFor}-error` : undefined}
      />
      {error && (
        <div id={`${htmlFor}-error`} className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}

export default FormField;
