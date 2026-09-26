import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import TicketTable from "../components/TicketTable";
import { EmptyState, ErrorBanner, Spinner } from "../components/Feedback";

export default function CustomerDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/api/tickets");
        if (active) setTickets(data);
      } catch (err) {
        if (active) setError(err.response?.data?.message || "Could not load tickets.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchesSearch =
        !term ||
        ticket.subject.toLowerCase().includes(term) ||
        ticket.description.toLowerCase().includes(term);
      const matchesStatus = !status || ticket.status === status;
      const matchesPriority = !priority || ticket.priority === priority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, search, status, priority]);

  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">Customer</p>
          <h1>Your tickets</h1>
        </div>
        <Link className="button-link" to="/tickets/new">
          Raise a ticket
        </Link>
      </div>
      <div className="filters">
        <input
          placeholder="Search subject or description"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select value={priority} onChange={(event) => setPriority(event.target.value)}>
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <ErrorBanner message={error} />
      {loading ? (
        <Spinner label="Loading your tickets..." />
      ) : visible.length === 0 ? (
        <EmptyState
          title="No tickets yet"
          text="Create a ticket when you need help from the support team."
        />
      ) : (
        <TicketTable tickets={visible} />
      )}
    </section>
  );
}
