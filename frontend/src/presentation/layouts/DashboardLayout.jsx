import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HiOutlineHome, HiOutlineUsers, HiOutlineOfficeBuilding, HiOutlineKey,
  HiOutlineDocumentText, HiOutlineCurrencyDollar, HiOutlineCog,
  HiOutlineHeart, HiOutlineChatAlt2, HiOutlineChartBar, HiOutlineDatabase,
  HiOutlineLogout, HiOutlineBriefcase, HiOutlineMenu, HiOutlineX,
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

// Tooltip Component
function Tooltip({ text, children }) {
  return (
    <div className="group relative inline-flex">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = navConfig[user?.role_name] || [];
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const handleLogout = () => { 
    logout(); 
    navigate("/login"); 
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeMobileSidebar = () => setShowMobileSidebar(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="rounded-lg bg-primary-900 p-2 text-white hover:bg-primary-800 transition-colors"
        >
          {showMobileSidebar ? (
            <HiOutlineX className="h-6 w-6" />
          ) : (
            <HiOutlineMenu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Overlay for mobile */}
      {showMobileSidebar && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          showMobileSidebar ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-all duration-300 fixed md:static z-40 flex h-screen flex-col bg-gradient-to-b from-primary-900 to-primary-950 text-white ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-primary-700">
          {sidebarOpen && (
            <span className="text-lg font-bold tracking-tight">🏠 BrokerSaaS</span>
          )}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex rounded-lg p-2 hover:bg-primary-800 transition-colors text-primary-200"
            title={sidebarOpen ? "Collapse" : "Expand"}
          >
            {sidebarOpen ? (
              <HiOutlineX className="h-5 w-5" />
            ) : (
              <HiOutlineMenu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeMobileSidebar}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md"
                    : "text-primary-100 hover:bg-primary-800 hover:text-white"
                }`
              }
            >
              {sidebarOpen ? (
                <>
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{label}</span>
                </>
              ) : (
                <Tooltip text={label}>
                  <Icon className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                </Tooltip>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t border-primary-700 bg-primary-800 bg-opacity-50 p-3 space-y-3">
          {sidebarOpen ? (
            <>
              <div className="px-2">
                <p className="text-xs text-primary-300 mb-1">Signed in as</p>
                <p className="text-sm font-medium truncate text-white">{user?.email}</p>
                <span className="mt-1.5 inline-block rounded bg-primary-600 px-2 py-0.5 text-xs font-semibold text-primary-100">
                  {user?.role_name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary-100 hover:bg-primary-700 hover:text-white transition-all duration-200"
              >
                <HiOutlineLogout className="h-5 w-5" /> Logout
              </button>
            </>
          ) : (
            <Tooltip text={`Logout (${user?.email})`}>
              <button
                onClick={handleLogout}
                className="flex w-full justify-center rounded-lg p-2 text-sm text-primary-100 hover:bg-primary-700 hover:text-white transition-all duration-200"
              >
                <HiOutlineLogout className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </button>
            </Tooltip>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-800">
            {links.find((l) => l.to === location.pathname)?.label ?? "Dashboard"}
          </h1>
          <NavLink to="/marketplace" className="text-sm text-primary-600 hover:underline font-medium">
            ← Marketplace
          </NavLink>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
