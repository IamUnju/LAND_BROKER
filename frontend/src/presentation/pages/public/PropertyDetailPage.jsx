import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../../infrastructure/api";
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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

      {/* ── Image Gallery Section ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <ImageGallery images={images} />
      </div>

      {/* ── Main Content: Two Column Layout ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ─────────── LEFT: Main Content (2/3 width) ─────────── */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Title Section */}
            <div className="pb-6 border-b border-gray-200">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{title}</h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span>{subtitleLocation}</span>
              </div>
              {specLine && (
                <p className="mt-2 text-gray-600">{specLine}</p>
              )}
              {address && (
                <p className="mt-1 text-sm text-gray-500">{address}</p>
              )}
            </div>

            {/* Host Information */}
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Host Information</h2>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {host_name?.[0]?.toUpperCase() || "H"}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">
                    {broker_name ? `Listed by ${host_name || "Owner"}` : host_name || "Owner"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-sm text-gray-500 font-medium">
                      <MdVerified className="w-4 h-4 text-rose-500" />
                      Verified host
                    </span>
                    {broker_name && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className="text-sm text-amber-600 font-medium">🤝 Managed by broker</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mt-4">
                {broker_name ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
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
                  </div>
                ) : (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
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
                  </div>
                )}
              </div>
            </div>

            {/* Map Section: below host information */}
            {hasMap && (
              <div className="pb-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
                <div className="rounded-lg overflow-hidden border border-gray-200 h-56 sm:h-72 mb-3">
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
                  className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-700"
                >
                  Show on map ↗
                </a>
                <p className="mt-2 text-sm text-gray-600">{district_name}, {region_name}</p>
              </div>
            )}

            {/* Description Section */}
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About this property</h2>
              {description ? (
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              ) : (
                <p className="text-gray-500 italic">No description available.</p>
              )}
            </div>

            {/* Amenities */}
            <div className="pb-6 border-b border-gray-200">
              <AmenitiesGrid amenities={amenities} />
            </div>
          </div>

          {/* ─────────── RIGHT: Sidebar (1/3 width) ─────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              
              {/* Booking Card / Price Card */}
              <BookingCard property={property} />

              {/* Property Highlights */}
              <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Property highlights</h3>
                <div className="space-y-4">
                  {highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">{h.icon}</div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{h.title}</p>
                        <p className="text-gray-600 text-sm mt-0.5 leading-relaxed">{h.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
