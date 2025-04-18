import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router";
import FormField from "../components/FormField";
import {
  validateEmail,
  validatePassword,
  validateName,
} from "../utils/validators";
import { useAuth } from "../context/AuthContext";
import "../login.css";

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

function Login() {
  const [action, setAction] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const navigate = useNavigate();
  const { token, login } = useAuth();

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setFormData((form) => ({
      ...form,
      [field]: event.target.value,
    }));

    let error: string | undefined;
    switch (field) {
      case "email":
        error = validateEmail(event.target.value);
        break;
      case "password":
        error = validatePassword(event.target.value);
        break;
      case "firstName":
        error = validateName(event.target.value, "First name");
        break;
      case "lastName":
        error = validateName(event.target.value, "Last name");
        break;
      default:
        break;
    }

    setErrors({
      ...errors,
      [field]: error,
    });
  };

  const isFormValid = (): boolean => {
    if (action === "login") {
      return (
        !validateEmail(formData.email) && !validatePassword(formData.password)
      );
    } else {
      return (
        !validateEmail(formData.email) &&
        !validatePassword(formData.password) &&
        !validateName(formData.firstName, "First name") &&
        !validateName(formData.lastName, "Last name")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (isFormValid()) {
      try {
        const response = await fetch(
          `/login/submit-${action === "login" ? "login" : "signup"}-form`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
            credentials: "include",
          }
        );

        const result = await response.json();

        if (response.ok) {
          login(result.token, result.user);
          navigate("/");
        } else {
          setErrors({
            ...errors,
            ["email"]: result.error,
          });
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {}, [errors]);

  const buttonText: string = isLoading
    ? action === "login"
      ? "Logging in..."
      : "Creating account..."
    : action === "login"
    ? "Sign In"
    : "Sign Up";

  if (token) {
    return <Navigate to="/" />;
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Orange Chat</h1>
          <p className="login-subtitle">
            {action === "login" ? "Sign in to continue" : "Create your account"}
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {action === "register" && (
            <div className="name-fields">
              <FormField
                htmlFor="firstName"
                label="First Name"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange(e, "firstName")}
                error={errors.firstName}
                placeholder="Enter your first name"
              />
              <FormField
                htmlFor="lastName"
                label="Last Name"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange(e, "lastName")}
                error={errors.lastName}
                placeholder="Enter your last name"
              />
            </div>
          )}

          <FormField
            htmlFor="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange(e, "email")}
            error={errors.email}
            placeholder="Enter your email"
          />

          <FormField
            htmlFor="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange(e, "password")}
            error={errors.password}
            placeholder="Enter your password"
          />

          <button
            type="submit"
            className={`login-button ${isLoading ? "loading" : ""}`}
            disabled={!isFormValid() || isLoading}
          >
            {buttonText}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {action === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
            <button
              type="button"
              className="login-toggle-button"
              onClick={() =>
                setAction(action === "login" ? "register" : "login")
              }
            >
              {action === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
