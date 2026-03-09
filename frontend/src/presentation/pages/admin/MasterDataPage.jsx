import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../../infrastructure/api";
import toast from "react-hot-toast";
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus } from "react-icons/hi";

const ENDPOINTS = {
  Roles: { list: "/master/roles", base: "/admin/roles" },
  "Property Types": { list: "/master/property-types", base: "/admin/property-types" },
  "Listing Types": { list: "/master/listing-types", base: "/admin/listing-types" },
  "Room Types": { list: "/master/room-types", base: "/admin/room-types" },
  Currencies: { list: "/master/currencies", base: "/admin/currencies" },
  Regions: { list: "/master/regions", base: "/admin/regions" },
  Districts: { list: "/master/districts", base: "/admin/districts" },
};

export default function MasterDataPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const formRef = useRef(null);
  const [tab, setTab] = useState("Roles");
  const [items, setItems] = useState([]);
  const [regions, setRegions] = useState([]);
  const [formMode, setFormMode] = useState(null); // null | 'create' | 'edit'
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: "", code: "", symbol: "", description: "", region_id: "" });

  const scrollToForm = () => {
    requestAnimationFrame(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const load = async () => {
    const { data } = await api.get(ENDPOINTS[tab].list);
    setItems(data);
  };

  useEffect(() => {
    load();
    api.get("/master/regions").then(({ data }) => setRegions(data)).catch(() => {});
  }, [tab]);

  const closeForm = () => {
    setFormMode(null);
    setEditingItem(null);
    setForm({ name: "", code: "", symbol: "", description: "", region_id: "" });
    setSearchParams({});
  };

  const openCreate = () => {
    setSearchParams({ mode: "create", tab });
    setForm({ name: "", code: "", symbol: "", description: "", region_id: "" });
    setEditingItem(null);
    setFormMode("create");
    scrollToForm();
  };

  const openEdit = (item) => {
    setSearchParams({ mode: "edit", tab, id: String(item.id) });
    setForm({
      name: item.name,
      code: item.code ?? "",
      symbol: item.symbol ?? "",
      description: item.description ?? "",
      region_id: item.region_id ?? "",
    });
    setEditingItem(item);
    setFormMode("edit");
    scrollToForm();
  };

  useEffect(() => {
    const queryTab = searchParams.get("tab");
    if (queryTab && ENDPOINTS[queryTab] && queryTab !== tab) {
      setTab(queryTab);
      return;
    }

    const mode = searchParams.get("mode");
    const id = Number(searchParams.get("id"));

    if (mode === "create") {
      if (formMode !== "create") {
        setForm({ name: "", code: "", symbol: "", description: "", region_id: "" });
        setEditingItem(null);
        setFormMode("create");
      }
      scrollToForm();
      return;
    }

    if (mode === "edit" && id) {
      const item = items.find((entry) => entry.id === id);
      if (item && editingItem?.id !== item.id) {
        setForm({
          name: item.name,
          code: item.code ?? "",
          symbol: item.symbol ?? "",
          description: item.description ?? "",
          region_id: item.region_id ?? "",
        });
        setEditingItem(item);
        setFormMode("edit");
      }
      scrollToForm();
      return;
    }

    if (formMode) {
      setFormMode(null);
      setEditingItem(null);
      setForm({ name: "", code: "", symbol: "", description: "", region_id: "" });
    }
  }, [searchParams, tab, items, formMode, editingItem]);

  useEffect(() => {
    if (formMode && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [formMode]);

  const save = async () => {
    const ep = ENDPOINTS[tab].base;
    const payload = { ...form };
    if (tab === "Districts") payload.region_id = Number(form.region_id);
    try {
      if (formMode === "create") await api.post(ep, payload);
      else await api.put(`${ep}/${editingItem.id}`, payload);
      toast.success("Saved!");
      closeForm();
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
          <button key={k} onClick={() => { setTab(k); setSearchParams({ tab: k }); }} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${tab === k ? "bg-primary-600 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>{k}</button>
        ))}
      </div>

      {formMode && (
        <div ref={formRef} className="card space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-800">{formMode === "create" ? `Add ${tab}` : `Edit ${tab}`}</h3>
            <button onClick={closeForm} className="btn-secondary w-full sm:w-auto">Cancel</button>
          </div>
          <div className="space-y-3">
            <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            {tab === "Currencies" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="label">Code</label><input className="input" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} /></div>
                <div><label className="label">Symbol</label><input className="input" value={form.symbol} onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value }))} /></div>
              </div>
            )}
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
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-1">
              <button onClick={closeForm} className="btn-secondary">Cancel</button>
              <button onClick={save} className="btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-x-auto">
        <table className="min-w-[820px] w-full divide-y divide-gray-200">
          <thead>
            <tr>
              {["#", "Name", ...(tab === "Currencies" ? ["Code", "Symbol"] : []), "Description", ...(tab === "Districts" ? ["Region"] : []), "Actions"].map((h) => (
                <th key={h} className="table-header px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, i) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                {tab === "Currencies" && <td className="px-4 py-3 text-sm text-gray-500">{item.code ?? "—"}</td>}
                {tab === "Currencies" && <td className="px-4 py-3 text-sm text-gray-500">{item.symbol ?? "—"}</td>}
                <td className="px-4 py-3 text-sm text-gray-500">{item.description ?? "—"}</td>
                {tab === "Districts" && <td className="px-4 py-3 text-sm text-gray-500">{regions.find((r) => r.id === item.region_id)?.name ?? "—"}</td>}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2 min-w-[84px]">
                    <button onClick={() => openEdit(item)} className="btn-secondary py-1 px-2 text-xs"><HiOutlinePencil /></button>
                    <button onClick={() => del(item.id)} className="btn-danger py-1 px-2 text-xs"><HiOutlineTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
