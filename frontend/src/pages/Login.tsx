import { useEffect, useState } from "react";
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

  useEffect(() => {}, []);

  const fetchAPIData = () => {
    fetch("http://localhost:5000/users/test")
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error("Error fetching data:", error));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/users/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Success:", result);
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
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
        <button className="api-test-button" onClick={() => fetchAPIData()}>
          Call API
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

          <button type="submit" className="login-submit-button">
            {action === "login" ? "Sign In" : "Create account"}
          </button>
        </form>
      </div>
    </>
  );
}

export default Login;
