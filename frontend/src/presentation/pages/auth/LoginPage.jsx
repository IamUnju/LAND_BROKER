import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login, googleAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get("next");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const hasGoogle = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = await login(form.email, form.password);
      if (nextPath) {
        navigate(nextPath, { replace: true });
        return;
      }
      const roleMap = { ADMIN: "/admin", OWNER: "/owner", TENANT: "/tenant", BROKER: "/broker" };
      navigate(roleMap[userData?.role_name] ?? "/dashboard", { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(Array.isArray(detail) ? detail[0]?.msg ?? "Login failed" : detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Only call useGoogleLogin hook when we have a client ID
  const initGoogleLogin = () => {
    if (!hasGoogle) return () => {}; // Return dummy function if no client ID
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useGoogleLogin({
      onSuccess: async (tokenResponse) => {
        setGLoading(true);
        try {
          const userData = await googleAuth(tokenResponse.access_token);
          const roleMap = { ADMIN: "/admin", OWNER: "/owner", TENANT: "/tenant", BROKER: "/broker" };
          navigate(nextPath || roleMap[userData?.role_name] || "/marketplace", { replace: true });
          toast.success(`Welcome back, ${userData.first_name}!`);
        } catch (err) {
          const detail = err.response?.data?.detail;
          toast.error(detail || "Google sign-in failed");
        } finally {
          setGLoading(false);
        }
      },
      onError: () => toast.error("Google sign-in cancelled or failed"),
    });
  };

  const handleGoogle = initGoogleLogin();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary-900">🏠 BrokerSaaS</h1>
          <p className="mt-2 text-sm text-gray-500">Sign in to your account</p>
        </div>
        <div className="card">
          {/* Google button — only shown when client ID is configured */}
          {hasGoogle && (
            <>
              <button
                type="button"
                onClick={() => handleGoogle()}
                disabled={gLoading}
                className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 active:bg-gray-100 transition disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {gLoading ? "Connecting…" : "Continue with Google"}
              </button>
              <div className="my-4 flex items-center gap-3">
                <div className="flex-1 border-t border-gray-200" />
                <span className="text-xs text-gray-400">or sign in with email</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>
            </>
          )}

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
            <Link
              to={nextPath ? `/register?next=${encodeURIComponent(nextPath)}` : "/register"}
              className="text-primary-600 hover:underline font-medium"
            >
              Register
            </Link>
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
