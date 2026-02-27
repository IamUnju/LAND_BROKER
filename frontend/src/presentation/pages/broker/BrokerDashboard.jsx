import { useState, useEffect } from "react";
import api from "../../../infrastructure/api";
import StatCard from "../../components/StatCard";
import { HiOutlineCurrencyDollar, HiOutlineCheck, HiOutlineClock } from "react-icons/hi";
import { useAuth } from "../../../context/AuthContext";

export default function BrokerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, paid: 0, unpaid: 0 });

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
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Broker Dashboard</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Commissions" value={stats.total} icon={HiOutlineCurrencyDollar} color="primary" />
        <StatCard title="Paid" value={stats.paid} icon={HiOutlineCheck} color="green" />
        <StatCard title="Pending" value={stats.unpaid} icon={HiOutlineClock} color="yellow" />
      </div>
    </div>
  );
}
