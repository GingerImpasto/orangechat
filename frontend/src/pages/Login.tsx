import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router";
import FormField from "../components/form-field";
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
  const [action, setAction] = useState("login");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  //const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

    // Validate the field and update errors
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

    // Update the errors state
    setErrors({
      ...errors,
      [field]: error,
    });
  };

  // Check if the form is valid before submission
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
      // Form is valid, proceed with submission
      // Add your submission logic here

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
          // Handle bad request (e.g., user already exists)
          console.error(result.error);

          setErrors({
            ...errors,
            ["email"]: result.error,
          });

          return { success: false, message: result.error };
        }
      } catch (error) {
        console.log("has error");
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Form is invalid, show error messages
      console.error("Form is invalid");
    }
  };

  useEffect(() => {}, [errors]); // This effect runs whenever `errors` changes

  const buttonText: string = isLoading
    ? "Logging in..."
    : action === "login"
    ? "Sign In"
    : "Create account";

  // Redirect to home if already logged in
  if (token) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <div className="login-page">
        <button
          className="login-toggle-button"
          onClick={() => setAction(action === "login" ? "register" : "login")}
        >
          {action === "login" ? "Sign up" : "Login"}
        </button>
        <h2 className="login-whisperchat-welcome">Welcome to Orange Chat</h2>
        <h3 className="login-whisperchat-subtext">
          {action === "login"
            ? "Login to chat with friends!"
            : "Create an account to connect with friends!"}
        </h3>
        <form className="login-form" onSubmit={handleSubmit}>
          <FormField
            htmlFor="email"
            label="Email"
            type="text"
            value={formData.email}
            onChange={(e) => {
              handleInputChange(e, "email");
            }}
            error={errors.email}
          />
          <FormField
            htmlFor="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange(e, "password")}
            error={errors.password}
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
                error={errors.firstName}
              />
              <FormField
                htmlFor="lastName"
                label="Last Name"
                type="text"
                value={formData.lastName}
                onChange={(e) => {
                  handleInputChange(e, "lastName");
                }}
                error={errors.lastName}
              />
            </>
          ) : (
            ""
          )}

          <button
            type="submit"
            className="login-submit-button"
            disabled={!isFormValid() || isLoading}
          >
            {buttonText}
          </button>
        </form>
      </div>
    </>
  );
}

export default Login;
