import { useState, useEffect } from "react";
import api from "../../../infrastructure/api";
import Badge from "../../components/Badge";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlineCheck, HiOutlineTrash, HiOutlineSearch } from "react-icons/hi";

export default function AdminCommissionsPage() {
  const [commissions, setCommissions] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({ property_id: "", broker_id: "", commission_rate: "", transaction_amount: "" });
  
  // Filter states
  const [filterProperty, setFilterProperty] = useState("");
  const [filterBroker, setFilterBroker] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const load = () => {
    const params = {};
    if (filterProperty) params.property_id = filterProperty;
    if (filterBroker) params.broker_id = filterBroker;
    if (filterStatus) params.status = filterStatus;
    
    api.get("/commissions", { params }).then(({ data }) => { 
      setCommissions(Array.isArray(data) ? data : []); 
      setLoading(false); 
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([
      api.get("/users/brokers").catch(() => ({ data: { users: [] } })),
      api.get("/properties", { params: { limit: 100 } }).catch(() => ({ data: { properties: [] } })),
    ]).then(([br, pr]) => { 
      setBrokers(br.data?.users ?? []); 
      setProperties(pr.data?.properties ?? []); 
    });
    load();
  }, []);
  
  useEffect(() => {
    load();
  }, [filterProperty, filterBroker, filterStatus]);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const create = async () => {
    const payload = {
      property_id: Number(form.property_id),
      broker_id: Number(form.broker_id),
      commission_rate: Number(form.commission_rate),
      transaction_amount: Number(form.transaction_amount),
    };
    try {
      await api.post("/commissions", payload);
      toast.success("Commission created");
      setShowCreateForm(false);
      setForm({ property_id: "", broker_id: "", commission_rate: "", transaction_amount: "" });
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
  
  // Filter by search term
  const filteredCommissions = commissions.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.property_title?.toLowerCase().includes(term) ||
      c.broker_name?.toLowerCase().includes(term) ||
      c.property_id?.toString().includes(term)
    );
  });

  const total = commissions.reduce((s, c) => s + Number(c.commission_amount ?? 0), 0);
  const paid = commissions.filter((c) => c.status === "PAID").reduce((s, c) => s + Number(c.commission_amount ?? 0), 0);
  const pending = commissions.filter((c) => c.status !== "PAID").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-800">All Commissions</h2>
        <button onClick={() => setShowCreateForm(true)} className="btn-primary inline-flex items-center gap-2 text-sm w-full sm:w-auto justify-center">
          <HiOutlinePlus className="h-4 w-4" /> Add Commission
        </button>
      </div>

      {showCreateForm && (
        <div className="card space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Add Commission</h3>
            <button onClick={() => setShowCreateForm(false)} className="btn-secondary w-full sm:w-auto">Cancel</button>
          </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="label">Commission Rate (%)</label><input name="commission_rate" type="number" step="0.01" className="input" placeholder="e.g. 5" value={form.commission_rate} onChange={handle} /></div>
            <div><label className="label">Transaction Amount</label><input name="transaction_amount" type="number" className="input" placeholder="e.g. 200000" value={form.transaction_amount} onChange={handle} /></div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-1">
            <button onClick={() => setShowCreateForm(false)} className="btn-secondary">Cancel</button>
            <button onClick={create} className="btn-primary">Create</button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card"><p className="text-sm text-gray-500">Total Amount</p><p className="text-2xl font-bold text-primary-700">${total.toLocaleString()}</p></div>
        <div className="card"><p className="text-sm text-gray-500">Total Paid Out</p><p className="text-2xl font-bold text-green-700">${paid.toLocaleString()}</p></div>
        <div className="card"><p className="text-sm text-gray-500">Pending Payments</p><p className="text-2xl font-bold text-yellow-600">{pending}</p></div>
      </div>

      {/* Filters and Search */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2">
          <HiOutlineSearch className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by property or broker name..."
            className="input flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label text-xs">Filter by Property</label>
            <select className="input text-sm" value={filterProperty} onChange={(e) => setFilterProperty(e.target.value)}>
              <option value="">All Properties</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs">Filter by Broker</label>
            <select className="input text-sm" value={filterBroker} onChange={(e) => setFilterBroker(e.target.value)}>
              <option value="">All Brokers</option>
              {brokers.map((b) => <option key={b.id} value={b.id}>{b.first_name} {b.last_name}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs">Filter by Status</label>
            <select className="input text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
        {(filterProperty || filterBroker || filterStatus || searchTerm) && (
          <button 
            onClick={() => { setFilterProperty(""); setFilterBroker(""); setFilterStatus(""); setSearchTerm(""); }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {loading ? <p className="text-gray-400">Loading…</p> : (
        <div className="card p-0 overflow-x-auto">
          <table className="min-w-[900px] w-full divide-y divide-gray-200">
            <thead>
              <tr>{["Property", "Broker", "Rate", "Amount", "Status", "Paid Date", "Actions"].map((h) => (
                <th key={h} className="table-header px-4 py-3">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCommissions.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No commissions found.</td></tr>
              ) : filteredCommissions.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{c.property_title || `#${c.property_id}`}</td>
                  <td className="px-4 py-3 text-sm">{c.broker_name || `#${c.broker_id}`}</td>
                  <td className="px-4 py-3 text-sm">{c.commission_rate}%</td>
                  <td className="px-4 py-3 text-sm font-medium">${Number(c.commission_amount ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3"><Badge status={c.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{c.paid_at ? new Date(c.paid_at).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2 min-w-[84px]">
                    {c.status !== "PAID" && (
                      <button onClick={() => pay(c.id)} title="Mark paid" className="btn-secondary py-1 px-2 text-xs text-green-600 border-green-300 hover:bg-green-50">
                        <HiOutlineCheck />
                      </button>
                    )}
                    <button onClick={() => del(c.id)} title="Delete" className="btn-danger py-1 px-2 text-xs">
                      <HiOutlineTrash />
                    </button>
                    </div>
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
