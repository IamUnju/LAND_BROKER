import { useState, useEffect } from "react";
import api from "../../../infrastructure/api";
import Badge from "../../components/Badge";

export default function TenantLeasePage() {
  const [lease, setLease] = useState(null);
  useEffect(() => {
    api.get("/leases/my").then(({ data }) => {
      const list = Array.isArray(data) ? data : [data];
      const active = list.find((l) => l.status === "ACTIVE") ?? list[0] ?? null;
      setLease(active);
    }).catch(() => {});
  }, []);
  if (!lease) return <div className="card text-center text-gray-400 py-12">No active lease found.</div>;
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">My Lease</h2>
      <div className="card grid sm:grid-cols-2 gap-4 text-sm">
        {[["Unit ID", lease.unit_id], ["Monthly Rent", `$${Number(lease.monthly_rent).toLocaleString()}`], ["Security Deposit", lease.security_deposit ? `$${Number(lease.security_deposit).toLocaleString()}` : "—"], ["Start Date", lease.start_date], ["End Date", lease.end_date], ["Duration (months)", lease.duration_months]].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-gray-50 p-3"><p className="text-gray-400">{k}</p><p className="font-medium">{v}</p></div>
        ))}
        <div className="rounded-lg bg-gray-50 p-3"><p className="text-gray-400">Status</p><Badge status={lease.status} /></div>
      </div>
    </div>
  );
}
