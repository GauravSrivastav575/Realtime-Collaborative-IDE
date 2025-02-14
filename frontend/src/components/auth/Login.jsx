import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import './Login.css'; // Make sure this line is at the top
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleSubmit = async (e) => {
    console.log(import.meta.env.VITE_BACKEND_URL);
    e.preventDefault();
    setLoading(true);
    try {
      console.log("email", email);
      console.log("password", password);
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token); // Save token in localStorage
      localStorage.setItem('userId', response.data.user.id); // Save token in localStorage
      localStorage.setItem('username', response.data.user.username); // Save token in localStorage
      alert("Login Successful!");
      navigate("/"); // Navigate to the editor page after successful login
    } catch (error) {
      alert(error.response?.data?.message || "Login Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-header">Login</h2>

        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Please wait..." : "Login"}
        </button>

        <p className="footer-text">
          Don't have an account? <a href="/signup">Signup</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
