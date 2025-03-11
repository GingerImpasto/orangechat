import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router";
import FormField from "../components/form-field";
import {
  validateEmail,
  validatePassword,
  validateName,
} from "../utils/validators";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import "../login.css";

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

function Login() {
  const [action, setAction] = useState("login");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login, setUser } = useAuth();

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

    if (isFormValid()) {
      // Form is valid, proceed with submission
      console.log("Form is valid, submitting...", formData);
      // Add your submission logic here

      try {
        const response = await fetch(
          `http://localhost:5000/login/submit-${
            action === "login" ? "login" : "signup"
          }-form`,
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
          console.log("Success:", result);
          login();
          setUser(result.user);
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
      }
    } else {
      // Form is invalid, show error messages
      console.error("Form is invalid");
    }
  };

  useEffect(() => {}, [errors]); // This effect runs whenever `errors` changes

  if (isLoading) {
    return <Loader />; // Show the loader while checking authentication
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
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
        <h2 className="login-whisperchat-welcome">Welcome to Whisperchat</h2>
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
            disabled={!isFormValid()}
          >
            {action === "login" ? "Sign In" : "Create account"}
          </button>
        </form>
      </div>
    </>
  );
}

export default Login;
