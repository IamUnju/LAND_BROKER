import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = await login(form.email, form.password);
      const roleMap = { ADMIN: "/admin", OWNER: "/owner", TENANT: "/tenant", BROKER: "/broker" };
      navigate(roleMap[userData?.role_name] ?? "/dashboard", { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(Array.isArray(detail) ? detail[0]?.msg ?? "Login failed" : detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary-900">🏠 BrokerSaaS</h1>
          <p className="mt-2 text-sm text-gray-500">Sign in to your account</p>
        </div>
        <div className="card">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" required className="input" placeholder="you@example.com" value={form.email} onChange={handle} />
            </div>
            <div>
              <label className="label">Password</label>
              <input name="password" type="password" required className="input" placeholder="••••••••" value={form.password} onChange={handle} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary-600 hover:underline font-medium">Register</Link>
          </p>
          <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500 space-y-1">
            <p className="font-medium">Test accounts:</p>
            <p>admin@broker.com / Admin@1234</p>
            <p>owner@broker.com / Owner@1234</p>
            <p>tenant@broker.com / Tenant@1234</p>
            <p>broker@broker.com / Broker@1234</p>
          </div>
        </div>
        <p className="mt-4 text-center text-sm">
          <Link to="/marketplace" className="text-primary-600 hover:underline">← Browse Marketplace</Link>
        </p>
      </div>
    </div>
  );
}
