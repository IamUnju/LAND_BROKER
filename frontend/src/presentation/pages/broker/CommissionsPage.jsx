import { useState, useEffect } from "react";
import api from "../../../infrastructure/api";
import Badge from "../../components/Badge";
import { useAuth } from "../../../context/AuthContext";

export default function CommissionsPage() {
  const { user } = useAuth();
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    api.get(`/commissions/broker/${user.id}`).then(({ data }) => {
      setCommissions(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user?.id]);

  const total = commissions.reduce((s, c) => s + Number(c.commission_amount ?? 0), 0);
  const paid = commissions.filter((c) => c.status === "PAID").reduce((s, c) => s + Number(c.commission_amount ?? 0), 0);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">My Commissions</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card"><p className="text-sm text-gray-500">Total Earned</p><p className="text-2xl font-bold text-primary-700">${total.toLocaleString()}</p></div>
        <div className="card"><p className="text-sm text-gray-500">Total Paid Out</p><p className="text-2xl font-bold text-green-700">${paid.toLocaleString()}</p></div>
      </div>
      {loading ? <p className="text-gray-400">Loading…</p> : (
        <div className="card p-0 overflow-x-auto">
          <table className="min-w-[760px] w-full divide-y divide-gray-200">
            <thead><tr>{["Property", "Rate", "Amount", "Status", "Paid Date"].map((h) => <th key={h} className="table-header px-4 py-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {commissions.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{c.property_id}</td>
                  <td className="px-4 py-3 text-sm">{c.commission_rate}%</td>
                  <td className="px-4 py-3 text-sm font-medium">${Number(c.commission_amount ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3"><Badge status={c.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{c.paid_date ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
