import { useState, useEffect } from "react";
import api from "../../../infrastructure/api";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";
import toast from "react-hot-toast";
import { HiOutlinePlus } from "react-icons/hi";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function TenantMaintenancePage() {
  const [requests, setRequests] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "MEDIUM", unit_id: "" });
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/maintenance").then(({ data }) => { setRequests(data); setLoading(false); });

  useEffect(() => {
    api.get("/units").then(({ data }) => setUnits(data)).catch(() => {});
    load();
  }, []);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    try {
      await api.post("/maintenance", { ...form, unit_id: Number(form.unit_id) });
      toast.success("Request submitted!"); setModal(false); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Error"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Maintenance Requests</h2>
        <button onClick={() => { setForm({ title: "", description: "", priority: "MEDIUM", unit_id: "" }); setModal(true); }} className="btn-primary"><HiOutlinePlus />New Request</button>
      </div>
      {loading ? <p className="text-gray-400">Loading…</p> : (
        <div className="card p-0 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead><tr>{["Title", "Priority", "Status", "Created"].map((h) => <th key={h} className="table-header px-4 py-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{r.title}</td>
                  <td className="px-4 py-3"><Badge status={r.priority} /></td>
                  <td className="px-4 py-3"><Badge status={r.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{r.created_at?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal && (
        <Modal title="New Maintenance Request" onClose={() => setModal(false)}>
          <div className="space-y-3">
            <div><label className="label">Unit</label><select name="unit_id" className="input" value={form.unit_id} onChange={handle}><option value="">Select…</option>{units.map((u) => <option key={u.id} value={u.id}>{u.unit_number}</option>)}</select></div>
            <div><label className="label">Title</label><input name="title" className="input" value={form.title} onChange={handle} /></div>
            <div><label className="label">Description</label><textarea name="description" rows={3} className="input" value={form.description} onChange={handle} /></div>
            <div><label className="label">Priority</label><select name="priority" className="input" value={form.priority} onChange={handle}>{PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}</select></div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={submit} className="btn-primary">Submit</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
