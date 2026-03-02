import { useState, useEffect } from "react";
import api from "../../../infrastructure/api";
import Badge from "../../components/Badge";
import { HiOutlineOfficeBuilding, HiOutlinePhone, HiOutlineMail, HiOutlineBriefcase, HiOutlineChevronRight } from "react-icons/hi";

export default function AdminBrokersPage() {
  const [brokers, setBrokers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loadingBrokers, setLoadingBrokers] = useState(true);
  const [loadingProps, setLoadingProps] = useState(false);

  useEffect(() => {
    api.get("/users/brokers")
      .then(({ data }) => { setBrokers(data?.users ?? []); setLoadingBrokers(false); })
      .catch(() => setLoadingBrokers(false));
  }, []);

  const selectBroker = (broker) => {
    setSelected(broker);
    setProperties([]);
    setLoadingProps(true);
    api.get(`/properties/?broker_id=${broker.id}&limit=100`)
      .then(({ data }) => { setProperties(data?.properties ?? []); setLoadingProps(false); })
      .catch(() => setLoadingProps(false));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Brokers</h2>
      <div className="flex gap-4 h-[calc(100vh-180px)]">

        {/* ── Broker list ── */}
        <div className="w-80 flex-shrink-0 card p-0 overflow-y-auto">
          {loadingBrokers ? (
            <p className="p-4 text-gray-400 text-sm">Loading…</p>
          ) : brokers.length === 0 ? (
            <p className="p-4 text-gray-400 text-sm">No brokers found.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {brokers.map((b) => (
                <li key={b.id}>
                  <button
                    onClick={() => selectBroker(b)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${selected?.id === b.id ? "bg-amber-50 border-l-4 border-amber-500" : ""}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{b.first_name} {b.last_name}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">{b.email}</p>
                      <Badge status={b.is_active ? "ACTIVE" : "INACTIVE"} />
                    </div>
                    <HiOutlineChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Broker detail panel ── */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {!selected ? (
            <div className="card h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <HiOutlineBriefcase className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Select a broker to see their details and assigned properties</p>
              </div>
            </div>
          ) : (
            <>
              {/* Broker info card */}
              <div className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {selected.first_name} {selected.last_name}
                    </h3>
                    <span className="text-xs text-gray-400">Broker · ID #{selected.id}</span>
                  </div>
                  <Badge status={selected.is_active ? "ACTIVE" : "INACTIVE"} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
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
                    {loadingProps ? "Loading properties…" : `${properties.length} assigned propert${properties.length !== 1 ? "ies" : "y"}`}
                  </div>
                </div>
              </div>

              {/* Properties table */}
              <div className="card p-0 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                  <HiOutlineOfficeBuilding className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-700 text-sm">
                    Assigned Properties ({loadingProps ? "…" : properties.length})
                  </span>
                </div>
                {loadingProps ? (
                  <p className="p-4 text-gray-400 text-sm">Loading…</p>
                ) : properties.length === 0 ? (
                  <p className="p-4 text-gray-400 text-sm">No properties assigned to this broker.</p>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        {["Title", "Address", "Type", "Price", "Owner", "Status"].map((h) => (
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
                          <td className="px-4 py-2 text-xs text-gray-500">{p.host_name || <span className="text-gray-300">—</span>}</td>
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
