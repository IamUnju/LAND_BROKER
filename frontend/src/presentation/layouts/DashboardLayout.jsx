import { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Tooltip from "../components/Tooltip";
import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineOfficeBuilding,
  HiOutlineKey,
  HiOutlineDocumentText,
  HiOutlineCurrencyDollar,
  HiOutlineCog,
  HiOutlineHeart,
  HiOutlineChatAlt2,
  HiOutlineChartBar,
  HiOutlineDatabase,
  HiOutlineLogout,
  HiOutlineBriefcase,
  HiOutlineMenu,
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
    { to: "/owner/inquiries", icon: HiOutlineChatAlt2, label: "Inquiries" },
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
    { to: "/broker/inquiries", icon: HiOutlineChatAlt2, label: "Inquiries" },
    { to: "/broker/commissions", icon: HiOutlineCurrencyDollar, label: "Commissions" },
  ],
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
    <div className="flex h-screen overflow-hidden bg-[#eef2f6]">
      {showMobileSidebar && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={closeMobileSidebar} />
      )}

      <aside
        className={`${
          showMobileSidebar ? "translate-x-0" : "-translate-x-full"
        } fixed z-40 flex h-screen w-72 flex-col border-r border-[#d7dde7] bg-[#f6f8fb] transition-all duration-300 md:static md:w-auto md:translate-x-0 ${
          sidebarOpen ? "md:w-64" : "md:w-20"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#2e395d] bg-[#1f2742] px-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#d4d9e7] text-[#1f2742]">
              <HiOutlineHome className="h-5 w-5" />
            </div>
            {sidebarOpen && <span className="truncate text-lg font-semibold tracking-tight text-white">Broker</span>}
          </div>
          <button
            onClick={toggleSidebar}
            className="hidden rounded-lg p-2 text-[#cfd7ee] md:flex"
            title={sidebarOpen ? "Collapse" : "Expand"}
          >
            <HiOutlineMenu className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeMobileSidebar}
              className={({ isActive }) =>
                `group flex items-center ${sidebarOpen ? "gap-3" : "justify-center"} rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? sidebarOpen
                      ? "bg-[#0b6f26] text-white shadow-sm"
                      : "bg-[#dfece3] text-[#0b6f26]"
                    : "text-[#0f172a] hover:bg-[#eaf0ec]"
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
                  <Icon className="h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                </Tooltip>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-3 border-t border-[#d7dde7] bg-white p-3">
          {sidebarOpen ? (
            <>
              <div className="px-2">
                <p className="mb-1 text-xs text-[#64748b]">Signed in as</p>
                <p className="truncate text-sm font-medium text-[#111827]">{user?.email}</p>
                <span className="mt-1.5 inline-block rounded bg-[#eaf0ec] px-2 py-0.5 text-xs font-semibold text-[#0b6f26]">
                  {user?.role_name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#1f2937] transition-all duration-200 hover:bg-[#f2f4f8]"
              >
                <HiOutlineLogout className="h-5 w-5" /> Logout
              </button>
            </>
          ) : (
            <Tooltip text={`Logout (${user?.email})`}>
              <button
                onClick={handleLogout}
                className="flex w-full justify-center rounded-lg p-2 text-sm text-[#1f2937] transition-all duration-200 hover:bg-[#f2f4f8]"
              >
                <HiOutlineLogout className="h-5 w-5 transition-transform group-hover:scale-110" />
              </button>
            </Tooltip>
          )}
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-[#dde3ec] bg-white px-3 shadow-sm sm:px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              className="rounded-lg p-2 text-gray-800 md:hidden"
            >
              <HiOutlineMenu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">
              {links.find((l) => l.to === location.pathname)?.label ?? "Dashboard"}
            </h1>
          </div>
          <NavLink to="/marketplace" className="text-xs font-medium text-primary-600 hover:underline sm:text-sm">
            <span className="hidden sm:inline">Marketplace</span>
            <span className="sm:hidden">Market</span>
          </NavLink>
        </header>
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
