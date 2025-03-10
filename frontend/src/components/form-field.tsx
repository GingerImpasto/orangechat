interface FormFieldProps {
  htmlFor: string;
  label: string;
  type?: string;
  value: any;
  onChange: (...args: any) => any;
  error?: string;
}

function FormField({
  htmlFor,
  label,
  type = "text",
  value,
  onChange = () => {},
  error = "",
}: FormFieldProps) {
  return (
    <>
      <label className="login-label" htmlFor={htmlFor}>
        {label}
      </label>
      <input
        onChange={(e) => {
          onChange(e);
        }}
        type={type}
        value={value}
        name={htmlFor}
        className="login-input"
      />
      {error && <div className="login-error">{error}</div>}
    </>
  );
}

export default FormField;
