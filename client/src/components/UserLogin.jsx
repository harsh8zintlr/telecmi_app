import React, { useState } from "react";
import { userLogin, generateToken } from "../api/telecmi";

const UserLogin = () => {
  const [loginData, setLoginData] = useState({
    id: "",
    password: "",
  });
  const [tokenData, setTokenData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loginResult, setLoginResult] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setLoginResult(null);

    try {
      const response = await userLogin(loginData);
      setLoginResult(response.data);
      setSuccess("Login successful! Token saved.");
      if (response.data.token) {
        localStorage.setItem("userToken", response.data.token);
        localStorage.setItem("userId", response.data.agent?.id || loginData.id);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await generateToken(tokenData);
      setSuccess("Token generated successfully!");
      setLoginResult(response.data);
      // Save admin secret to localStorage if available
      if (response.data.secret) {
        localStorage.setItem("adminSecret", response.data.secret);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2>User Login</h2>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>User ID *</label>
            <input
              type="text"
              value={loginData.id}
              onChange={(e) =>
                setLoginData({ ...loginData, id: e.target.value })
              }
              required
              placeholder="Enter user ID (You can get it from Users Panel)"
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              required
              placeholder="Enter password (Password you entered while creating user)"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {loginResult && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              background: "#f8f9fa",
              borderRadius: "5px",
            }}
          >
            <h3>Login Result:</h3>
            <pre
              style={{
                background: "white",
                padding: "10px",
                borderRadius: "5px",
                overflow: "auto",
              }}
            >
              {JSON.stringify(loginResult, null, 2)}
            </pre>
            {loginResult.token && (
              <div style={{ marginTop: "10px" }}>
                <strong>Token:</strong> <code>{loginResult.token}</code>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Generate Admin Token</h2>
        <p>Generate an admin secret token using app credentials</p>

        <form onSubmit={handleGenerateToken}>
          <button
            type="submit"
            className="btn btn-secondary"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Token"}
          </button>
        </form>

        {loginResult && loginResult.secret && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              background: "#f8f9fa",
              borderRadius: "5px",
            }}
          >
            <h3>Token Result:</h3>
            <pre
              style={{
                background: "white",
                padding: "10px",
                borderRadius: "5px",
                overflow: "auto",
              }}
            >
              {JSON.stringify(loginResult, null, 2)}
            </pre>
            <div style={{ marginTop: "10px" }}>
              <strong>Secret:</strong> <code>{loginResult.secret}</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserLogin;
