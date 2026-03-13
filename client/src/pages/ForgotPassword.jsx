import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [touchedEmail, setTouchedEmail] = useState(false);

  const validateEmail = (value) => {
    if (!value) {
      setError("Email is required");
      return false;
    }
    if (!emailRegex.test(value)) {
      setError("Please enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  const handleBlur = () => {
    setTouchedEmail(true);
    validateEmail(email);
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (touchedEmail) validateEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouchedEmail(true);
    if (!validateEmail(email)) return;

    setSubmitted(true);
    toast.success("If an account exists with that email, a reset link has been sent.");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        {submitted ? (
          <div className="text-center">
            <p style={{ marginBottom: "1rem" }}>
              If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: "100%" }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-center" style={{ marginBottom: "1.5rem", color: "rgba(255,255,255,0.8)" }}>
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={touchedEmail && error ? "input-error" : ""}
                />
                {touchedEmail && error && <span className="error-text">{error}</span>}
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                Send Reset Link
              </button>
            </form>
          </>
        )}
        <p className="mt-2 text-center">
          Remember your password? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
