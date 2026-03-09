import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../../infrastructure/api";
import Badge from "../../components/Badge";
import toast from "react-hot-toast";
import { HiOutlinePencil, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

function emptyForm() {
  return {
    title: "", description: "", address: "", price: "", bedrooms: "",
    bathrooms: "", is_furnished: false, property_type_id: "", listing_type_id: "", district_id: "", amenities_text: "",
  };
}

function parseAmenities(value) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function BrokerPropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const formRef = useRef(null);
  const [items, setItems] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [propTypes, setPropTypes] = useState([]);
  const [listTypes, setListTypes] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm());
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

  const load = () => {
    setLoading(true);
    api.get("/properties/my")
      .then(({ data }) => { setItems(data?.properties ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([
      api.get("/master/districts"),
      api.get("/master/property-types"),
      api.get("/master/listing-types"),
    ]).then(([d, pt, lt]) => {
      setDistricts(d.data);
      setPropTypes(pt.data);
      setListTypes(lt.data);
    }).catch(() => {});
    load();
  }, []);

  const openEdit = (p) => {
    setSearchParams({ mode: "edit", id: String(p.id) });
    setForm({
      title: p.title,
      description: p.description ?? "",
      address: p.address,
      price: p.price ?? "",
      bedrooms: p.bedrooms ?? "",
      bathrooms: p.bathrooms ?? "",
      is_furnished: p.is_furnished ?? false,
      property_type_id: p.property_type_id,
      listing_type_id: p.listing_type_id,
      district_id: p.district_id ?? "",
      amenities_text: (p.amenities ?? []).map((a) => a.name).filter(Boolean).join("\n"),
    });
    setEditingItem(p);
    scrollToForm();
  };

  const closeEdit = () => {
    setEditingItem(null);
    setForm(emptyForm());
    setSearchParams({});
  };

  useEffect(() => {
    const mode = searchParams.get("mode");
    const id = Number(searchParams.get("id"));
    if (mode === "edit" && id) {
      const p = items.find((item) => item.id === id);
      if (p && editingItem?.id !== p.id) {
        setForm({
          title: p.title,
          description: p.description ?? "",
          address: p.address,
          price: p.price ?? "",
          bedrooms: p.bedrooms ?? "",
          bathrooms: p.bathrooms ?? "",
          is_furnished: p.is_furnished ?? false,
          property_type_id: p.property_type_id,
          listing_type_id: p.listing_type_id,
          district_id: p.district_id ?? "",
          amenities_text: (p.amenities ?? []).map((a) => a.name).filter(Boolean).join("\n"),
        });
        setEditingItem(p);
      }
      scrollToForm();
      return;
    }

    if (!mode && editingItem) {
      setEditingItem(null);
      setForm(emptyForm());
    }
  }, [searchParams, items, editingItem]);

  useEffect(() => {
    if (editingItem && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [editingItem]);

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
      amenities: parseAmenities(form.amenities_text),
    };
    try {
      await api.put(`/properties/${editingItem.id}`, payload);
      toast.success("Property updated!");
      closeEdit();
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Error saving property");
    }
  };

  const togglePublish = async (p) => {
    try {
      await api.patch(`/properties/${p.id}/${p.is_published ? "unpublish" : "publish"}`);
      toast.success(p.is_published ? "Unpublished" : "Published");
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-800">Assigned Properties</h2>
        <span className="text-sm text-gray-500">{items.length} propert{items.length !== 1 ? "ies" : "y"} assigned to you</span>
      </div>

      {editingItem && (
        <div ref={formRef} className="card space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Edit Property</h3>
            <button onClick={closeEdit} className="btn-secondary w-full sm:w-auto">Cancel</button>
          </div>
          <div className="space-y-3">
            <div><label className="label">Title</label><input name="title" className="input" value={form.title} onChange={handleChange} /></div>
            <div><label className="label">Address</label><input name="address" className="input" value={form.address} onChange={handleChange} /></div>
            <div><label className="label">Description</label><textarea name="description" rows={2} className="input" value={form.description} onChange={handleChange} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="label">Price</label><input name="price" type="number" className="input" value={form.price} onChange={handleChange} /></div>
              <div><label className="label">Bedrooms</label><input name="bedrooms" type="number" className="input" value={form.bedrooms} onChange={handleChange} /></div>
              <div><label className="label">Bathrooms</label><input name="bathrooms" type="number" className="input" value={form.bathrooms} onChange={handleChange} /></div>
              <div className="flex items-center gap-2 mt-6">
                <input name="is_furnished" type="checkbox" checked={form.is_furnished} onChange={handleChange} className="h-4 w-4" />
                <label className="text-sm">Furnished</label>
              </div>
            </div>
            <div>
              <label className="label">Property Type</label>
              <select name="property_type_id" className="input" value={form.property_type_id} onChange={handleChange}>
                <option value="">Select…</option>
                {propTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Listing Type</label>
              <select name="listing_type_id" className="input" value={form.listing_type_id} onChange={handleChange}>
                <option value="">Select…</option>
                {listTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">District</label>
              <select name="district_id" className="input" value={form.district_id} onChange={handleChange}>
                <option value="">Select…</option>
                {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">What this place offers</label>
              <textarea
                name="amenities_text"
                rows={4}
                className="input"
                value={form.amenities_text}
                onChange={handleChange}
                placeholder={"WiFi\nAir conditioning\nParking"}
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-1">
              <button onClick={closeEdit} className="btn-secondary">Cancel</button>
              <button onClick={save} className="btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : items.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">No properties assigned to you yet.</div>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="min-w-[900px] w-full divide-y divide-gray-200">
            <thead>
              <tr>
                {["Title", "Address", "Type", "Price", "Owner", "Status", "Actions"].map((h) => (
                  <th key={h} className="table-header px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{p.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{p.address}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.property_type_name}</td>
                  <td className="px-4 py-3 text-sm">{p.price ? `$${Number(p.price).toLocaleString()}` : "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.host_name || "—"}</td>
                  <td className="px-4 py-3"><Badge status={p.is_published ? "ACTIVE" : "INACTIVE"} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2 min-w-[84px]">
                    <button
                      onClick={() => openEdit(p)}
                      className="btn-secondary py-1 px-2 text-xs"
                      title="Edit"
                    >
                      <HiOutlinePencil />
                    </button>
                    <button
                      onClick={() => togglePublish(p)}
                      className="btn-secondary py-1 px-2 text-xs"
                      title={p.is_published ? "Unpublish" : "Publish"}
                    >
                      {p.is_published ? <HiOutlineEyeOff /> : <HiOutlineEye />}
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
