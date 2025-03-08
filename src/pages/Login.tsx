import FormField from "../components/form-field";

function Login() {
  return (
    <>
      <div className="login-page">
        <h2 className="login-whisperchat-welcome">Welcome to Whisperchat</h2>
        <h3 className="login-whisperchat-subtext">
          Login to chat with friends!
        </h3>
        <form className="login-form">
          <FormField
            htmlFor="email"
            label="Email"
            type="text"
            value={""}
            onChange={() => {}}
          />
          <FormField
            htmlFor="password"
            label="Password"
            type="password"
            value={""}
            onChange={() => {}}
          />
          <input
            type="submit"
            value="Sign In"
            className="login-submit-button"
          />
        </form>
      </div>
    </>
  );
}

export default Login;
