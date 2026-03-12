import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    phone: "",
  });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      toast.success("Account created successfully");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="customer">Customer</option>
              <option value="owner">Restaurant Owner</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Register
          </button>
        </form>
        <p className="mt-2 text-center">
          Already have an account? <Link to="/login">Login</Link>
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
