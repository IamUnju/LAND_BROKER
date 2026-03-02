import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HiOutlineHome, HiOutlineUsers, HiOutlineOfficeBuilding, HiOutlineKey,
  HiOutlineDocumentText, HiOutlineCurrencyDollar, HiOutlineCog,
  HiOutlineHeart, HiOutlineChatAlt2, HiOutlineChartBar, HiOutlineDatabase,
  HiOutlineLogout, HiOutlineBriefcase,
} from "react-icons/hi";

const navConfig = {
  ADMIN: [
    { to: "/admin", icon: HiOutlineChartBar, label: "Dashboard", end: true },
    { to: "/admin/users", icon: HiOutlineUsers, label: "Users" },
    { to: "/admin/owners", icon: HiOutlineOfficeBuilding, label: "Owners" },
    { to: "/admin/brokers", icon: HiOutlineBriefcase, label: "Brokers" },
    { to: "/admin/properties", icon: HiOutlineOfficeBuilding, label: "Properties" },
    { to: "/admin/units", icon: HiOutlineKey, label: "Units" },
    { to: "/admin/leases", icon: HiOutlineDocumentText, label: "Leases" },
    { to: "/admin/payments", icon: HiOutlineCurrencyDollar, label: "Payments" },
    { to: "/admin/maintenance", icon: HiOutlineCog, label: "Maintenance" },
    { to: "/admin/commissions", icon: HiOutlineCurrencyDollar, label: "Commissions" },
    { to: "/admin/master", icon: HiOutlineDatabase, label: "Master Data" },
  ],
  OWNER: [
    { to: "/owner", icon: HiOutlineChartBar, label: "Dashboard", end: true },
    { to: "/owner/properties", icon: HiOutlineOfficeBuilding, label: "Properties" },
    { to: "/owner/units", icon: HiOutlineKey, label: "Units" },
    { to: "/owner/leases", icon: HiOutlineDocumentText, label: "Leases" },
    { to: "/owner/payments", icon: HiOutlineCurrencyDollar, label: "Payments" },
    { to: "/owner/maintenance", icon: HiOutlineCog, label: "Maintenance" },
  ],
  TENANT: [
    { to: "/tenant", icon: HiOutlineHome, label: "Dashboard", end: true },
    { to: "/tenant/lease", icon: HiOutlineDocumentText, label: "My Lease" },
    { to: "/tenant/payments", icon: HiOutlineCurrencyDollar, label: "Payments" },
    { to: "/tenant/maintenance", icon: HiOutlineCog, label: "Maintenance" },
    { to: "/tenant/favorites", icon: HiOutlineHeart, label: "Favorites" },
    { to: "/tenant/inquiries", icon: HiOutlineChatAlt2, label: "Inquiries" },
  ],
  BROKER: [
    { to: "/broker", icon: HiOutlineBriefcase, label: "Dashboard", end: true },
    { to: "/broker/properties", icon: HiOutlineOfficeBuilding, label: "Properties" },
    { to: "/broker/commissions", icon: HiOutlineCurrencyDollar, label: "Commissions" },
  ],
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = navConfig[user?.role_name] || [];

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col bg-primary-900 text-white">
        <div className="flex h-16 items-center px-6 border-b border-primary-700">
          <span className="text-lg font-bold tracking-tight">🏠 BrokerSaaS</span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-700 text-white"
                    : "text-primary-100 hover:bg-primary-800"
                }`
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-primary-700 p-4">
          <div className="mb-3 px-1">
            <p className="text-xs text-primary-300">Signed in as</p>
            <p className="text-sm font-medium truncate">{user?.email}</p>
            <span className="mt-0.5 inline-block rounded bg-primary-700 px-2 py-0.5 text-xs">
              {user?.role_name}
            </span>
          </div>
          <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary-100 hover:bg-primary-800 transition-colors">
            <HiOutlineLogout className="h-5 w-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-800">
            {links.find((l) => l.label === "Dashboard")?.label ?? "Dashboard"}
          </h1>
          <NavLink to="/marketplace" className="text-sm text-primary-600 hover:underline">
            ← Marketplace
          </NavLink>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
