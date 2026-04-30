import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../../infrastructure/api";
import { useAuth } from "../../../context/AuthContext";
import Badge from "../../components/Badge";
import Tooltip from "../../components/Tooltip";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

const MIN_IMAGES = 3;
const MAX_IMAGES = 5;

function emptyForm() {
  return {
    title: "", description: "", address: "", price: "", bedrooms: "", bathrooms: "",
    is_furnished: false, property_type_id: "", listing_type_id: "", district_id: "",
    currency_id: "", broker_id: "", is_published: true, image_paths: "", amenities_text: "",
    room_type: "",
  };
}

function parseImagePaths(value) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseAmenities(value) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePropertyTypeName(name) {
  return String(name ?? "").trim().toLowerCase();
}

function supportsBedrooms(propertyTypeName) {
  const normalizedName = normalizePropertyTypeName(propertyTypeName);
  return normalizedName === "house" || normalizedName === "apartment";
}

export default function PropertiesPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const formRef = useRef(null);
  const [items, setItems] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [propTypes, setPropTypes] = useState([]);
  const [listTypes, setListTypes] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [formMode, setFormMode] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedPreviews, setSelectedPreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const existingImagePaths = parseImagePaths(form.image_paths);
  const totalImageCount = existingImagePaths.length + selectedFiles.length;
  const isImageCountValid = totalImageCount >= MIN_IMAGES && totalImageCount <= MAX_IMAGES;
  const selectedPropertyType = propTypes.find((type) => String(type.id) === String(form.property_type_id));
  const selectedPropertyTypeName = selectedPropertyType?.name ?? "";
  const selectedListingType = listTypes.find((type) => String(type.id) === String(form.listing_type_id));
  const selectedListingTypeName = normalizePropertyTypeName(selectedListingType?.name);
  const supportsResidentialDetails = supportsBedrooms(selectedPropertyTypeName);
  const showListingType = Boolean(form.property_type_id);
  const showResidentialDetails = supportsResidentialDetails && Boolean(form.listing_type_id);
  const showRoomType = normalizePropertyTypeName(selectedPropertyTypeName) === "house" && Boolean(form.listing_type_id) && selectedListingTypeName === "for_rent";

  const scrollToForm = () => {
    requestAnimationFrame(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setSelectedPreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  const load = () => {
    setLoading(true);
    const endpoint = user?.role_name === "ADMIN" ? "/properties" : "/properties/my";
    api
      .get(endpoint)
      .then(({ data }) => {
        const rows = Array.isArray(data)
          ? data
          : Array.isArray(data?.properties)
            ? data.properties
            : Array.isArray(data?.items)
              ? data.items
              : [];
        setItems(rows);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([
      api.get("/master/districts"),
      api.get("/master/property-types"),
      api.get("/master/listing-types"),
      api.get("/master/currencies"),
      api.get("/master/room-types"),
      api.get("/users/brokers").catch(() => ({ data: { users: [] } })),
    ]).then(([d, pt, lt, cu, rt, br]) => {
      setDistricts(d.data);
      setPropTypes(pt.data);
      setListTypes(lt.data);
      setCurrencies(cu.data);
      setRoomTypes(rt.data);
      setBrokers(br.data?.users ?? []);
    });
    load();
  }, [user?.role_name]);

  const closeForm = () => {
    setFormMode(null);
    setEditingItem(null);
    setForm(emptyForm());
    setSelectedFiles([]);
    setSearchParams({});
  };

  const openCreate = () => {
    setSearchParams({ mode: "create" });
    setForm((f) => ({ ...emptyForm(), currency_id: String(currencies[0]?.id ?? "") }));
    setEditingItem(null);
    setFormMode("create");
    setSelectedFiles([]);
    scrollToForm();
  };

  const openEdit = (p) => {
    setSearchParams({ mode: "edit", id: String(p.id) });
    setForm({
      title: p.title, description: p.description ?? "", address: p.address,
      price: p.price ?? "", bedrooms: p.bedrooms ?? "", bathrooms: p.bathrooms ?? "",
      is_furnished: p.is_furnished ?? false, property_type_id: p.property_type_id,
      listing_type_id: p.listing_type_id, district_id: p.district_id ?? "",
      currency_id: p.currency_id ? String(p.currency_id) : "",
      broker_id: p.broker_id ?? "", is_published: p.is_published ?? true,
      image_paths: (p.images ?? []).map((img) => img.url).filter(Boolean).join("\n"),
      amenities_text: (p.amenities ?? []).map((a) => a.name).filter(Boolean).join("\n"),
      room_type: p.room_type ?? "",
    });
    setEditingItem(p);
    setFormMode("edit");
    setSelectedFiles([]);
    scrollToForm();
  };

  useEffect(() => {
    const mode = searchParams.get("mode");
    const id = Number(searchParams.get("id"));

    if (mode === "create") {
      if (formMode !== "create") {
        setForm((f) => ({ ...emptyForm(), currency_id: String(currencies[0]?.id ?? "") }));
        setEditingItem(null);
        setFormMode("create");
        setSelectedFiles([]);
      }
      scrollToForm();
      return;
    }

    if (mode === "edit" && id) {
      const p = items.find((item) => item.id === id);
      if (p && editingItem?.id !== p.id) {
        setForm({
          title: p.title, description: p.description ?? "", address: p.address,
          price: p.price ?? "", bedrooms: p.bedrooms ?? "", bathrooms: p.bathrooms ?? "",
          is_furnished: p.is_furnished ?? false, property_type_id: p.property_type_id,
          listing_type_id: p.listing_type_id, district_id: p.district_id ?? "",
          currency_id: p.currency_id ? String(p.currency_id) : "",
          broker_id: p.broker_id ?? "", is_published: p.is_published ?? true,
          image_paths: (p.images ?? []).map((img) => img.url).filter(Boolean).join("\n"),
          amenities_text: (p.amenities ?? []).map((a) => a.name).filter(Boolean).join("\n"),
          room_type: p.room_type ?? "",
        });
        setEditingItem(p);
        setFormMode("edit");
        setSelectedFiles([]);
      }
      scrollToForm();
      return;
    }

    if (formMode) {
      setFormMode(null);
      setEditingItem(null);
      setForm(emptyForm());
      setSelectedFiles([]);
    }
  }, [searchParams, items, currencies, formMode, editingItem]);

  useEffect(() => {
    if (formMode && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [formMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setForm((f) => {
      const updated = { ...f, [name]: newValue };
      // Reset cascading fields when parent changes
      if (name === "property_type_id") {
        updated.listing_type_id = "";
        updated.room_type = "";
        updated.bedrooms = "";
        updated.bathrooms = "";
        const nextPropertyType = propTypes.find((propertyType) => String(propertyType.id) === String(value));
        if (!supportsBedrooms(nextPropertyType?.name)) {
          updated.bedrooms = "";
          updated.bathrooms = "";
        }
      }
      if (name === "listing_type_id") {
        const nextListingType = listTypes.find((listingType) => String(listingType.id) === String(value));
        if (normalizePropertyTypeName(nextListingType?.name) !== "for_rent") {
          updated.room_type = "";
        }
      }
      return updated;
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const currentCount = parseImagePaths(form.image_paths).length;
    const maxSelectable = Math.max(0, MAX_IMAGES - currentCount);

    if (files.length > maxSelectable) {
      toast.error(`You can add only ${maxSelectable} more image(s)`);
      setSelectedFiles(files.slice(0, maxSelectable));
      return;
    }
    setSelectedFiles(files);
  };

  const uploadSelectedImages = async () => {
    if (!selectedFiles.length) return [];
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));
    const { data } = await api.post("/properties/upload-images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data?.images ?? [];
  };

  const save = async () => {
    if (!isImageCountValid) {
      toast.error(`Property must have minimum ${MIN_IMAGES} and maximum ${MAX_IMAGES} images`);
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      price: form.price ? Number(form.price) : null,
      bedrooms: showResidentialDetails && form.bedrooms ? Number(form.bedrooms) : null,
      bathrooms: showResidentialDetails && form.bathrooms ? Number(form.bathrooms) : null,
      property_type_id: Number(form.property_type_id),
      listing_type_id: Number(form.listing_type_id),
      district_id: form.district_id ? Number(form.district_id) : null,
      currency_id: Number(form.currency_id),
      broker_id: form.broker_id ? Number(form.broker_id) : null,
      room_type: showRoomType && form.room_type ? form.room_type : null,
      images: [],
      amenities: parseAmenities(form.amenities_text),
    };
    const existingPaths = existingImagePaths;

    try {
      const uploadedPaths = await uploadSelectedImages();
      payload.images = [...existingPaths, ...uploadedPaths];

      if (payload.images.length < MIN_IMAGES || payload.images.length > MAX_IMAGES) {
        toast.error(`Property must have minimum ${MIN_IMAGES} and maximum ${MAX_IMAGES} images`);
        return;
      }

      if (formMode === "create") await api.post("/properties", payload);
      else await api.put(`/properties/${editingItem.id}`, payload);
      toast.success("Saved!");
      closeForm();
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Error");
    } finally {
      setSaving(false);
    }
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

      {formMode && (
        <div ref={formRef} className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              {formMode === "create" ? "Add Property" : "Edit Property"}
            </h3>
            <button onClick={closeForm} className="btn-secondary">Cancel</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="label">Title</label><input name="title" className="input" value={form.title} onChange={handleChange} /></div>
            <div><label className="label">Address</label><input name="address" className="input" value={form.address} onChange={handleChange} /></div>
            <div className="md:col-span-2"><label className="label">Description</label><textarea name="description" rows={2} className="input" value={form.description} onChange={handleChange} /></div>
            <div><label className="label">Property Type</label><select name="property_type_id" className="input" value={form.property_type_id} onChange={handleChange}><option value="">Select…</option>{propTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
            {showListingType && (
              <div><label className="label">Listing Type</label><select name="listing_type_id" className="input" value={form.listing_type_id} onChange={handleChange}><option value="">Select…</option>{listTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
            )}
            {showRoomType && (
              <div>
                <label className="label">Room Type</label>
                <select name="room_type" className="input" value={form.room_type} onChange={handleChange}>
                  <option value="">Select…</option>
                  {roomTypes.map((rt) => (
                    <option key={rt.id} value={rt.name}>{rt.name}</option>
                  ))}
                </select>
              </div>
            )}
            {showResidentialDetails && (
              <div><label className="label">Bedrooms</label><input name="bedrooms" type="number" className="input" value={form.bedrooms} onChange={handleChange} /></div>
            )}
            {showResidentialDetails && (
              <div><label className="label">Bathrooms</label><input name="bathrooms" type="number" className="input" value={form.bathrooms} onChange={handleChange} /></div>
            )}
            <div><label className="label">Price</label><input name="price" type="number" className="input" value={form.price} onChange={handleChange} /></div>
            <div className="flex items-center gap-2 mt-6"><input name="is_furnished" type="checkbox" checked={form.is_furnished} onChange={handleChange} className="h-4 w-4" /><label className="text-sm">Furnished</label></div>
            <div><label className="label">Currency</label><select name="currency_id" className="input" value={form.currency_id} onChange={handleChange}><option value="">Select…</option>{currencies.map((c) => <option key={c.id} value={c.id}>{c.code} ({c.symbol})</option>)}</select></div>
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
            <div className="md:col-span-2">
              <label className="label">Browse Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                className="input"
                onChange={handleFileChange}
              />
              {selectedFiles.length > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  {selectedFiles.length} image(s) selected. They will be uploaded and saved in the project on Save.
                </p>
              )}
              {selectedPreviews.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedPreviews.map((src, idx) => (
                    <div key={src} className="relative">
                      <img
                        src={src}
                        alt={`Selected ${idx + 1}`}
                        className="h-16 w-16 rounded-md border border-gray-200 object-cover"
                      />
                      <span className="absolute -right-1 -top-1 rounded-full bg-[#0b6f26] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <p className={`mt-1 text-xs ${isImageCountValid ? "text-green-600" : "text-amber-600"}`}>
                Live count: existing {existingImagePaths.length} + selected {selectedFiles.length} = {totalImageCount}/{MAX_IMAGES} (minimum {MIN_IMAGES}).
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="label">Image Paths <span className="text-gray-400 font-normal">(auto-saved paths, one per line)</span></label>
              <textarea
                name="image_paths"
                rows={4}
                className="input"
                value={form.image_paths}
                onChange={handleChange}
                placeholder="/images/property-1/front.jpg&#10;/images/property-1/living-room.jpg"
              />
              <p className="mt-1 text-xs text-gray-500">Use project-relative static paths so the frontend can render them (example: <code>/images/...</code>).</p>
            </div>
            <div className="md:col-span-2">
              <label className="label">What this place offers <span className="text-gray-400 font-normal">(one item per line)</span></label>
              <textarea
                name="amenities_text"
                rows={4}
                className="input"
                value={form.amenities_text}
                onChange={handleChange}
                placeholder={"WiFi\nAir conditioning\nParking"}
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input name="is_published" type="checkbox" checked={form.is_published} onChange={handleChange} className="h-4 w-4" />
              <label className="text-sm">Publish to marketplace</label>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button onClick={closeForm} className="btn-secondary">Cancel</button>
            <button onClick={save} disabled={saving || !isImageCountValid} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">{saving ? "Saving..." : "Save"}</button>
          </div>
        </div>
      )}

      {loading ? <p className="text-gray-400">Loading…</p> : (
        <div className="card p-0 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>{["Title", "Address", "Type", "Currency", "Price", "Images", "Broker", "Status", "Actions"].map((h) => <th key={h} className="table-header px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{p.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{p.address}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.property_type_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.currency_code || "—"}</td>
                  <td className="px-4 py-3 text-sm">{p.price ? `${p.currency_symbol || ""}${Number(p.price).toLocaleString()}` : "—"}</td>
                  <td className="px-4 py-3">
                    {p.images?.length ? (
                      <div className="flex items-center gap-1.5">
                        {p.images.slice(0, 3).map((img) => (
                          <img
                            key={img.id ?? img.url}
                            src={img.url}
                            alt={p.title}
                            className="h-10 w-10 rounded object-cover border border-gray-200"
                          />
                        ))}
                        {p.images.length > 3 && (
                          <span className="text-xs text-gray-500">+{p.images.length - 3}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No images</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.broker_name || <span className="text-gray-300">None</span>}</td>
                  <td className="px-4 py-3"><Badge status={p.is_published ? "ACTIVE" : "INACTIVE"} /></td>
                  <td className="px-4 py-3 flex gap-2">
                    <Tooltip text="Edit property">
                      <button onClick={() => openEdit(p)} className="btn-secondary py-1 px-2 text-xs"><HiOutlinePencil /></button>
                    </Tooltip>
                    <Tooltip text={p.is_published ? "Hide from marketplace" : "Show on marketplace"}>
                      <button onClick={() => togglePublish(p)} className="btn-secondary py-1 px-2 text-xs">{p.is_published ? <HiOutlineEyeOff /> : <HiOutlineEye />}</button>
                    </Tooltip>
                    <Tooltip text="Delete property">
                      <button onClick={() => del(p.id)} className="btn-danger py-1 px-2 text-xs"><HiOutlineTrash /></button>
                    </Tooltip>
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
