import { Link } from "react-router-dom";
import { PriorityBadge, StatusBadge } from "./Feedback";

export default function TicketTable({ tickets }) {
  if (!tickets.length) {
    return null;
  }

  return (
    <div className="table-wrap">
      <table className="tickets">
        <thead>
          <tr>
            <th>ID</th>
            <th>Subject</th>
            <th>Customer</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Assigned</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>#{ticket.id}</td>
              <td>
                <Link to={`/tickets/${ticket.id}`}>{ticket.subject}</Link>
              </td>
              <td>{ticket.user_name}</td>
              <td>
                <PriorityBadge value={ticket.priority} />
              </td>
              <td>
                <StatusBadge value={ticket.status} />
              </td>
              <td>{ticket.assigned_to_name || "Unassigned"}</td>
              <td>{new Date(ticket.updated_at || ticket.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
