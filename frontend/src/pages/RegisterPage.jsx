import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ErrorBanner } from "../components/Feedback";

const initial = { name: "", email: "", password: "", confirm: "" };

export default function RegisterPage() {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Name, email and password are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password
      });
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to register.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <form className="card auth-card" onSubmit={onSubmit}>
        <p className="eyebrow">New customer</p>
        <h1>Create account</h1>
        <ErrorBanner message={error} />
        <label>
          Full name
          <input name="name" value={form.name} onChange={onChange} required />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={onChange} required />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={onChange} required />
        </label>
        <label>
          Confirm password
          <input name="confirm" type="password" value={form.confirm} onChange={onChange} required />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Register"}
        </button>
        <p className="muted">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
