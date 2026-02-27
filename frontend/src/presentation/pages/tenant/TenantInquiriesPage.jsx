import { useState, useEffect } from "react";
import api from "../../../infrastructure/api";
import Badge from "../../components/Badge";

export default function TenantInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/inquiries/my").then(({ data }) => { setInquiries(data); setLoading(false); }).catch(() => setLoading(false)); }, []);
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">My Inquiries</h2>
      {loading ? <p className="text-gray-400">Loading…</p> : inquiries.length === 0 ? (
        <div className="card text-center text-gray-400 py-12">No inquiries yet.</div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((i) => (
            <div key={i.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-800">Property #{i.property_id}</p>
                  <p className="mt-1 text-sm text-gray-600">{i.message}</p>
                  {i.response && <div className="mt-2 rounded-lg bg-blue-50 p-2 text-sm text-blue-800"><span className="font-medium">Response: </span>{i.response}</div>}
                </div>
                <div className="flex-shrink-0"><Badge status={i.status} /></div>
              </div>
              <p className="mt-2 text-xs text-gray-400">{i.created_at?.slice(0, 10)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
