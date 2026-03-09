import { useState, useEffect } from "react";
import api from "../../../infrastructure/api";
import Badge from "../../components/Badge";

export default function TenantPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/payments/").then(({ data }) => { setPayments(data); setLoading(false); }).catch(() => setLoading(false)); }, []);
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">My Payments</h2>
      {loading ? <p className="text-gray-400">Loading…</p> : (
        <div className="card p-0 overflow-x-auto">
          <table className="min-w-[720px] w-full divide-y divide-gray-200">
            <thead><tr>{["Due Date", "Amount", "Status", "Paid On", "Method"].map((h) => <th key={h} className="table-header px-4 py-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{p.due_date}</td>
                  <td className="px-4 py-3 text-sm font-medium">${Number(p.amount).toLocaleString()}</td>
                  <td className="px-4 py-3"><Badge status={p.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.paid_date ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.payment_method ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
