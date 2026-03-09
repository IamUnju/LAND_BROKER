import { useState, useEffect } from "react";
import api from "../../../infrastructure/api";
import StatCard from "../../components/StatCard";
import MiniMetricChart from "../../components/dashboard/MiniMetricChart";
import { HiOutlineCurrencyDollar, HiOutlineCheck, HiOutlineClock, HiOutlineOfficeBuilding } from "react-icons/hi";
import { useAuth } from "../../../context/AuthContext";

export default function BrokerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, paid: 0, unpaid: 0 });
  const [propCount, setPropCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    api.get(`/commissions/broker/${user.id}`).then(({ data }) => {
      const items = Array.isArray(data) ? data : [];
      setStats({
        total: items.length,
        paid: items.filter((c) => c.status === "PAID").length,
        unpaid: items.filter((c) => c.status === "UNPAID").length,
      });
    }).catch(() => {});
    api.get("/properties/my").then(({ data }) => {
      setPropCount(data?.total ?? data?.properties?.length ?? 0);
    }).catch(() => {});
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Broker Dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MiniMetricChart title="Assigned Properties" value={propCount} toneKey="blue" hint="Managed" />
        <MiniMetricChart title="Total Commissions" value={stats.total} toneKey="emerald" hint="Pipeline" />
        <MiniMetricChart title="Pending Commissions" value={stats.unpaid} toneKey="amber" hint="Awaiting payment" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Assigned Properties" value={propCount} icon={HiOutlineOfficeBuilding} color="primary" />
        <StatCard title="Total Commissions" value={stats.total} icon={HiOutlineCurrencyDollar} color="primary" />
        <StatCard title="Paid" value={stats.paid} icon={HiOutlineCheck} color="green" />
        <StatCard title="Pending" value={stats.unpaid} icon={HiOutlineClock} color="yellow" />
      </div>
    </div>
  );
}
