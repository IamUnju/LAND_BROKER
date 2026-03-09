import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../../infrastructure/api";
import toast from "react-hot-toast";
import { HiOutlineTrash } from "react-icons/hi";

export default function TenantFavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/favorites/").then(({ data }) => { setFavorites(data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const remove = async (propertyId) => {
    try { await api.delete(`/favorites/${propertyId}`); toast.success("Removed"); load(); }
    catch (e) { toast.error(e.response?.data?.detail || "Error"); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">My Favorites</h2>
      {loading ? <p className="text-gray-400">Loading…</p> : favorites.length === 0 ? (
        <div className="card text-center text-gray-400 py-12">No saved properties. <Link to="/marketplace" className="text-primary-600 hover:underline">Browse marketplace</Link></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((f) => (
            <div key={f.property_id} className="card p-0 overflow-hidden">
              <div className="h-36 bg-primary-100 flex items-center justify-center text-4xl">🏠</div>
              <div className="p-4">
                <Link to={`/marketplace/${f.property_id}`} className="font-semibold text-gray-800 hover:text-primary-600">{f.property_title ?? `Property #${f.property_id}`}</Link>
                <div className="mt-3 flex justify-between">
                  <Link to={`/marketplace/${f.property_id}`} className="text-sm text-primary-600 hover:underline">View</Link>
                  <button onClick={() => remove(f.property_id)} className="text-red-500 hover:text-red-700"><HiOutlineTrash /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
