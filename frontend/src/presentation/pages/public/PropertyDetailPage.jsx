import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../../infrastructure/api";
import PropertyHeader from "../../components/property/PropertyHeader";
import ImageGallery from "../../components/property/ImageGallery";
import AmenitiesGrid from "../../components/property/AmenitiesGrid";
import BookingCard from "../../components/property/BookingCard";
import PublicFooter from "../../components/public/PublicFooter";
import { HiOutlineHome } from "react-icons/hi";
import { MdVerified, MdOutlineCheckCircle, MdOutlineAcUnit, MdOutlineKey } from "react-icons/md";

/* ── Tiny helper ── */
function dot(items) {
  return items.filter(Boolean).join(" · ");
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/properties/public/${id}`)
      .then((r) => setProperty(r.data))
      .catch(() => setError("Property not found."))
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-5">
        <HiOutlineHome className="w-16 h-16 text-gray-200" />
        <p className="text-xl font-semibold text-gray-700">{error || "Property not found"}</p>
        <button
          onClick={() => navigate("/marketplace")}
          className="text-rose-500 underline text-sm font-medium"
        >
          ← Back to marketplace
        </button>
      </div>
    );
  }

  const {
    title,
    property_type_name,
    listing_type_name,
    district_name,
    region_name,
    address,
    bedrooms,
    bathrooms,
    room_type,
    area_sqm,
    is_furnished,
    description,
    lat: rawLat,
    longitude: rawLng,
    latitude: rawLatitude,
    images = [],
    amenities = [],
    host_name,
    owner_email,
    owner_phone,
    broker_name,
    broker_email,
    broker_phone,
    price,
  } = property;

  const lat = parseFloat(rawLatitude || rawLat);
  const lng = parseFloat(rawLng);
  const hasMap = !isNaN(lat) && !isNaN(lng);

  const subtitleLocation = dot([
    property_type_name,
    district_name,
    region_name,
  ]);

  const specLine = dot([
    bedrooms > 0 && `${bedrooms} bedroom${bedrooms !== 1 ? "s" : ""}`,
    bathrooms > 0 && `${bathrooms} bathroom${bathrooms !== 1 ? "s" : ""}`,
    room_type && `Room type: ${room_type}`,
    area_sqm && `${parseFloat(area_sqm).toLocaleString()} m²`,
    is_furnished && "Furnished",
  ]);

  // 3 feature highlights (Airbnb style)
  const highlights = [
    {
      icon: <MdOutlineCheckCircle className="w-7 h-7 text-gray-800 flex-shrink-0 mt-0.5" />,
      title: listing_type_name?.includes("RENT") ? "Flexible rental terms" : "Direct sale — no agency fees",
      desc: "Contact the owner to discuss payment plans and visit times.",
    },
    {
      icon: <MdOutlineAcUnit className="w-7 h-7 text-gray-800 flex-shrink-0 mt-0.5" />,
      title: amenities.length > 0 ? `${amenities.length} amenities included` : "Well-maintained property",
      desc: amenities.length > 0
        ? amenities.slice(0, 3).map((a) => a.name).join(", ") + (amenities.length > 3 ? " and more." : ".")
        : "The property is clean and ready to move in.",
    },
    {
      icon: <MdOutlineKey className="w-7 h-7 text-gray-800 flex-shrink-0 mt-0.5" />,
      title: "Self check-in",
      desc: "Flexible viewing schedule — book a visit at your convenience.",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-[1120px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/marketplace"
            className="text-sm font-semibold text-gray-700 hover:text-gray-900 underline underline-offset-2"
          >
            ← Marketplace
          </Link>
          <Link to="/" className="text-xl font-bold tracking-tight" style={{ color: "#ff5a5f" }}>
            Broker
          </Link>
          <div className="w-28" />
        </div>
      </header>

      <div className="max-w-[1120px] mx-auto px-6 pt-6 pb-16">
        {/* ── Title row ── */}
        <PropertyHeader property={property} />

        {/* ── 1 + 4 Photo mosaic ── */}
        <ImageGallery images={images} />

        {/* ── Content: left + right ── */}
        <div className="mt-10 flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* ─────────── LEFT ─────────── */}
          <div className="flex-1 min-w-0">

            {/* Sub-title: "Entire apartment in Accra, Ghana" */}
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-[22px] font-semibold text-gray-900 leading-snug">
                {subtitleLocation || title}
              </h2>
              {specLine && (
                <p className="mt-1 text-gray-600 text-base">{specLine}</p>
              )}
              {address && (
                <p className="mt-1 text-sm text-gray-400">{address}</p>
              )}
            </div>

            {/* Host row */}
            <div className="py-6 border-b border-gray-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {host_name?.[0]?.toUpperCase() || "H"}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {broker_name ? `Listed by ${host_name || "Owner"}` : `Hosted by ${host_name || "Owner"}`}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                    <MdVerified className="w-3.5 h-3.5 text-rose-500" />
                    Verified host
                  </span>
                  {broker_name && (
                    <>
                      <span className="text-gray-300 text-xs">·</span>
                      <span className="text-xs text-amber-600 font-medium">🤝 Managed by broker</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Contact info box */}
            <div className="py-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
              {broker_name ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
                  <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide mb-2">🤝 Contact the Broker</p>
                  <p className="font-semibold text-gray-900">{broker_name}</p>
                  {broker_phone && (
                    <a href={`tel:${broker_phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-rose-600">
                      📞 <span>{broker_phone}</span>
                    </a>
                  )}
                  {broker_email && (
                    <a href={`mailto:${broker_email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-rose-600">
                      ✉️ <span>{broker_email}</span>
                    </a>
                  )}
                  <p className="mt-3 pt-3 border-t border-amber-200 text-xs text-amber-700">
                    This property is managed by a broker on behalf of the owner.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">📞 Contact the Owner</p>
                  <p className="font-semibold text-gray-900">{host_name || "Owner"}</p>
                  {owner_phone && (
                    <a href={`tel:${owner_phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-rose-600">
                      📞 <span>{owner_phone}</span>
                    </a>
                  )}
                  {owner_email && (
                    <a href={`mailto:${owner_email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-rose-600">
                      ✉️ <span>{owner_email}</span>
                    </a>
                  )}
                  {!owner_phone && !owner_email && (
                    <p className="text-sm text-gray-500">Contact details will be shown after booking.</p>
                  )}
                </div>
              )}
            </div>

            {/* Feature highlights */}
            <div className="py-6 border-b border-gray-200 space-y-6">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-5">
                  {h.icon}
                  <div>
                    <p className="font-semibold text-gray-900 text-sm leading-snug">{h.title}</p>
                    <p className="text-gray-500 text-sm mt-0.5 leading-relaxed">{h.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            {description && (
              <div className="py-8 border-b border-gray-200">
                <p className="text-gray-700 leading-[1.75] text-[15px] whitespace-pre-line">
                  {description}
                </p>
              </div>
            )}

            {/* Amenities */}
            <AmenitiesGrid amenities={amenities} />

            {/* Map */}
            {hasMap && (
              <div className="py-10 border-t border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-5">Where you'll be</h2>
                <div className="rounded-xl overflow-hidden border border-gray-200 h-64 sm:h-80">
                  <iframe
                    title="Location map"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`}
                  />
                </div>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-sm font-semibold text-gray-700 underline hover:text-gray-900"
                >
                  View on OpenStreetMap ↗
                </a>
              </div>
            )}
          </div>

          {/* ─────────── RIGHT: Sticky Booking Card ─────────── */}
          <div className="w-full lg:w-[380px] flex-shrink-0">
            <div className="sticky top-24">
              <BookingCard property={property} />
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
