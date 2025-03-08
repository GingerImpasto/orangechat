import { useState } from "react";
import FormField from "../components/form-field";

function Login() {
  const [action, setAction] = useState("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setFormData((form) => ({
      ...form,
      [field]: event.target.value,
    }));
  };

  return (
    <>
      <div className="login-page">
        <button
          className="login-toggle-button"
          onClick={() => setAction(action === "login" ? "register" : "login")}
        >
          {action === "login" ? "Sign up" : "Login"}
        </button>
        <h2 className="login-whisperchat-welcome">Welcome to Whisperchat</h2>
        <h3 className="login-whisperchat-subtext">
          {action === "login"
            ? "Login to chat with friends!"
            : "Create an account to connect with friends!"}
        </h3>
        <form className="login-form">
          <FormField
            htmlFor="email"
            label="Email"
            type="text"
            value={formData.email}
            onChange={(e) => {
              handleInputChange(e, "email");
            }}
          />
          <FormField
            htmlFor="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange(e, "password")}
          />
          {action !== "login" ? (
            <>
              <FormField
                htmlFor="firstName"
                label="First name"
                type="text"
                value={formData.firstName}
                onChange={(e) => {
                  handleInputChange(e, "firstName");
                }}
              />
              <FormField
                htmlFor="lastName"
                label="Last Name"
                type="text"
                value={formData.lastName}
                onChange={(e) => {
                  handleInputChange(e, "lastName");
                }}
              />
            </>
          ) : (
            ""
          )}

          <input
            type="submit"
            value={action === "login" ? "Sign In" : "Create account"}
            className="login-submit-button"
          />
        </form>
      </div>
    </>
  );
}

export default Login;
