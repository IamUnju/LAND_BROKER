import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../../infrastructure/api";
import Badge from "../../components/Badge";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";

export default function UnitsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const formRef = useRef(null);
  const [units, setUnits] = useState([]);
  const [properties, setProperties] = useState([]);
  const [formMode, setFormMode] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [form, setForm] = useState({ unit_number: "", floor: "", area_sqft: "", rent_amount: "", property_id: "" });
  const [loading, setLoading] = useState(true);

  const scrollToForm = () => {
    requestAnimationFrame(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const load = () => api.get("/units/").then(({ data }) => { setUnits(data); setLoading(false); });

  useEffect(() => {
    api.get("/properties/my").then(({ data }) => setProperties(data?.properties ?? []));
    load();
  }, []);

  const closeForm = () => {
    setFormMode(null);
    setEditingUnit(null);
    setForm({ unit_number: "", floor: "", area_sqft: "", rent_amount: "", property_id: "" });
    setSearchParams({});
  };

  const openCreate = () => {
    setSearchParams({ mode: "create" });
    setForm({ unit_number: "", floor: "", area_sqft: "", rent_amount: "", property_id: "" });
    setEditingUnit(null);
    setFormMode("create");
    scrollToForm();
  };

  const openEdit = (u) => {
    setSearchParams({ mode: "edit", id: String(u.id) });
    setForm({ unit_number: u.unit_number, floor: u.floor ?? "", area_sqft: u.area_sqft ?? "", rent_amount: u.rent_amount ?? "", property_id: u.property_id });
    setEditingUnit(u);
    setFormMode("edit");
    scrollToForm();
  };

  useEffect(() => {
    const mode = searchParams.get("mode");
    const id = Number(searchParams.get("id"));

    if (mode === "create") {
      if (formMode !== "create") {
        setForm({ unit_number: "", floor: "", area_sqft: "", rent_amount: "", property_id: "" });
        setEditingUnit(null);
        setFormMode("create");
      }
      scrollToForm();
      return;
    }

    if (mode === "edit" && id) {
      const u = units.find((item) => item.id === id);
      if (u && editingUnit?.id !== u.id) {
        setForm({ unit_number: u.unit_number, floor: u.floor ?? "", area_sqft: u.area_sqft ?? "", rent_amount: u.rent_amount ?? "", property_id: u.property_id });
        setEditingUnit(u);
        setFormMode("edit");
      }
      scrollToForm();
      return;
    }

    if (formMode) {
      setFormMode(null);
      setEditingUnit(null);
      setForm({ unit_number: "", floor: "", area_sqft: "", rent_amount: "", property_id: "" });
    }
  }, [searchParams, units, formMode, editingUnit]);

  useEffect(() => {
    if (formMode && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [formMode]);
  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const save = async () => {
    const payload = { ...form, property_id: Number(form.property_id), floor: form.floor ? Number(form.floor) : null, area_sqft: form.area_sqft ? Number(form.area_sqft) : null, rent_amount: form.rent_amount ? Number(form.rent_amount) : null };
    try {
      if (formMode === "create") await api.post("/units/", payload);
      else await api.put(`/units/${editingUnit.id}`, payload);
      toast.success("Saved!"); closeForm(); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Error"); }
  };

  const del = async (id) => {
    if (!confirm("Delete unit?")) return;
    try { await api.delete(`/units/${id}`); toast.success("Deleted"); load(); }
    catch (e) { toast.error(e.response?.data?.detail || "Cannot delete"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-800">Units</h2>
        <button onClick={openCreate} className="btn-primary w-full sm:w-auto justify-center"><HiOutlinePlus />Add Unit</button>
      </div>

      {formMode && (
        <div ref={formRef} className="card space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-800">{formMode === "create" ? "Add Unit" : "Edit Unit"}</h3>
            <button onClick={closeForm} className="btn-secondary w-full sm:w-auto">Cancel</button>
          </div>
          <div className="space-y-3">
            <div><label className="label">Property</label><select name="property_id" className="input" value={form.property_id} onChange={handle}><option value="">Select…</option>{properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="label">Unit #</label><input name="unit_number" className="input" value={form.unit_number} onChange={handle} /></div>
              <div><label className="label">Floor</label><input name="floor" type="number" className="input" value={form.floor} onChange={handle} /></div>
              <div><label className="label">Area (sqft)</label><input name="area_sqft" type="number" className="input" value={form.area_sqft} onChange={handle} /></div>
              <div><label className="label">Rent Amount</label><input name="rent_amount" type="number" className="input" value={form.rent_amount} onChange={handle} /></div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-1">
              <button onClick={closeForm} className="btn-secondary">Cancel</button>
              <button onClick={save} className="btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <p className="text-gray-400">Loading…</p> : (
        <div className="card p-0 overflow-x-auto">
          <table className="min-w-[820px] w-full divide-y divide-gray-200">
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
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2 min-w-[84px]">
                    <button onClick={() => openEdit(u)} className="btn-secondary py-1 px-2 text-xs"><HiOutlinePencil /></button>
                    <button onClick={() => del(u.id)} className="btn-danger py-1 px-2 text-xs"><HiOutlineTrash /></button>
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
