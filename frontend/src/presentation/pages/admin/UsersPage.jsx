import { useState, useEffect } from "react";
import api from "../../../infrastructure/api";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";
import { HiOutlinePencil, HiOutlineCheck, HiOutlineBan } from "react-icons/hi";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [u, r] = await Promise.all([api.get("/users"), api.get("/master/roles")]);
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">User Management</h2>
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
                    <button onClick={() => openEdit(u)} className="btn-secondary py-1 px-2 text-xs"><HiOutlinePencil /></button>
                    <button onClick={() => toggle(u)} className={`py-1 px-2 text-xs rounded-lg border ${u.is_active ? "border-red-300 text-red-600 hover:bg-red-50" : "border-green-300 text-green-600 hover:bg-green-50"}`}>
                      {u.is_active ? <HiOutlineBan /> : <HiOutlineCheck />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
    </div>
  );
}
