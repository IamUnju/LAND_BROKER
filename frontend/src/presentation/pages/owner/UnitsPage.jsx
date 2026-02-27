import { useState, useEffect } from "react";
import api from "../../../infrastructure/api";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";

export default function UnitsPage() {
  const [units, setUnits] = useState([]);
  const [properties, setProperties] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ unit_number: "", floor: "", area_sqft: "", rent_amount: "", property_id: "" });
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/units").then(({ data }) => { setUnits(data); setLoading(false); });

  useEffect(() => {
    api.get("/properties/my").then(({ data }) => setProperties(data?.properties ?? []));
    load();
  }, []);

  const openCreate = () => { setForm({ unit_number: "", floor: "", area_sqft: "", rent_amount: "", property_id: "" }); setModal({ type: "create" }); };
  const openEdit = (u) => { setForm({ unit_number: u.unit_number, floor: u.floor ?? "", area_sqft: u.area_sqft ?? "", rent_amount: u.rent_amount ?? "", property_id: u.property_id }); setModal({ type: "edit", item: u }); };
  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const save = async () => {
    const payload = { ...form, property_id: Number(form.property_id), floor: form.floor ? Number(form.floor) : null, area_sqft: form.area_sqft ? Number(form.area_sqft) : null, rent_amount: form.rent_amount ? Number(form.rent_amount) : null };
    try {
      if (modal.type === "create") await api.post("/units", payload);
      else await api.put(`/units/${modal.item.id}`, payload);
      toast.success("Saved!"); setModal(null); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Error"); }
  };

  const del = async (id) => {
    if (!confirm("Delete unit?")) return;
    try { await api.delete(`/units/${id}`); toast.success("Deleted"); load(); }
    catch (e) { toast.error(e.response?.data?.detail || "Cannot delete"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Units</h2>
        <button onClick={openCreate} className="btn-primary"><HiOutlinePlus />Add Unit</button>
      </div>
      {loading ? <p className="text-gray-400">Loading…</p> : (
        <div className="card p-0 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead><tr>{["Unit #", "Property", "Floor", "Area (sqft)", "Rent", "Status", "Actions"].map((h) => <th key={h} className="table-header px-4 py-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {units.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{u.unit_number}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{properties.find((p) => p.id === u.property_id)?.title ?? u.property_id}</td>
                  <td className="px-4 py-3 text-sm">{u.floor ?? "—"}</td>
                  <td className="px-4 py-3 text-sm">{u.area_sqft ?? "—"}</td>
                  <td className="px-4 py-3 text-sm">{u.rent_amount ? `$${Number(u.rent_amount).toLocaleString()}` : "—"}</td>
                  <td className="px-4 py-3"><Badge status={u.status} /></td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEdit(u)} className="btn-secondary py-1 px-2 text-xs"><HiOutlinePencil /></button>
                    <button onClick={() => del(u.id)} className="btn-danger py-1 px-2 text-xs"><HiOutlineTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal && (
        <Modal title={modal.type === "create" ? "Add Unit" : "Edit Unit"} onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div><label className="label">Property</label><select name="property_id" className="input" value={form.property_id} onChange={handle}><option value="">Select…</option>{properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Unit #</label><input name="unit_number" className="input" value={form.unit_number} onChange={handle} /></div>
              <div><label className="label">Floor</label><input name="floor" type="number" className="input" value={form.floor} onChange={handle} /></div>
              <div><label className="label">Area (sqft)</label><input name="area_sqft" type="number" className="input" value={form.area_sqft} onChange={handle} /></div>
              <div><label className="label">Rent Amount</label><input name="rent_amount" type="number" className="input" value={form.rent_amount} onChange={handle} /></div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={save} className="btn-primary">Save</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
