import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./presentation/routes/ProtectedRoute";
import DashboardLayout from "./presentation/layouts/DashboardLayout";

// Public pages
import LoginPage from "./presentation/pages/auth/LoginPage";
import RegisterPage from "./presentation/pages/auth/RegisterPage";
import MarketplacePage from "./presentation/pages/public/MarketplacePage";
import PropertyDetailPage from "./presentation/pages/public/PropertyDetailPage";

// Admin
import AdminDashboard from "./presentation/pages/admin/AdminDashboard";
import UsersPage from "./presentation/pages/admin/UsersPage";
import MasterDataPage from "./presentation/pages/admin/MasterDataPage";

// Owner
import OwnerDashboard from "./presentation/pages/owner/OwnerDashboard";
import PropertiesPage from "./presentation/pages/owner/PropertiesPage";
import UnitsPage from "./presentation/pages/owner/UnitsPage";
import LeasesPage from "./presentation/pages/owner/LeasesPage";
import PaymentsPage from "./presentation/pages/owner/PaymentsPage";
import MaintenancePage from "./presentation/pages/owner/MaintenancePage";

// Tenant
import TenantDashboard from "./presentation/pages/tenant/TenantDashboard";
import TenantLeasePage from "./presentation/pages/tenant/TenantLeasePage";
import TenantPaymentsPage from "./presentation/pages/tenant/TenantPaymentsPage";
import TenantMaintenancePage from "./presentation/pages/tenant/TenantMaintenancePage";
import TenantFavoritesPage from "./presentation/pages/tenant/TenantFavoritesPage";
import TenantInquiriesPage from "./presentation/pages/tenant/TenantInquiriesPage";

// Broker
import BrokerDashboard from "./presentation/pages/broker/BrokerDashboard";
import CommissionsPage from "./presentation/pages/broker/CommissionsPage";

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const map = { ADMIN: "/admin", OWNER: "/owner", TENANT: "/tenant", BROKER: "/broker" };
  return <Navigate to={map[user.role_name] || "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/marketplace/:id" element={<PropertyDetailPage />} />
      <Route path="/" element={<Navigate to="/marketplace" replace />} />

      {/* Dashboard redirect */}
      <Route path="/dashboard" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />

      {/* ADMIN */}
      <Route path="/admin" element={<ProtectedRoute roles={["ADMIN"]}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="master" element={<MasterDataPage />} />
      </Route>

      {/* OWNER */}
      <Route path="/owner" element={<ProtectedRoute roles={["OWNER"]}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<OwnerDashboard />} />
        <Route path="properties" element={<PropertiesPage />} />
        <Route path="units" element={<UnitsPage />} />
        <Route path="leases" element={<LeasesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
      </Route>

      {/* TENANT */}
      <Route path="/tenant" element={<ProtectedRoute roles={["TENANT"]}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<TenantDashboard />} />
        <Route path="lease" element={<TenantLeasePage />} />
        <Route path="payments" element={<TenantPaymentsPage />} />
        <Route path="maintenance" element={<TenantMaintenancePage />} />
        <Route path="favorites" element={<TenantFavoritesPage />} />
        <Route path="inquiries" element={<TenantInquiriesPage />} />
      </Route>

      {/* BROKER */}
      <Route path="/broker" element={<ProtectedRoute roles={["BROKER"]}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<BrokerDashboard />} />
        <Route path="commissions" element={<CommissionsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/marketplace" replace />} />
    </Routes>
  );
}
