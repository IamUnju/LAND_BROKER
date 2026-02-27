import { useState, useEffect } from "react";
import api from "../../../infrastructure/api";
import StatCard from "../../components/StatCard";
import { HiOutlineUsers, HiOutlineOfficeBuilding, HiOutlineKey, HiOutlineDocumentText, HiOutlineCurrencyDollar, HiOutlineCog } from "react-icons/hi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  const cards = stats ? [
    { title: "Total Users", value: stats.total_users, icon: HiOutlineUsers, color: "primary" },
    { title: "Properties", value: stats.total_properties, icon: HiOutlineOfficeBuilding, color: "green" },
    { title: "Units", value: stats.total_units, icon: HiOutlineKey, color: "yellow" },
    { title: "Active Leases", value: stats.active_leases, icon: HiOutlineDocumentText, color: "purple" },
    { title: "Payments (Month)", value: stats.payments_this_month, icon: HiOutlineCurrencyDollar, color: "green" },
    { title: "Open Maintenance", value: stats.open_maintenance, icon: HiOutlineCog, color: "red" },
  ] : [];

  const chartData = stats?.users_by_role
    ? Object.entries(stats.users_by_role).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">System Overview</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => <StatCard key={c.title} {...c} />)}
      </div>
      {chartData.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-4">Users by Role</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
