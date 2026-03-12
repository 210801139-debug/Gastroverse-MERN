import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      toast.success("Logged in successfully");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Login
          </button>
        </form>
        <p className="mt-2 text-center">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </div>

      <style>{`
        .auth-page {
          display: flex;
          justify-content: center;
          padding: 3rem 1rem;
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
        }
        .auth-card h2 {
          margin-bottom: 1.5rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
