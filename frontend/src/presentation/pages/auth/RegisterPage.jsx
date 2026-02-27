import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../infrastructure/api";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ email: "", password: "", first_name: "", last_name: "", phone: "", role_id: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/master/roles").then(({ data }) => {
      // Exclude ADMIN from self-registration
      setRoles(data.filter((r) => r.name !== "ADMIN"));
    });
  }, []);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, role_id: Number(form.role_id) });
      toast.success("Account created! Please log in.");
      navigate("/login");
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(Array.isArray(detail) ? detail[0]?.msg : detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary-900">🏠 BrokerSaaS</h1>
          <p className="mt-2 text-sm text-gray-500">Create a new account</p>
        </div>
        <div className="card">
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
            <div>
              <label className="label">Role</label>
              <select name="role_id" required className="input" value={form.role_id} onChange={handle}>
                <option value="">Select a role</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Creating…" : "Create Account"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
