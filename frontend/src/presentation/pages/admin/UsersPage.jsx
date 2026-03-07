import { useState, useEffect } from "react";
import api from "../../../infrastructure/api";
import Badge from "../../components/Badge";
import toast from "react-hot-toast";
import { HiOutlinePencil, HiOutlineCheck, HiOutlineBan, HiOutlineUserAdd, HiOutlineKey } from "react-icons/hi";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [panelMode, setPanelMode] = useState(null); // null | 'create' | 'edit' | 'password'
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [createForm, setCreateForm] = useState({ email: "", password: "", first_name: "", last_name: "", phone: "", role_id: "" });
  const [creating, setCreating] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ new_password: "", confirm_password: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  const selectedEditUser = users.find((u) => u.id === editUserId) || null;
  const selectedPasswordUser = users.find((u) => u.id === passwordUserId) || null;

  const load = async () => {
    const [u, r] = await Promise.all([api.get("/users/"), api.get("/master/roles")]);
    setUsers(u.data?.users ?? []);
    setRoles(r.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const closePanel = () => {
    setPanelMode(null);
    setEditUserId(null);
    setPasswordUserId(null);
    setForm({});
    setCreateForm({ email: "", password: "", first_name: "", last_name: "", phone: "", role_id: "" });
    setPasswordForm({ new_password: "", confirm_password: "" });
  };

  const openEdit = (u) => {
    setEditUserId(u.id);
    setForm({ first_name: u.first_name, last_name: u.last_name, phone: u.phone ?? "", role_id: u.role_id });
    setPanelMode("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openCreate = () => {
    setCreateForm({ email: "", password: "", first_name: "", last_name: "", phone: "", role_id: "" });
    setPanelMode("create");
  };

  const openPassword = (u) => {
    setPasswordUserId(u.id);
    setPasswordForm({ new_password: "", confirm_password: "" });
    setPanelMode("password");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async () => {
    try {
      await api.put(`/users/${editUserId}`, { ...form, role_id: Number(form.role_id) });
      toast.success("User updated");
      closePanel();
      load();
    } catch (e) { toast.error(e.response?.data?.detail || "Error"); }
  };

  const toggle = async (u) => {
    try {
      await api.patch(`/users/${u.id}/${u.is_active ? "deactivate" : "activate"}`);
      toast.success(`User ${u.is_active ? "deactivated" : "activated"}`);
      load();
    } catch (e) { toast.error(e.response?.data?.detail || "Error"); }
  };

  const createUser = async () => {
    if (!createForm.role_id) return toast.error("Please select a role");
    setCreating(true);
    try {
      await api.post("/users/", { ...createForm, role_id: Number(createForm.role_id) });
      toast.success("User created successfully");
      closePanel();
      setCreateForm({ email: "", password: "", first_name: "", last_name: "", phone: "", role_id: "" });
      load();
    } catch (e) {
      const detail = e.response?.data?.detail;
      toast.error(Array.isArray(detail) ? detail[0]?.msg : detail || "Error creating user");
    } finally { setCreating(false); }
  };
  const changePassword = async () => {
    if (!passwordForm.new_password || passwordForm.new_password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
    setChangingPassword(true);
    try {
      await api.patch(`/users/${passwordUserId}/password`, { new_password: passwordForm.new_password });
      toast.success(`Password updated for ${selectedPasswordUser?.first_name} ${selectedPasswordUser?.last_name}`);
      closePanel();
    } catch (e) {
      const detail = e.response?.data?.detail;
      toast.error(Array.isArray(detail) ? detail[0]?.msg : detail || "Error updating password");
    } finally { setChangingPassword(false); }
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-800">User Management</h2>
        <button onClick={openCreate} className="btn-primary inline-flex items-center gap-2 text-sm w-full sm:w-auto justify-center">
          <HiOutlineUserAdd className="h-4 w-4" /> Add User
        </button>
      </div>

      {panelMode === "create" && (
        <div className="card space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Add New User</h3>
            <button onClick={closePanel} className="btn-secondary w-full sm:w-auto">Cancel</button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="label">First Name</label><input className="input" value={createForm.first_name} onChange={(e) => setCreateForm((f) => ({ ...f, first_name: e.target.value }))} /></div>
              <div><label className="label">Last Name</label><input className="input" value={createForm.last_name} onChange={(e) => setCreateForm((f) => ({ ...f, last_name: e.target.value }))} /></div>
            </div>
            <div><label className="label">Email</label><input type="email" className="input" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} /></div>
            <div><label className="label">Phone</label><input className="input" placeholder="+233..." value={createForm.phone} onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))} /></div>
            <div><label className="label">Password</label><input type="password" className="input" placeholder="Min 8 chars, 1 uppercase, 1 digit" value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} /></div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={createForm.role_id} onChange={(e) => setCreateForm((f) => ({ ...f, role_id: e.target.value }))}>
                <option value="">Select a role</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <p className="text-xs text-gray-400">Tenants can self-register. Use this to create Owners, Brokers, Admins.</p>
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-1">
              <button onClick={closePanel} className="btn-secondary">Cancel</button>
              <button onClick={createUser} disabled={creating} className="btn-primary">{creating ? "Creating…" : "Create User"}</button>
            </div>
          </div>
        </div>
      )}

      {panelMode === "edit" && selectedEditUser && (
        <div className="card space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Edit User</h3>
            <button onClick={closePanel} className="btn-secondary w-full sm:w-auto">Cancel</button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="label">First Name</label><input className="input" value={form.first_name ?? ""} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} /></div>
              <div><label className="label">Last Name</label><input className="input" value={form.last_name ?? ""} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} /></div>
            </div>
            <div><label className="label">Phone</label><input className="input" value={form.phone ?? ""} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role_id ?? ""} onChange={(e) => setForm((f) => ({ ...f, role_id: e.target.value }))}>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-1">
              <button onClick={closePanel} className="btn-secondary">Cancel</button>
              <button onClick={save} className="btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}

      {panelMode === "password" && selectedPasswordUser && (
        <div className="card space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Change Password - {selectedPasswordUser.first_name} {selectedPasswordUser.last_name}</h3>
            <button onClick={closePanel} className="btn-secondary w-full sm:w-auto">Cancel</button>
          </div>
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              <p className="font-medium">Password Requirements:</p>
              <ul className="list-disc list-inside mt-1 text-xs">
                <li>Minimum 8 characters</li>
                <li>At least one uppercase letter</li>
                <li>At least one digit</li>
              </ul>
            </div>
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                className="input"
                placeholder="Enter new password"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm((f) => ({ ...f, new_password: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                className="input"
                placeholder="Confirm new password"
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm((f) => ({ ...f, confirm_password: e.target.value }))}
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-1">
              <button onClick={closePanel} className="btn-secondary">Cancel</button>
              <button onClick={changePassword} disabled={changingPassword} className="btn-primary">
                {changingPassword ? "Updating…" : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? <p className="text-gray-400">Loading…</p> : (
        <div className="card p-0 overflow-x-auto">
          <table className="min-w-[760px] w-full divide-y divide-gray-200">
            <thead>
              <tr>
                {["Name", "Email", "Role", "Status", "Actions"].map((h) => (
                  <th key={h} className="table-header px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{u.first_name} {u.last_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                  <td className="px-4 py-3"><Badge status={u.role_name} /></td>
                  <td className="px-4 py-3"><Badge status={u.is_active ? "ACTIVE" : "INACTIVE"} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2 min-w-[124px]">
                    <button onClick={() => openEdit(u)} className="btn-secondary py-1 px-2 text-xs" title="Edit User"><HiOutlinePencil /></button>
                    <button onClick={() => openPassword(u)} className="btn-secondary py-1 px-2 text-xs" title="Change Password"><HiOutlineKey /></button>
                    <button onClick={() => toggle(u)} className={`py-1 px-2 text-xs rounded-lg border ${u.is_active ? "border-red-300 text-red-600 hover:bg-red-50" : "border-green-300 text-green-600 hover:bg-green-50"}`} title={u.is_active ? "Deactivate" : "Activate"}>
                      {u.is_active ? <HiOutlineBan /> : <HiOutlineCheck />}
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
