import { useEffect, useState } from "react";
import api from "../../../infrastructure/api";
import Badge from "../../components/Badge";
import { HiOutlineUser, HiOutlineEnvelope, HiOutlinePhone } from "react-icons/hi2";

export default function AssignedInquiriesPage({ title = "Assigned Inquiries" }) {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({});
  const [sendingId, setSendingId] = useState(null);

  const loadInquiries = () => {
    setLoading(true);
    api
      .get("/inquiries/assigned")
      .then(({ data }) => {
        setInquiries(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setInquiries([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleRespond = async (inquiryId) => {
    const response = (drafts[inquiryId] || "").trim();
    if (!response) return;
    setSendingId(inquiryId);
    try {
      const { data } = await api.patch(`/inquiries/${inquiryId}/respond`, { response });
      setInquiries((prev) => prev.map((i) => (i.id === inquiryId ? data : i)));
      setDrafts((prev) => ({ ...prev, [inquiryId]: "" }));
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-600">
            {inquiries.length} {inquiries.length === 1 ? "inquiry" : "inquiries"}
          </span>
        </div>
        <button
          onClick={loadInquiries}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : inquiries.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-12 text-center text-gray-400">
          No inquiries assigned.
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inquiry) => {
            const canRespond = inquiry.status !== "RESPONDED";
            const user = inquiry.user;
            const userName = user ? `${user.first_name} ${user.last_name}` : `User #${inquiry.user_id}`;

            return (
              <div key={inquiry.id} className="rounded-xl border border-gray-200 bg-white p-4">
                {/* User Header Section */}
                <div className="mb-4 pb-3 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <HiOutlineUser className="w-4 h-4 text-gray-500" />
                        <p className="text-lg font-bold text-gray-900">{userName}</p>
                        <Badge status={inquiry.status} />
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 ml-6">
                        {user?.email && (
                          <div className="flex items-center gap-2">
                            <HiOutlineEnvelope className="w-4 h-4 text-gray-400" />
                            <a href={`mailto:${user.email}`} className="hover:text-rose-600">
                              {user.email}
                            </a>
                          </div>
                        )}
                        {user?.phone && (
                          <div className="flex items-center gap-2">
                            <HiOutlinePhone className="w-4 h-4 text-gray-400" />
                            <a href={`tel:${user.phone}`} className="hover:text-rose-600">
                              {user.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inquiry Details Section */}
                <div className="mb-4 space-y-2">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Property & Message</p>
                  <p className="text-sm font-semibold text-gray-800">Property #{inquiry.property_id}</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{inquiry.message}</p>
                  <p className="text-xs text-gray-400">
                    Sent on {new Date(inquiry.created_at).toLocaleDateString()} at{" "}
                    {new Date(inquiry.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                {/* Response Section */}
                {inquiry.response ? (
                  <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800 border border-blue-100">
                    <span className="font-semibold">Your Response: </span>
                    {inquiry.response}
                  </div>
                ) : null}

                {/* Reply Form Section */}
                <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
                  <label className="text-xs text-gray-500 font-semibold uppercase">Send a Reply</label>
                  <textarea
                    value={drafts[inquiry.id] || ""}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [inquiry.id]: e.target.value }))}
                    placeholder={canRespond ? "Write your response to the tenant..." : "Already responded"}
                    disabled={!canRespond}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-100 disabled:bg-gray-100 disabled:text-gray-500"
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleRespond(inquiry.id)}
                      disabled={!canRespond || sendingId === inquiry.id || !(drafts[inquiry.id] || "").trim()}
                      className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    >
                      {sendingId === inquiry.id ? "Sending..." : "Send Response"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
