import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../../infrastructure/api";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [inquiryMsg, setInquiryMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    api.get(`/properties/public/${id}`).then(({ data }) => setProperty(data)).catch(() => navigate("/marketplace"));
  }, [id]);

  const sendInquiry = async () => {
    if (!user) { navigate("/login"); return; }
    setSubmitting(true);
    try {
      await api.post("/inquiries", { property_id: Number(id), message: inquiryMsg });
      toast.success("Inquiry sent!");
      setInquiryMsg("");
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
    finally { setSubmitting(false); }
  };

  const toggleFavorite = async () => {
    if (!user) { navigate("/login"); return; }
    try {
      if (favorited) {
        await api.delete(`/favorites/${id}`);
        setFavorited(false);
        toast.success("Removed from favorites");
      } else {
        await api.post("/favorites", { property_id: Number(id) });
        setFavorited(true);
        toast.success("Added to favorites");
      }
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  if (!property) return <div className="flex h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary-900 text-white py-4 px-6">
        <Link to="/marketplace" className="text-primary-200 hover:underline text-sm">← Back to Marketplace</Link>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        <div className="h-64 rounded-xl bg-primary-100 flex items-center justify-center text-7xl">🏠</div>
        <div className="card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
              <p className="text-gray-500 mt-1">{property.address}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-bold text-primary-700">{property.price ? `$${Number(property.price).toLocaleString()}` : "Contact Us"}</p>
              <span className="badge bg-primary-100 text-primary-700">{property.listing_type_name}</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
            <div className="rounded-lg bg-gray-50 p-3"><p className="text-gray-400">Type</p><p className="font-medium">{property.property_type_name}</p></div>
            <div className="rounded-lg bg-gray-50 p-3"><p className="text-gray-400">Bedrooms</p><p className="font-medium">{property.bedrooms ?? "N/A"}</p></div>
            <div className="rounded-lg bg-gray-50 p-3"><p className="text-gray-400">Bathrooms</p><p className="font-medium">{property.bathrooms ?? "N/A"}</p></div>
            <div className="rounded-lg bg-gray-50 p-3"><p className="text-gray-400">Furnished</p><p className="font-medium">{property.is_furnished ? "Yes" : "No"}</p></div>
          </div>
          {property.description && <p className="mt-4 text-gray-700 text-sm leading-relaxed">{property.description}</p>}
        </div>

        {/* Inquiry */}
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-3">Send an Inquiry</h2>
          <textarea rows={3} className="input" placeholder="Type your message…" value={inquiryMsg} onChange={(e) => setInquiryMsg(e.target.value)} />
          <div className="mt-3 flex gap-3">
            <button onClick={sendInquiry} disabled={submitting || !inquiryMsg.trim()} className="btn-primary">Send Inquiry</button>
            <button onClick={toggleFavorite} className={`btn-secondary ${favorited ? "text-red-500 border-red-300" : ""}`}>
              {favorited ? "♥ Favorited" : "♡ Add to Favorites"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
