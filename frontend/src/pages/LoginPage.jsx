import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ErrorBanner } from "../components/Feedback";

export default function LoginPage() {
  const { isAuthenticated, user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={user.role === "agent" ? "/agent" : "/dashboard"} replace />;
  }

  const onChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.email.trim() || !form.password) {
      setError("Email and password are required.");
      return;
    }
    setSubmitting(true);
    try {
      const nextUser = await login(form.email, form.password);
      navigate(nextUser.role === "agent" ? "/agent" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <form className="card auth-card" onSubmit={onSubmit}>
        <p className="eyebrow">Support Desk</p>
        <h1>Sign in</h1>
        <p className="muted">Customers and agents use the same portal.</p>
        <ErrorBanner message={error} />
        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={onChange}
            required
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={onChange}
            required
          />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>
        <p className="muted">
          New customer? <Link to="/register">Create an account</Link>
        </p>
        <div className="hint">
          Demo agent: agent@example.com / Password123!
        </div>
      </form>
    </div>
  );
}
