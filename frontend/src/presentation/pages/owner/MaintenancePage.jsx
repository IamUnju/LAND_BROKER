import { useState, useEffect } from "react";
import api from "../../../infrastructure/api";
import Badge from "../../components/Badge";
import toast from "react-hot-toast";
import { HiOutlineCog } from "react-icons/hi";

export default function MaintenancePage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/maintenance").then(({ data }) => { setRequests(data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try { await api.patch(`/maintenance/${id}/status`, { status }); toast.success("Updated"); load(); }
    catch (e) { toast.error(e.response?.data?.detail || "Error"); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Maintenance Requests</h2>
      {loading ? <p className="text-gray-400">Loading…</p> : (
        <div className="card p-0 overflow-x-auto">
          <table className="min-w-[820px] w-full divide-y divide-gray-200">
            <thead><tr>{["Title", "Priority", "Status", "Unit", "Created", "Actions"].map((h) => <th key={h} className="table-header px-4 py-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{r.title}</td>
                  <td className="px-4 py-3"><Badge status={r.priority} /></td>
                  <td className="px-4 py-3"><Badge status={r.status} /></td>
                  <td className="px-4 py-3 text-sm">{r.unit_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{r.created_at?.slice(0, 10)}</td>
                  <td className="px-4 py-3">
                    <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} className="input text-xs py-1">
                      <option value="PENDING">PENDING</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
