import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";

const nameRegex = /^[a-zA-Z\s]{2,50}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = (field, value) => {
    const newErrors = { ...errors };

    if (field === "name") {
      if (!value) newErrors.name = "Name is required";
      else if (!nameRegex.test(value)) newErrors.name = "Name must be 2-50 letters only";
      else delete newErrors.name;
    }
    if (field === "email") {
      if (!value) newErrors.email = "Email is required";
      else if (!emailRegex.test(value)) newErrors.email = "Please enter a valid email address";
      else delete newErrors.email;
    }
    if (field === "password") {
      if (!value) newErrors.password = "Password is required";
      else if (!passwordRegex.test(value)) newErrors.password = "Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char";
      else delete newErrors.password;
    }
    if (field === "phone") {
      if (value && !phoneRegex.test(value)) newErrors.phone = "Please enter a valid phone number";
      else delete newErrors.phone;
    }

    setErrors(newErrors);
    return !newErrors[field];
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate(field, form[field]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) validate(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, phone: true });
    const v1 = validate("name", form.name);
    const v2 = validate("email", form.email);
    const v3 = validate("password", form.password);
    const v4 = validate("phone", form.phone);
    if (!v1 || !v2 || !v3 || !v4) return;

    try {
      await register(form);
      toast.success("Account created successfully");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Name</label>
            <input
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              onBlur={() => handleBlur("name")}
              className={touched.name && errors.name ? "input-error" : ""}
            />
            {touched.name && errors.name && <span className="error-text">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              onBlur={() => handleBlur("email")}
              className={touched.email && errors.email ? "input-error" : ""}
            />
            {touched.email && errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              onBlur={() => handleBlur("password")}
              className={touched.password && errors.password ? "input-error" : ""}
            />
            {touched.password && errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              name="phone"
              placeholder="e.g. +1 (555) 123-4567"
              value={form.phone}
              onChange={handleChange}
              onBlur={() => handleBlur("phone")}
              className={touched.phone && errors.phone ? "input-error" : ""}
            />
            {touched.phone && errors.phone && <span className="error-text">{errors.phone}</span>}
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
    </div>
  );
}
