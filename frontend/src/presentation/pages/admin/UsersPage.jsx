import { useState, useEffect } from "react";
import api from "../../../infrastructure/api";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";
import { HiOutlinePencil, HiOutlineCheck, HiOutlineBan, HiOutlineUserAdd, HiOutlineKey } from "react-icons/hi";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ email: "", password: "", first_name: "", last_name: "", phone: "", role_id: "" });
  const [creating, setCreating] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ new_password: "", confirm_password: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  const load = async () => {
    const [u, r] = await Promise.all([api.get("/users/"), api.get("/master/roles")]);
    setUsers(u.data?.users ?? []);
    setRoles(r.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openEdit = (u) => { setEditUser(u); setForm({ first_name: u.first_name, last_name: u.last_name, phone: u.phone ?? "", role_id: u.role_id }); };

  const save = async () => {
    try {
      await api.put(`/users/${editUser.id}`, { ...form, role_id: Number(form.role_id) });
      toast.success("User updated");
      setEditUser(null);
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
      setShowCreate(false);
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
      await api.patch(`/users/${passwordUser.id}/password`, { new_password: passwordForm.new_password });
      toast.success(`Password updated for ${passwordUser.first_name} ${passwordUser.last_name}`);
      setPasswordUser(null);
      setPasswordForm({ new_password: "", confirm_password: "" });
    } catch (e) {
      const detail = e.response?.data?.detail;
      toast.error(Array.isArray(detail) ? detail[0]?.msg : detail || "Error updating password");
    } finally { setChangingPassword(false); }
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">User Management</h2>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
          <HiOutlineUserAdd className="h-4 w-4" /> Add User
        </button>
      </div>
      {loading ? <p className="text-gray-400">Loading…</p> : (
        <div className="card p-0 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
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
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEdit(u)} className="btn-secondary py-1 px-2 text-xs" title="Edit User"><HiOutlinePencil /></button>
                    <button onClick={() => { setPasswordUser(u); setPasswordForm({ new_password: "", confirm_password: "" }); }} className="btn-secondary py-1 px-2 text-xs" title="Change Password"><HiOutlineKey /></button>
                    <button onClick={() => toggle(u)} className={`py-1 px-2 text-xs rounded-lg border ${u.is_active ? "border-red-300 text-red-600 hover:bg-red-50" : "border-green-300 text-green-600 hover:bg-green-50"}`} title={u.is_active ? "Deactivate" : "Activate"}>
                      {u.is_active ? <HiOutlineBan /> : <HiOutlineCheck />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create User Modal ── */}
      {showCreate && (
        <Modal title="Add New User" onClose={() => setShowCreate(false)}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
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
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
              <button onClick={createUser} disabled={creating} className="btn-primary">{creating ? "Creating…" : "Create User"}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Edit User Modal ── */}
      {editUser && (
        <Modal title="Edit User" onClose={() => setEditUser(null)}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">First Name</label><input className="input" value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} /></div>
              <div><label className="label">Last Name</label><input className="input" value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} /></div>
            </div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role_id} onChange={(e) => setForm((f) => ({ ...f, role_id: e.target.value }))}>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setEditUser(null)} className="btn-secondary">Cancel</button>
              <button onClick={save} className="btn-primary">Save</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Change Password Modal ── */}
      {passwordUser && (
        <Modal title={`Change Password - ${passwordUser.first_name} ${passwordUser.last_name}`} onClose={() => setPasswordUser(null)}>
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
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setPasswordUser(null)} className="btn-secondary">Cancel</button>
              <button onClick={changePassword} disabled={changingPassword} className="btn-primary">
                {changingPassword ? "Updating…" : "Update Password"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
