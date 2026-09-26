import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { ErrorBanner, PriorityBadge, Spinner, StatusBadge } from "../components/Feedback";

export default function TicketDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [agents, setAgents] = useState([]);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const requests = [
        api.get(`/api/tickets/${id}`),
        api.get(`/api/tickets/${id}/comments`)
      ];
      if (user.role === "agent") {
        requests.push(api.get("/api/users/agents"));
      }
      const [ticketRes, commentRes, agentRes] = await Promise.all(requests);
      setTicket(ticketRes.data);
      setComments(commentRes.data);
      setStatus(ticketRes.data.status);
      setPriority(ticketRes.data.priority);
      setAssignedTo(ticketRes.data.assigned_to || "");
      if (agentRes) setAgents(agentRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load this ticket.");
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user.role]);

  const saveTicket = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");
    try {
      await api.put(`/api/tickets/${id}`, {
        status,
        priority,
        assigned_to: assignedTo || null
      });
      setNotice("Ticket updated.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const addComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) {
      setError("Write a comment before sending.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.post(`/api/tickets/${id}/comments`, { comment: comment.trim() });
      setComment("");
      const { data } = await api.get(`/api/tickets/${id}/comments`);
      setComments(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not add the comment.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner label="Opening ticket..." />;

  if (!ticket) return <ErrorBanner message={error || "Ticket not found."} />;

  return (
    <section className="detail-grid">
      <div>
        <p className="eyebrow">Ticket #{ticket.id}</p>
        <h1>{ticket.subject}</h1>
        <div className="meta-row">
          <StatusBadge value={ticket.status} />
          <PriorityBadge value={ticket.priority} />
          <span>{ticket.user_name}</span>
          <span>{ticket.user_email}</span>
        </div>
        <article className="card">
          <h2>Description</h2>
          <p className="body-copy">{ticket.description}</p>
        </article>
        <article className="card">
          <h2>Conversation</h2>
          {comments.length === 0 ? (
            <p className="muted">No comments yet.</p>
          ) : (
            <ol className="comments">
              {comments.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.user_name}</strong>
                    <span className="role-chip">{item.role}</span>
                  </div>
                  <p>{item.comment}</p>
                  <time>{new Date(item.created_at).toLocaleString()}</time>
                </li>
              ))}
            </ol>
          )}
          <form onSubmit={addComment} className="stack">
            <label>
              Add a comment
              <textarea
                rows="4"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
            </label>
            <button type="submit" disabled={saving}>
              {saving ? "Sending..." : "Post comment"}
            </button>
          </form>
        </article>
      </div>
      <aside>
        <ErrorBanner message={error} />
        {notice && <div className="banner success">{notice}</div>}
        <article className="card">
          <h2>Details</h2>
          <p>
            <strong>Opened</strong>
            <br />
            {new Date(ticket.created_at).toLocaleString()}
          </p>
          <p>
            <strong>Assigned to</strong>
            <br />
            {ticket.assigned_to_name || "Unassigned"}
          </p>
        </article>
        {user.role === "agent" && (
          <form className="card stack" onSubmit={saveTicket}>
            <h2>Agent actions</h2>
            <label>
              Status
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            <label>
              Priority
              <select value={priority} onChange={(event) => setPriority(event.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label>
              Assign to
              <select value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)}>
                <option value="">Unassigned</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        )}
      </aside>
    </section>
  );
}
