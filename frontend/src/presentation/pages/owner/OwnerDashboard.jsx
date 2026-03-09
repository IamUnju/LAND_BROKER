import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../../infrastructure/api";
import StatCard from "../../components/StatCard";
import Tooltip from "../../components/Tooltip";
import MiniMetricChart from "../../components/dashboard/MiniMetricChart";
import { HiOutlineOfficeBuilding, HiOutlineKey, HiOutlineDocumentText, HiOutlineCurrencyDollar, HiOutlineCog, HiOutlineChatAlt2 } from "react-icons/hi";

export default function OwnerDashboard() {
  const [stats, setStats] = useState({ properties: 0, units: 0, leases: 0, pendingRent: 0, maintenance: 0, pendingInquiries: 0 });
  const [myProperties, setMyProperties] = useState([]);

  const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.properties)) return payload.properties;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  };

  useEffect(() => {
    Promise.allSettled([
      api.get("/properties/my"),
      api.get("/units/"),
      api.get("/leases/"),
      api.get("/payments/"),
      api.get("/maintenance/"),
      api.get("/inquiries/assigned"),
    ]).then(([p, u, l, pay, m, inq]) => {
      const properties = toArray(p.value?.data);
      const units = toArray(u.value?.data);
      const leases = toArray(l.value?.data);
      const payments = toArray(pay.value?.data);
      const maintenance = toArray(m.value?.data);
      const inquiries = toArray(inq.value?.data);

      setMyProperties(properties);
      setStats({
        properties: properties.length,
        units: units.length,
        leases: leases.filter((x) => x.status === "ACTIVE").length,
        pendingRent: payments.filter((x) => x.status === "PENDING").length,
        maintenance: maintenance.filter((x) => x.status === "PENDING").length,
        pendingInquiries: inquiries.filter((x) => x.status === "PENDING").length,
      });
    });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Owner Dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MiniMetricChart title="My Properties" value={stats.properties} toneKey="blue" hint="Portfolio" />
        <MiniMetricChart title="Active Leases" value={stats.leases} toneKey="emerald" hint="Running" />
        <MiniMetricChart title="Pending Payments" value={stats.pendingRent} toneKey="amber" hint="Needs action" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="My Properties" value={stats.properties} icon={HiOutlineOfficeBuilding} color="primary" />
        <StatCard title="Total Units" value={stats.units} icon={HiOutlineKey} color="green" />
        <StatCard title="Active Leases" value={stats.leases} icon={HiOutlineDocumentText} color="purple" />
        <StatCard title="Pending Payments" value={stats.pendingRent} icon={HiOutlineCurrencyDollar} color="yellow" />
        <StatCard title="Open Maintenance" value={stats.maintenance} icon={HiOutlineCog} color="red" />
        <StatCard title="Pending Inquiries" value={stats.pendingInquiries} icon={HiOutlineChatAlt2} color="rose" />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Properties Created By You</h3>
          <Link to="/owner/properties" className="text-sm font-medium text-primary-600 hover:underline">
            Manage properties
          </Link>
        </div>

        {myProperties.length === 0 ? (
          <p className="text-sm text-gray-500">No properties created yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {myProperties.slice(0, 6).map((property) => (
              <div key={property.id} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="truncate font-semibold text-gray-800">{property.title}</p>
                <p className="mt-1 truncate text-xs text-gray-500">
                  {property.property_type_name || "Property"} · {property.listing_type_name || "Listing"}
                </p>
                <p className="mt-1 truncate text-xs text-gray-500">{property.address || "No address"}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">
                    {property.currency_symbol || property.currency_code || "GH₵"} {Number(property.price || 0).toLocaleString()}
                  </span>
                  <Link
                    to={`/owner/properties?mode=edit&id=${property.id}`}
                    className="text-xs font-medium text-primary-600 hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
