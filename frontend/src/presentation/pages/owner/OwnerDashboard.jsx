import { useState, useEffect } from "react";
import api from "../../../infrastructure/api";
import StatCard from "../../components/StatCard";
import { HiOutlineOfficeBuilding, HiOutlineKey, HiOutlineDocumentText, HiOutlineCurrencyDollar, HiOutlineCog } from "react-icons/hi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function OwnerDashboard() {
  const [stats, setStats] = useState({ properties: 0, units: 0, leases: 0, pendingRent: 0, maintenance: 0 });
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      api.get("/properties/my"),
      api.get("/units/"),
      api.get("/leases"),
      api.get("/payments"),
      api.get("/maintenance"),
    ]).then(([p, u, l, pay, m]) => {
      const properties = p.value?.data?.items ?? p.value?.data ?? [];
      const units = u.value?.data ?? [];
      const leases = l.value?.data ?? [];
      const payments = pay.value?.data ?? [];
      const maintenance = m.value?.data ?? [];
      setStats({
        properties: properties.length,
        units: units.length,
        leases: leases.filter((x) => x.status === "ACTIVE").length,
        pendingRent: payments.filter((x) => x.status === "PENDING").length,
        maintenance: maintenance.filter((x) => x.status === "PENDING").length,
      });
    });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Owner Dashboard</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="My Properties" value={stats.properties} icon={HiOutlineOfficeBuilding} color="primary" />
        <StatCard title="Total Units" value={stats.units} icon={HiOutlineKey} color="green" />
        <StatCard title="Active Leases" value={stats.leases} icon={HiOutlineDocumentText} color="purple" />
        <StatCard title="Pending Payments" value={stats.pendingRent} icon={HiOutlineCurrencyDollar} color="yellow" />
        <StatCard title="Open Maintenance" value={stats.maintenance} icon={HiOutlineCog} color="red" />
      </div>
    </div>
  );
}
