import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { register, googleAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get("next");
  const [form, setForm] = useState({ email: "", password: "", first_name: "", last_name: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created! Please log in.");
      navigate(nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login");
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(Array.isArray(detail) ? detail[0]?.msg : detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const hasGoogle = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Call useGoogleLogin hook at top level (required by React hooks rules)
  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGLoading(true);
      try {
        const userData = await googleAuth(tokenResponse.access_token);
        toast.success(`Welcome, ${userData.first_name}!`);
        const roleMap = { ADMIN: "/admin", OWNER: "/owner", TENANT: "/tenant", BROKER: "/broker" };
        navigate(roleMap[userData?.role_name] || "/marketplace", { replace: true });
      } catch (err) {
        const detail = err.response?.data?.detail;
        toast.error(detail || "Google sign-up failed");
      } finally {
        setGLoading(false);
      }
    },
    onError: () => toast.error("Google sign-up cancelled or failed"),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary-900">🏠 BrokerSaaS</h1>
          <p className="mt-2 text-sm text-gray-500">Create a free tenant account</p>
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
                <span className="text-xs text-gray-400">or register with email</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>
            </>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First Name</label>
                <input name="first_name" required className="input" value={form.first_name} onChange={handle} />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input name="last_name" required className="input" value={form.last_name} onChange={handle} />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" required className="input" value={form.email} onChange={handle} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input name="phone" className="input" placeholder="+1234567890" value={form.phone} onChange={handle} />
            </div>
            <div>
              <label className="label">Password</label>
              <input name="password" type="password" required className="input" placeholder="Min 8 chars, 1 uppercase, 1 digit" value={form.password} onChange={handle} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Creating…" : "Create Account"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to={nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login"}
              className="text-primary-600 hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
        <p className="mt-4 text-center text-sm">
          <Link to="/marketplace" className="text-primary-600 hover:underline">← Browse Marketplace</Link>
        </p>
      </div>
    </div>
  );
}
