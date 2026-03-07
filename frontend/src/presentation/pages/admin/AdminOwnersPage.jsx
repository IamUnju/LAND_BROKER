import { useState, useEffect } from "react";
import api from "../../../infrastructure/api";
import Badge from "../../components/Badge";
import { HiOutlineOfficeBuilding, HiOutlinePhone, HiOutlineMail, HiOutlineUser, HiOutlineChevronRight } from "react-icons/hi";

export default function AdminOwnersPage() {
  const [owners, setOwners] = useState([]);
  const [selected, setSelected] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [loadingProps, setLoadingProps] = useState(false);

  useEffect(() => {
    api.get("/users/owners")
      .then(({ data }) => { setOwners(data?.users ?? []); setLoadingOwners(false); })
      .catch(() => setLoadingOwners(false));
  }, []);

  const selectOwner = (owner) => {
    setSelected(owner);
    setProperties([]);
    setLoadingProps(true);
    api.get(`/properties/?owner_id=${owner.id}&limit=100`)
      .then(({ data }) => { setProperties(data?.properties ?? []); setLoadingProps(false); })
      .catch(() => setLoadingProps(false));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Owners</h2>
      <div className="flex flex-col gap-4 lg:flex-row lg:h-[calc(100vh-180px)]">

        {/* ── Owner list ── */}
        <div className="w-full lg:w-80 lg:flex-shrink-0 card p-0 overflow-y-auto">
          {loadingOwners ? (
            <p className="p-4 text-gray-400 text-sm">Loading…</p>
          ) : owners.length === 0 ? (
            <p className="p-4 text-gray-400 text-sm">No owners found.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {owners.map((o) => (
                <li key={o.id}>
                  <button
                    onClick={() => selectOwner(o)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${selected?.id === o.id ? "bg-primary-50 border-l-4 border-primary-600" : ""}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{o.first_name} {o.last_name}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">{o.email}</p>
                      <Badge status={o.is_active ? "ACTIVE" : "INACTIVE"} />
                    </div>
                    <HiOutlineChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Owner detail panel ── */}
        <div className="flex-1 overflow-y-auto space-y-4 min-h-[360px] lg:min-h-0">
          {!selected ? (
            <div className="card h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <HiOutlineUser className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Select an owner to see their details and properties</p>
              </div>
            </div>
          ) : (
            <>
              {/* Owner info card */}
              <div className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {selected.first_name} {selected.last_name}
                    </h3>
                    <span className="text-xs text-gray-400">Owner · ID #{selected.id}</span>
                  </div>
                  <Badge status={selected.is_active ? "ACTIVE" : "INACTIVE"} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <HiOutlineMail className="h-4 w-4 text-gray-400" />
                    {selected.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <HiOutlinePhone className="h-4 w-4 text-gray-400" />
                    {selected.phone || <span className="text-gray-300">No phone</span>}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <HiOutlineOfficeBuilding className="h-4 w-4 text-gray-400" />
                    {loadingProps ? "Loading properties…" : `${properties.length} propert${properties.length !== 1 ? "ies" : "y"}`}
                  </div>
                </div>
              </div>

              {/* Properties table */}
              <div className="card p-0 overflow-x-auto">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                  <HiOutlineOfficeBuilding className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-700 text-sm">
                    Properties ({loadingProps ? "…" : properties.length})
                  </span>
                </div>
                {loadingProps ? (
                  <p className="p-4 text-gray-400 text-sm">Loading…</p>
                ) : properties.length === 0 ? (
                  <p className="p-4 text-gray-400 text-sm">This owner has no properties yet.</p>
                ) : (
                  <table className="min-w-[760px] w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        {["Title", "Address", "Type", "Price", "Broker", "Status"].map((h) => (
                          <th key={h} className="table-header px-4 py-2 text-xs">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {properties.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm font-medium max-w-[160px] truncate">{p.title}</td>
                          <td className="px-4 py-2 text-xs text-gray-500 max-w-[160px] truncate">{p.address}</td>
                          <td className="px-4 py-2 text-xs text-gray-500">{p.property_type_name}</td>
                          <td className="px-4 py-2 text-sm">{p.price ? `$${Number(p.price).toLocaleString()}` : "—"}</td>
                          <td className="px-4 py-2 text-xs text-gray-500">{p.broker_name || <span className="text-gray-300">None</span>}</td>
                          <td className="px-4 py-2">
                            <Badge status={p.is_published ? "ACTIVE" : "INACTIVE"} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
