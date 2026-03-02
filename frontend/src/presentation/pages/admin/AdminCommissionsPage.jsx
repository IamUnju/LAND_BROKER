import { useState, useEffect } from "react";
import api from "../../../infrastructure/api";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlineCheck, HiOutlineTrash } from "react-icons/hi";

export default function AdminCommissionsPage() {
  const [commissions, setCommissions] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ property_id: "", broker_id: "", commission_rate: "", commission_amount: "" });

  const load = () => {
    api.get("/commissions").then(({ data }) => { setCommissions(Array.isArray(data) ? data : []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([
      api.get("/users/brokers").catch(() => ({ data: { users: [] } })),
      api.get("/properties/?limit=200").catch(() => ({ data: { properties: [] } })),
    ]).then(([br, pr]) => { setBrokers(br.data?.users ?? []); setProperties(pr.data?.properties ?? []); });
    load();
  }, []);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const create = async () => {
    const payload = {
      property_id: Number(form.property_id),
      broker_id: Number(form.broker_id),
      commission_rate: Number(form.commission_rate),
      commission_amount: form.commission_amount ? Number(form.commission_amount) : undefined,
    };
    try {
      await api.post("/commissions", payload);
      toast.success("Commission created");
      setShowCreate(false);
      setForm({ property_id: "", broker_id: "", commission_rate: "", commission_amount: "" });
      load();
    } catch (e) { toast.error(e.response?.data?.detail || "Error"); }
  };

  const pay = async (id) => {
    try { await api.patch(`/commissions/${id}/pay`); toast.success("Marked as paid"); load(); }
    catch (e) { toast.error(e.response?.data?.detail || "Error"); }
  };

  const del = async (id) => {
    if (!confirm("Delete commission?")) return;
    try { await api.delete(`/commissions/${id}`); toast.success("Deleted"); load(); }
    catch (e) { toast.error(e.response?.data?.detail || "Error"); }
  };

  const total = commissions.reduce((s, c) => s + Number(c.commission_amount ?? 0), 0);
  const paid = commissions.filter((c) => c.status === "PAID").reduce((s, c) => s + Number(c.commission_amount ?? 0), 0);
  const pending = commissions.filter((c) => c.status !== "PAID").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">All Commissions</h2>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
          <HiOutlinePlus className="h-4 w-4" /> Add Commission
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card"><p className="text-sm text-gray-500">Total Amount</p><p className="text-2xl font-bold text-primary-700">${total.toLocaleString()}</p></div>
        <div className="card"><p className="text-sm text-gray-500">Total Paid Out</p><p className="text-2xl font-bold text-green-700">${paid.toLocaleString()}</p></div>
        <div className="card"><p className="text-sm text-gray-500">Pending Payments</p><p className="text-2xl font-bold text-yellow-600">{pending}</p></div>
      </div>

      {loading ? <p className="text-gray-400">Loading…</p> : (
        <div className="card p-0 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>{["Property", "Broker", "Rate", "Amount", "Status", "Paid Date", "Actions"].map((h) => (
                <th key={h} className="table-header px-4 py-3">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {commissions.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No commissions found.</td></tr>
              ) : commissions.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{c.property_id}</td>
                  <td className="px-4 py-3 text-sm">{c.broker_id}</td>
                  <td className="px-4 py-3 text-sm">{c.commission_rate}%</td>
                  <td className="px-4 py-3 text-sm font-medium">${Number(c.commission_amount ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3"><Badge status={c.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{c.paid_date ?? "—"}</td>
                  <td className="px-4 py-3 flex gap-2">
                    {c.status !== "PAID" && (
                      <button onClick={() => pay(c.id)} title="Mark paid" className="btn-secondary py-1 px-2 text-xs text-green-600 border-green-300 hover:bg-green-50">
                        <HiOutlineCheck />
                      </button>
                    )}
                    <button onClick={() => del(c.id)} title="Delete" className="btn-danger py-1 px-2 text-xs">
                      <HiOutlineTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <Modal title="Add Commission" onClose={() => setShowCreate(false)}>
          <div className="space-y-3">
            <div>
              <label className="label">Property</label>
              <select name="property_id" className="input" value={form.property_id} onChange={handle}>
                <option value="">Select property…</option>
                {properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Broker</label>
              <select name="broker_id" className="input" value={form.broker_id} onChange={handle}>
                <option value="">Select broker…</option>
                {brokers.map((b) => <option key={b.id} value={b.id}>{b.first_name} {b.last_name} — {b.email}</option>)}
              </select>
            </div>
            <div><label className="label">Commission Rate (%)</label><input name="commission_rate" type="number" step="0.01" className="input" placeholder="e.g. 5" value={form.commission_rate} onChange={handle} /></div>
            <div><label className="label">Commission Amount <span className="text-gray-400 font-normal">(optional — calculated if blank)</span></label><input name="commission_amount" type="number" className="input" placeholder="e.g. 2000" value={form.commission_amount} onChange={handle} /></div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
              <button onClick={create} className="btn-primary">Create</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
