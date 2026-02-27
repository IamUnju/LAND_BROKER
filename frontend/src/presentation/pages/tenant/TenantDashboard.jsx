import { useState, useEffect } from "react";
import api from "../../../infrastructure/api";
import StatCard from "../../components/StatCard";
import Badge from "../../components/Badge";
import { HiOutlineDocumentText, HiOutlineCurrencyDollar, HiOutlineCog, HiOutlineHeart } from "react-icons/hi";

export default function TenantDashboard() {
  const [lease, setLease] = useState(null);
  const [stats, setStats] = useState({ pending: 0, maintenance: 0, favorites: 0 });

  useEffect(() => {
    Promise.allSettled([
      api.get("/leases/my"),
      api.get("/payments"),
      api.get("/maintenance"),
      api.get("/favorites"),
    ]).then(([l, p, m, f]) => {
      setLease(l.value?.data ?? null);
      setStats({
        pending: (p.value?.data ?? []).filter((x) => x.status === "PENDING").length,
        maintenance: (m.value?.data ?? []).filter((x) => x.status === "PENDING").length,
        favorites: (f.value?.data ?? []).length,
      });
    });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">My Dashboard</h2>
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
    </div>
  );
}
