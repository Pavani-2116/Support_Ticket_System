import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import TicketTable from "../components/TicketTable";
import { EmptyState, ErrorBanner, Spinner } from "../components/Feedback";

export default function AgentDashboard() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState("desc");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const params = { sort, order };
        if (search.trim()) params.search = search.trim();
        if (status) params.status = status;
        if (priority) params.priority = priority;
        const [ticketRes, statsRes] = await Promise.all([
          api.get("/api/tickets", { params }),
          api.get("/api/tickets/stats")
        ]);
        if (active) {
          setTickets(ticketRes.data);
          setStats(statsRes.data);
        }
      } catch (err) {
        if (active) setError(err.response?.data?.message || "Could not load the queue.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [search, status, priority, sort, order]);

  const statusCount = useMemo(() => {
    const map = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    (stats?.byStatus || []).forEach((row) => {
      map[row.status] = Number(row.count);
    });
    return map;
  }, [stats]);

  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">Support agent</p>
          <h1>Ticket queue</h1>
        </div>
      </div>
      <div className="stats">
        <article>
          <span>Total</span>
          <strong>{stats?.total ?? 0}</strong>
        </article>
        <article>
          <span>Open</span>
          <strong>{statusCount.open}</strong>
        </article>
        <article>
          <span>In progress</span>
          <strong>{statusCount.in_progress}</strong>
        </article>
        <article>
          <span>Unassigned</span>
          <strong>{stats?.unassigned ?? 0}</strong>
        </article>
      </div>
      <div className="filters">
        <input
          placeholder="Search tickets"
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
        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="created_at">Sort by created</option>
          <option value="updated_at">Sort by updated</option>
          <option value="priority">Sort by priority</option>
          <option value="status">Sort by status</option>
          <option value="subject">Sort by subject</option>
        </select>
        <select value={order} onChange={(event) => setOrder(event.target.value)}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
      <ErrorBanner message={error} />
      {loading ? (
        <Spinner label="Loading queue..." />
      ) : tickets.length === 0 ? (
        <EmptyState title="Queue is empty" text="No tickets match the current filters." />
      ) : (
        <TicketTable tickets={tickets} />
      )}
    </section>
  );
}
