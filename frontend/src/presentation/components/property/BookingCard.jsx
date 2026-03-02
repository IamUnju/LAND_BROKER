import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { HiChevronDown, HiMinus, HiPlus, HiStar } from "react-icons/hi";
import { MdOutlineFlag } from "react-icons/md";
import api from "../../../infrastructure/api";
import toast from "react-hot-toast";

function GuestRow({ label, sub, value, min = 0, max = 16, onChange }) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-full border border-gray-400 text-gray-600 flex items-center justify-center hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <HiMinus className="w-3 h-3" />
        </button>
        <span className="w-5 text-center text-sm font-medium">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-8 h-8 rounded-full border border-gray-400 text-gray-600 flex items-center justify-center hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <HiPlus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export default function BookingCard({ property }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [showGuests, setShowGuests] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const price = parseFloat(property?.price || 0);
  const isRent = property?.listing_type_name?.includes("RENT");
  const avgRating = property?.avg_rating || 0;
  const reviewCount = property?.review_count || 0;

  // Simulated "original price" for discount display (10% higher)
  const originalPrice = Math.round(price * 1.1);

  const nights = (() => {
    if (!checkIn || !checkOut) return 0;
    const d = (new Date(checkOut) - new Date(checkIn)) / 86400000;
    return d > 0 ? Math.round(d) : 0;
  })();

  const baseTotal = isRent && nights > 0 ? price * nights : price;
  const serviceFee = Math.round(baseTotal * 0.05);
  const grandTotal = baseTotal + serviceFee;
  const totalGuests = adults + children;

  const guestLabel = (() => {
    const parts = [];
    if (totalGuests > 0) parts.push(`${totalGuests} guest${totalGuests !== 1 ? "s" : ""}`);
    if (infants > 0) parts.push(`${infants} infant${infants !== 1 ? "s" : ""}`);
    return parts.length ? parts.join(", ") : "Add guests";
  })();

  const today = new Date().toISOString().split("T")[0];

  // Cancellation date = 3 days from now
  const cancellationDate = new Date();
  cancellationDate.setDate(cancellationDate.getDate() + 3);
  const cancellationStr = cancellationDate.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const fmtDate = (d) => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return `${m}/${day}/${y}`;
  };

  const handleReserve = async () => {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/inquiries", {
        property_id: property.id,
        message: `Booking request. Check-in: ${checkIn || "flexible"}. Check-out: ${checkOut || "flexible"}. Guests: ${totalGuests}.`,
      });
      setSent(true);
      toast.success("Request sent!");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Success state ── */
  if (sent) {
    return (
      <div className="border border-gray-200 rounded-2xl shadow-lg p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto text-3xl">🎉</div>
        <h3 className="text-lg font-bold text-gray-900">Request sent!</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          The owner will contact you shortly. Check your messages for updates.
        </p>
        <button
          onClick={() => { setSent(false); setCheckIn(""); setCheckOut(""); }}
          className="text-sm font-semibold underline text-gray-700 hover:text-gray-900 mt-1"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-2xl shadow-xl overflow-visible">
      {/* ── Discount banner ── */}
      <div className="px-6 pt-5">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
          <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
          {isRent ? "Lower price this month" : "Price negotiable — contact owner"}
        </div>

        {/* ── Price row ── */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-gray-400 line-through text-base">
            GH₵ {originalPrice.toLocaleString()}
          </span>
          <span className="text-2xl font-bold text-gray-900">
            GH₵ {price.toLocaleString()}
          </span>
          {isRent && (
            <span className="text-gray-500 text-sm">
              {nights > 0 ? `for ${nights} night${nights !== 1 ? "s" : ""}` : "/ month"}
            </span>
          )}
          {!isRent && (
            <span className="text-gray-500 text-sm">total</span>
          )}
          {reviewCount > 0 && (
            <span className="ml-auto flex items-center gap-1 text-sm text-gray-600">
              <HiStar className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-semibold">{avgRating.toFixed(2)}</span>
              <span className="text-gray-400">· {reviewCount}</span>
            </span>
          )}
        </div>
      </div>

      <div className="px-6 pb-6 mt-4">
        {/* ── Date + Guests input box ── */}
        <div className="border border-gray-400 rounded-xl overflow-visible">
          {isRent && (
            <div className="grid grid-cols-2 divide-x divide-gray-400 border-b border-gray-400">
              <label className="block p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                  Check-in
                </span>
                <input
                  type="date"
                  value={checkIn}
                  min={today}
                  onChange={(e) => {
                    setCheckIn(e.target.value);
                    if (checkOut && e.target.value >= checkOut) setCheckOut("");
                  }}
                  className="text-sm font-medium text-gray-800 bg-transparent w-full outline-none cursor-pointer"
                />
                {checkIn && (
                  <span className="block text-xs text-gray-400 mt-0.5">{fmtDate(checkIn)}</span>
                )}
              </label>
              <label className="block p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                  Checkout
                </span>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || today}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="text-sm font-medium text-gray-800 bg-transparent w-full outline-none cursor-pointer"
                />
                {checkOut && (
                  <span className="block text-xs text-gray-400 mt-0.5">{fmtDate(checkOut)}</span>
                )}
              </label>
            </div>
          )}

          {/* Guests row */}
          <div className="relative">
            <button
              onClick={() => setShowGuests((s) => !s)}
              className="w-full flex items-center justify-between px-3 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                  Guests
                </span>
                <span className="text-sm font-medium text-gray-800">{guestLabel}</span>
              </div>
              <HiChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${showGuests ? "rotate-180" : ""}`}
              />
            </button>

            {showGuests && (
              <div className="absolute top-full left-0 right-0 z-40 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 mt-1 divide-y divide-gray-100">
                <GuestRow label="Adults" sub="Age 13+" value={adults} min={1} onChange={setAdults} />
                <GuestRow label="Children" sub="Ages 2–12" value={children} onChange={setChildren} />
                <GuestRow label="Infants" sub="Under 2" value={infants} onChange={setInfants} />
                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => setShowGuests(false)}
                    className="text-sm font-bold underline text-gray-800 hover:text-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Cancellation notice ── */}
        {isRent && (
          <p className="text-sm text-gray-600 mt-3 font-medium">
            Free cancellation before {cancellationStr}
          </p>
        )}

        {/* ── Reserve button ── */}
        <button
          onClick={handleReserve}
          disabled={submitting}
          className="mt-4 w-full rounded-xl py-3.5 text-base font-bold text-white shadow-md active:scale-[0.98] disabled:opacity-60 transition-all"
          style={{
            background: "linear-gradient(135deg, #e61e4d 0%, #e31c5f 50%, #d70466 100%)",
          }}
        >
          {submitting ? "Sending…" : user ? (isRent ? "Reserve" : "Request Viewing") : "Log in to Reserve"}
        </button>

        {!user && (
          <button
            onClick={() => navigate(`/register?next=${encodeURIComponent(location.pathname)}`)}
            className="mt-2 w-full rounded-xl py-3 text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition"
          >
            Don't have an account? Register
          </button>
        )}

        <p className="text-center text-xs text-gray-400 mt-3">You won't be charged yet</p>

        {/* ── Price breakdown ── */}
        {(nights > 0 || !isRent) && (
          <div className="mt-5 pt-5 border-t border-gray-100 space-y-3 text-sm">
            {isRent && nights > 0 ? (
              <div className="flex justify-between text-gray-700">
                <span className="underline decoration-dotted cursor-default">
                  GH₵ {price.toLocaleString()} × {nights} night{nights !== 1 ? "s" : ""}
                </span>
                <span>GH₵ {(price * nights).toLocaleString()}</span>
              </div>
            ) : !isRent ? (
              <div className="flex justify-between text-gray-700">
                <span className="underline decoration-dotted cursor-default">Property price</span>
                <span>GH₵ {price.toLocaleString()}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-gray-500">
              <span className="underline decoration-dotted cursor-default">Service fee</span>
              <span>GH₵ {serviceFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-3 border-t border-gray-100">
              <span>Total</span>
              <span>GH₵ {grandTotal.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* ── Report listing ── */}
        <div className="mt-6 flex justify-center">
          <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 underline transition-colors">
            <MdOutlineFlag className="w-3.5 h-3.5" />
            Report this listing
          </button>
        </div>
      </div>
    </div>
  );
}
