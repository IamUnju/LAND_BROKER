import { useState, useEffect } from "react";
import api from "../../../infrastructure/api";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus } from "react-icons/hi";

const ENDPOINTS = {
  Roles: { list: "/master/roles", base: "/admin/roles" },
  "Property Types": { list: "/master/property-types", base: "/admin/property-types" },
  "Listing Types": { list: "/master/listing-types", base: "/admin/listing-types" },
  Regions: { list: "/master/regions", base: "/admin/regions" },
  Districts: { list: "/master/districts", base: "/admin/districts" },
};

export default function MasterDataPage() {
  const [tab, setTab] = useState("Roles");
  const [items, setItems] = useState([]);
  const [regions, setRegions] = useState([]);
  const [modal, setModal] = useState(null); // null | {type:'create'|'edit', item?}
  const [form, setForm] = useState({ name: "", description: "", region_id: "" });

  const load = async () => {
    const { data } = await api.get(ENDPOINTS[tab].list);
    setItems(data);
  };

  useEffect(() => {
    load();
    api.get("/master/regions").then(({ data }) => setRegions(data)).catch(() => {});
  }, [tab]);

  const openCreate = () => { setForm({ name: "", description: "", region_id: "" }); setModal({ type: "create" }); };
  const openEdit = (item) => { setForm({ name: item.name, description: item.description ?? "", region_id: item.region_id ?? "" }); setModal({ type: "edit", item }); };

  const save = async () => {
    const ep = ENDPOINTS[tab].base;
    const payload = { ...form };
    if (tab === "Districts") payload.region_id = Number(form.region_id);
    try {
      if (modal.type === "create") await api.post(ep, payload);
      else await api.put(`${ep}/${modal.item.id}`, payload);
      toast.success("Saved!");
      setModal(null);
      load();
    } catch (e) { toast.error(e.response?.data?.detail || "Error"); }
  };

  const del = async (id) => {
    if (!confirm("Delete this item?")) return;
    try {
      await api.delete(`${ENDPOINTS[tab].base}/${id}`);
      toast.success("Deleted");
      load();
    } catch (e) { toast.error(e.response?.data?.detail || "Cannot delete"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Master Data</h2>
        <button onClick={openCreate} className="btn-primary"><HiOutlinePlus /> Add</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {Object.keys(ENDPOINTS).map((k) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${tab === k ? "bg-primary-600 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>{k}</button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              {["#", "Name", "Description", ...(tab === "Districts" ? ["Region"] : []), "Actions"].map((h) => (
                <th key={h} className="table-header px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, i) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{item.description ?? "—"}</td>
                {tab === "Districts" && <td className="px-4 py-3 text-sm text-gray-500">{regions.find((r) => r.id === item.region_id)?.name ?? "—"}</td>}
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(item)} className="btn-secondary py-1 px-2 text-xs"><HiOutlinePencil /></button>
                  <button onClick={() => del(item.id)} className="btn-danger py-1 px-2 text-xs"><HiOutlineTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal.type === "create" ? `Add ${tab}` : `Edit ${tab}`} onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
            {tab === "Districts" && (
              <div>
                <label className="label">Region</label>
                <select className="input" value={form.region_id} onChange={(e) => setForm((f) => ({ ...f, region_id: e.target.value }))}>
                  <option value="">Select region</option>
                  {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            )}
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
