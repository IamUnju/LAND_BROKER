import { useState, useEffect } from "react";
import api from "../../../infrastructure/api";
import Badge from "../../components/Badge";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlineX, HiOutlineCheck } from "react-icons/hi";

export default function LeasesPage() {
  const [leases, setLeases] = useState([]);
  const [units, setUnits] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({ unit_id: "", tenant_id: "", start_date: "", end_date: "", monthly_rent: "", security_deposit: "" });
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/leases").then(({ data }) => { setLeases(data); setLoading(false); });

  useEffect(() => {
    Promise.all([api.get("/units/"), api.get("/tenants")]).then(([u, t]) => { setUnits(u.data); setTenants(t.data); });
    load();
  }, []);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const save = async () => {
    const payload = { ...form, unit_id: Number(form.unit_id), tenant_id: Number(form.tenant_id), monthly_rent: Number(form.monthly_rent), security_deposit: form.security_deposit ? Number(form.security_deposit) : null };
    try { await api.post("/leases", payload); toast.success("Lease created!"); setShowCreateForm(false); setForm({ unit_id: "", tenant_id: "", start_date: "", end_date: "", monthly_rent: "", security_deposit: "" }); load(); }
    catch (e) { toast.error(e.response?.data?.detail || "Error"); }
  };

  const activate = async (id) => {
    try { await api.patch(`/leases/${id}/activate`); toast.success("Activated"); load(); }
    catch (e) { toast.error(e.response?.data?.detail || "Error"); }
  };

  const terminate = async (id) => {
    if (!confirm("Terminate this lease?")) return;
    try { await api.patch(`/leases/${id}/terminate`); toast.success("Terminated"); load(); }
    catch (e) { toast.error(e.response?.data?.detail || "Error"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-800">Leases</h2>
        <button onClick={() => { setForm({ unit_id: "", tenant_id: "", start_date: "", end_date: "", monthly_rent: "", security_deposit: "" }); setShowCreateForm(true); }} className="btn-primary w-full sm:w-auto justify-center"><HiOutlinePlus />New Lease</button>
      </div>

      {showCreateForm && (
        <div className="card space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Create Lease</h3>
            <button onClick={() => setShowCreateForm(false)} className="btn-secondary w-full sm:w-auto">Cancel</button>
          </div>
          <div className="space-y-3">
            <div><label className="label">Unit</label><select name="unit_id" className="input" value={form.unit_id} onChange={handle}><option value="">Select…</option>{units.filter((u) => u.status === "AVAILABLE").map((u) => <option key={u.id} value={u.id}>{u.unit_number}</option>)}</select></div>
            <div><label className="label">Tenant</label><select name="tenant_id" className="input" value={form.tenant_id} onChange={handle}><option value="">Select…</option>{tenants.filter((t) => t.status === "ACTIVE").map((t) => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}</select></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="label">Start Date</label><input name="start_date" type="date" className="input" value={form.start_date} onChange={handle} /></div>
              <div><label className="label">End Date</label><input name="end_date" type="date" className="input" value={form.end_date} onChange={handle} /></div>
              <div><label className="label">Monthly Rent</label><input name="monthly_rent" type="number" className="input" value={form.monthly_rent} onChange={handle} /></div>
              <div><label className="label">Security Deposit</label><input name="security_deposit" type="number" className="input" value={form.security_deposit} onChange={handle} /></div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-1">
              <button onClick={() => setShowCreateForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={save} className="btn-primary">Create</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <p className="text-gray-400">Loading…</p> : (
        <div className="card p-0 overflow-x-auto">
          <table className="min-w-[860px] w-full divide-y divide-gray-200">
            <thead><tr>{["Unit", "Tenant", "Start", "End", "Monthly Rent", "Status", "Actions"].map((h) => <th key={h} className="table-header px-4 py-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {leases.map((l) => {
                const unit = units.find((u) => u.id === l.unit_id);
                const tenant = tenants.find((t) => t.id === l.tenant_id);
                return (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{unit?.unit_number ?? l.unit_id}</td>
                    <td className="px-4 py-3 text-sm">{tenant ? `${tenant.first_name} ${tenant.last_name}` : l.tenant_id}</td>
                    <td className="px-4 py-3 text-sm">{l.start_date}</td>
                    <td className="px-4 py-3 text-sm">{l.end_date}</td>
                    <td className="px-4 py-3 text-sm">${Number(l.monthly_rent).toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge status={l.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2 min-w-[84px]">
                      {l.status === "PENDING" && <button onClick={() => activate(l.id)} className="btn-secondary py-1 px-2 text-xs"><HiOutlineCheck /></button>}
                      {["PENDING", "ACTIVE"].includes(l.status) && <button onClick={() => terminate(l.id)} className="btn-danger py-1 px-2 text-xs"><HiOutlineX /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
