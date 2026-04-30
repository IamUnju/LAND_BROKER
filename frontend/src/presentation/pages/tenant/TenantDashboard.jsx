import { useState, useEffect } from "react";
import api from "../../../infrastructure/api";
import StatCard from "../../components/StatCard";
import MiniMetricChart from "../../components/dashboard/MiniMetricChart";
import Badge from "../../components/Badge";
import { HiOutlineDocumentText, HiOutlineCurrencyDollar, HiOutlineCog, HiOutlineHeart, HiOutlineChatAlt2 } from "react-icons/hi";

export default function TenantDashboard() {
  const [lease, setLease] = useState(null);
  const [stats, setStats] = useState({ pending: 0, maintenance: 0, favorites: 0 });
  const [inquiries, setInquiries] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      api.get("/leases/my"),
      api.get("/payments/"),
      api.get("/maintenance/"),
      api.get("/favorites/"),
      api.get("/inquiries/my"),
    ]).then(([l, p, m, f, inq]) => {
      setLease(l.value?.data ?? null);
      setStats({
        pending: (p.value?.data ?? []).filter((x) => x.status === "PENDING").length,
        maintenance: (m.value?.data ?? []).filter((x) => x.status === "PENDING").length,
        favorites: (f.value?.data ?? []).length,
      });
      const allInquiries = inq.value?.data ?? [];
      // Show most recent 5, prioritising responded ones first
      const sorted = [...allInquiries].sort((a, b) => {
        if (a.response && !b.response) return -1;
        if (!a.response && b.response) return 1;
        return new Date(b.created_at) - new Date(a.created_at);
      });
      setInquiries(sorted.slice(0, 5));
    });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">My Dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MiniMetricChart title="Pending Payments" value={stats.pending} toneKey="amber" hint="Outstanding" />
        <MiniMetricChart title="Open Maintenance" value={stats.maintenance} toneKey="rose" hint="In progress" />
        <MiniMetricChart title="Saved Properties" value={stats.favorites} toneKey="blue" hint="Favorites" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Pending Payments" value={stats.pending} icon={HiOutlineCurrencyDollar} color="yellow" />
        <StatCard title="Open Maintenance" value={stats.maintenance} icon={HiOutlineCog} color="red" />
        <StatCard title="Saved Properties" value={stats.favorites} icon={HiOutlineHeart} color="primary" />
      </div>

      {lease && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><HiOutlineDocumentText /> Current Lease</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="rounded-lg bg-gray-50 p-3"><p className="text-gray-400">Unit</p><p className="font-medium">{lease.unit_id}</p></div>
            <div className="rounded-lg bg-gray-50 p-3"><p className="text-gray-400">Monthly Rent</p><p className="font-medium">${Number(lease.monthly_rent).toLocaleString()}</p></div>
            <div className="rounded-lg bg-gray-50 p-3"><p className="text-gray-400">Start</p><p className="font-medium">{lease.start_date}</p></div>
            <div className="rounded-lg bg-gray-50 p-3"><p className="text-gray-400">End</p><p className="font-medium">{lease.end_date}</p></div>
          </div>
          <div className="mt-3"><Badge status={lease.status} /></div>
        </div>
      )}

      {inquiries.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <HiOutlineChatAlt2 /> Recent Inquiries
          </h3>
          <div className="space-y-3">
            {inquiries.map((inq) => (
              <div key={inq.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-700">Property #{inq.property_id}</p>
                  <Badge status={inq.status} />
                </div>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{inq.message}</p>
                {inq.response && (
                  <div className="mt-2 rounded-md bg-green-50 border border-green-100 p-2">
                    <p className="text-xs font-semibold text-green-700 mb-0.5">Response received:</p>
                    <p className="text-sm text-green-800">{inq.response}</p>
                  </div>
                )}
                <p className="mt-1.5 text-xs text-gray-400">{inq.created_at?.slice(0, 10)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
