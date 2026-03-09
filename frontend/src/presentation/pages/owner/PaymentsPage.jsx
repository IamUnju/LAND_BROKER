import { useState, useEffect } from "react";
import api from "../../../infrastructure/api";
import Badge from "../../components/Badge";
import toast from "react-hot-toast";
import { HiOutlineCheck } from "react-icons/hi";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/payments/").then(({ data }) => { setPayments(data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const markPaid = async (id) => {
    try {
      await api.patch(`/payments/${id}/pay`, {
        payment_date: new Date().toISOString().slice(0, 10),
        payment_method: "BANK_TRANSFER",
        reference_number: "MANUAL",
      });
      toast.success("Marked as paid");
      load();
    } catch (e) { toast.error(e.response?.data?.detail || "Error"); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Payments</h2>
      {loading ? <p className="text-gray-400">Loading…</p> : (
        <div className="card p-0 overflow-x-auto">
          <table className="min-w-[820px] w-full divide-y divide-gray-200">
            <thead><tr>{["Lease #", "Due Date", "Amount", "Status", "Paid On", "Actions"].map((h) => <th key={h} className="table-header px-4 py-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{p.lease_id}</td>
                  <td className="px-4 py-3 text-sm">{p.due_date}</td>
                  <td className="px-4 py-3 text-sm font-medium">${Number(p.amount).toLocaleString()}</td>
                  <td className="px-4 py-3"><Badge status={p.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.paid_date ?? "—"}</td>
                  <td className="px-4 py-3">
                    {p.status === "PENDING" && (
                      <button onClick={() => markPaid(p.id)} className="btn-secondary py-1 px-2 text-xs inline-flex items-center gap-1 whitespace-nowrap"><HiOutlineCheck />Mark Paid</button>
                    )}
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
