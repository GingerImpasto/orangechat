function Login() {
  return (
    <>
      <div className="login-page">
        <h2 className="login-whisperchat-welcome">Welcome to Whisperchat</h2>
        <h3 className="login-whisperchat-subtext">
          Login to chat with friends!
        </h3>
        <form className="login-form">
          <label className="login-email-label">Email</label>
          <input className="login-email-input" type="text"></input>
          <label className="login-password-label">Password</label>
          <input className="login-password-input" type="password"></input>
        </form>
      </div>
    </>
  );
}

export default Login;
