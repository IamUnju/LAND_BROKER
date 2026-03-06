import { useState, useEffect } from "react";
import api from "../../../infrastructure/api";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

function emptyForm() {
  return {
    title: "", description: "", address: "", price: "", bedrooms: "", bathrooms: "",
    is_furnished: false, property_type_id: "", listing_type_id: "", district_id: "",
    broker_id: "",
  };
}

export default function PropertiesPage() {
  const [items, setItems] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [propTypes, setPropTypes] = useState([]);
  const [listTypes, setListTypes] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/properties/my").then(({ data }) => { setItems(data?.properties ?? []); setLoading(false); });
  };

  useEffect(() => {
    Promise.all([
      api.get("/master/districts"),
      api.get("/master/property-types"),
      api.get("/master/listing-types"),
      api.get("/users/brokers").catch(() => ({ data: { users: [] } })),
    ]).then(([d, pt, lt, br]) => {
      setDistricts(d.data);
      setPropTypes(pt.data);
      setListTypes(lt.data);
      setBrokers(br.data?.users ?? []);
    });
    load();
  }, []);

  const openCreate = () => { setForm(emptyForm()); setModal({ type: "create" }); };
  const openEdit = (p) => {
    setForm({
      title: p.title, description: p.description ?? "", address: p.address,
      price: p.price ?? "", bedrooms: p.bedrooms ?? "", bathrooms: p.bathrooms ?? "",
      is_furnished: p.is_furnished ?? false, property_type_id: p.property_type_id,
      listing_type_id: p.listing_type_id, district_id: p.district_id ?? "",
      broker_id: p.broker_id ?? "",
    });
    setModal({ type: "edit", item: p });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const save = async () => {
    const payload = {
      ...form,
      price: form.price ? Number(form.price) : null,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
      property_type_id: Number(form.property_type_id),
      listing_type_id: Number(form.listing_type_id),
      district_id: form.district_id ? Number(form.district_id) : null,
      broker_id: form.broker_id ? Number(form.broker_id) : null,
    };
    try {
      if (modal.type === "create") await api.post("/properties/", payload);
      else await api.put(`/properties/${modal.item.id}`, payload);
      toast.success("Saved!");
      setModal(null);
      load();
    } catch (e) { toast.error(e.response?.data?.detail || "Error"); }
  };

  const del = async (id) => {
    if (!confirm("Delete property?")) return;
    try { await api.delete(`/properties/${id}`); toast.success("Deleted"); load(); }
    catch (e) { toast.error(e.response?.data?.detail || "Cannot delete"); }
  };

  const togglePublish = async (p) => {
    try {
      await api.patch(`/properties/${p.id}/${p.is_published ? "unpublish" : "publish"}`);
      toast.success(p.is_published ? "Unpublished" : "Published");
      load();
    } catch (e) { toast.error(e.response?.data?.detail || "Error"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">My Properties</h2>
        <button onClick={openCreate} className="btn-primary"><HiOutlinePlus /> Add Property</button>
      </div>
      {loading ? <p className="text-gray-400">Loading…</p> : (
        <div className="card p-0 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>{["Title", "Address", "Type", "Price", "Broker", "Status", "Actions"].map((h) => <th key={h} className="table-header px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{p.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{p.address}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.property_type_name}</td>
                  <td className="px-4 py-3 text-sm">{p.price ? `$${Number(p.price).toLocaleString()}` : "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.broker_name || <span className="text-gray-300">None</span>}</td>
                  <td className="px-4 py-3"><Badge status={p.is_published ? "ACTIVE" : "INACTIVE"} /></td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEdit(p)} className="btn-secondary py-1 px-2 text-xs"><HiOutlinePencil /></button>
                    <button onClick={() => togglePublish(p)} className="btn-secondary py-1 px-2 text-xs">{p.is_published ? <HiOutlineEyeOff /> : <HiOutlineEye />}</button>
                    <button onClick={() => del(p.id)} className="btn-danger py-1 px-2 text-xs"><HiOutlineTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal.type === "create" ? "Add Property" : "Edit Property"} onClose={() => setModal(null)}>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            <div><label className="label">Title</label><input name="title" className="input" value={form.title} onChange={handleChange} /></div>
            <div><label className="label">Address</label><input name="address" className="input" value={form.address} onChange={handleChange} /></div>
            <div><label className="label">Description</label><textarea name="description" rows={2} className="input" value={form.description} onChange={handleChange} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Price</label><input name="price" type="number" className="input" value={form.price} onChange={handleChange} /></div>
              <div><label className="label">Bedrooms</label><input name="bedrooms" type="number" className="input" value={form.bedrooms} onChange={handleChange} /></div>
              <div><label className="label">Bathrooms</label><input name="bathrooms" type="number" className="input" value={form.bathrooms} onChange={handleChange} /></div>
              <div className="flex items-center gap-2 mt-5"><input name="is_furnished" type="checkbox" checked={form.is_furnished} onChange={handleChange} className="h-4 w-4" /><label className="text-sm">Furnished</label></div>
            </div>
            <div><label className="label">Property Type</label><select name="property_type_id" className="input" value={form.property_type_id} onChange={handleChange}><option value="">Select…</option>{propTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
            <div><label className="label">Listing Type</label><select name="listing_type_id" className="input" value={form.listing_type_id} onChange={handleChange}><option value="">Select…</option>{listTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
            <div><label className="label">District</label><select name="district_id" className="input" value={form.district_id} onChange={handleChange}><option value="">Select…</option>{districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
            <div>
              <label className="label">Assigned Broker <span className="text-gray-400 font-normal">(optional)</span></label>
              <select name="broker_id" className="input" value={form.broker_id} onChange={handleChange}>
                <option value="">No broker</option>
                {brokers.map((b) => (
                  <option key={b.id} value={b.id}>{b.first_name} {b.last_name} — {b.email}</option>
                ))}
              </select>
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
