import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { ErrorBanner } from "../components/Feedback";

const initial = {
  subject: "",
  description: "",
  priority: "medium"
};

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.subject.trim() || !form.description.trim()) {
      setError("Subject and description are required.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post("/api/tickets", {
        subject: form.subject.trim(),
        description: form.description.trim(),
        priority: form.priority
      });
      navigate(`/tickets/${data.ticketId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create the ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="narrow">
      <p className="eyebrow">New request</p>
      <h1>Create a support ticket</h1>
      <form className="card form-card" onSubmit={onSubmit}>
        <ErrorBanner message={error} />
        <label>
          Subject
          <input name="subject" value={form.subject} onChange={onChange} required />
        </label>
        <label>
          Description
          <textarea
            name="description"
            rows="6"
            value={form.description}
            onChange={onChange}
            required
          />
        </label>
        <label>
          Priority
          <select name="priority" value={form.priority} onChange={onChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit ticket"}
        </button>
      </form>
    </section>
  );
}
