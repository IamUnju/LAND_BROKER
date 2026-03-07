import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../infrastructure/api";
import { useAuth } from "../../../context/AuthContext";
import {
  HiOutlineSearch, HiOutlineHeart, HiHeart,
  HiOutlineAdjustments, HiStar, HiOutlineOfficeBuilding,
  HiOutlineHome, HiOutlineCog, HiChevronLeft, HiChevronRight,
} from "react-icons/hi";

/* Deterministic placeholder images by property index */
const PHOTOS = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?w=600&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
  "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600&q=80",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80",
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&q=80",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
];

const CATEGORY_ICONS = {
  default: "🏠", apartment: "🏢", villa: "🏡", studio: "🛋️",
  office: "🏢", shop: "🏪", warehouse: "🏭", land: "🌿",
};

function getRating(id) {
  const base = [4.75, 4.8, 4.85, 4.9, 4.95, 5.0];
  return base[id % base.length];
}

function PropertyCard({ p, index, favorited, onFavorite }) {
  const primaryImage = p.images?.find((i) => i.is_primary)?.url
    || p.images?.[0]?.url
    || PHOTOS[index % PHOTOS.length];
  const rating = getRating(p.id);
  const [imgError, setImgError] = useState(false);
  const currencyLabel = p.currency_symbol || p.currency_code || "GH₵";

  return (
    <Link to={`/marketplace/${p.id}`} className="group block cursor-pointer">
      {/* Image */}
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-gray-200">
        {!imgError ? (
          <img
            src={primaryImage}
            alt={p.title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl bg-gray-100">🏠</div>
        )}
        {/* Favorite button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFavorite(p.id); }}
          className="absolute right-3 top-3 rounded-full p-1 transition-colors"
        >
          {favorited ? (
            <HiHeart className="h-6 w-6 text-rose-500 drop-shadow" />
          ) : (
            <HiOutlineHeart className="h-6 w-6 text-white drop-shadow-lg stroke-[1.5]" />
          )}
        </button>
        {/* Guest favorite badge */}
        {rating >= 4.9 && (
          <div className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-gray-800 shadow">
            Guest favorite
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-gray-900 truncate">
            {p.property_type_name ?? "Property"} in {p.district_name ?? p.address ?? "—"}
          </p>
          <span className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-gray-800">
            <HiStar className="h-3.5 w-3.5 text-gray-800" />
            {rating.toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate">{p.bedrooms ?? 0} bed · {p.bathrooms ?? 0} bath{p.is_furnished ? " · Furnished" : ""}</p>
        <p className="mt-1 text-sm text-gray-800">
          <span className="font-semibold">{currencyLabel} {Number(p.price).toLocaleString()}</span>
          <span className="text-gray-500"> / {p.listing_type_name?.toLowerCase().includes("rent") ? "month" : "total"}</span>
        </p>
        {/* Contact badge */}
        <p className="mt-1 text-xs text-gray-500 truncate">
          {p.broker_name
            ? <span>🤝 Via broker: <span className="font-medium text-gray-700">{p.broker_name}</span></span>
            : <span>📞 Contact owner: <span className="font-medium text-gray-700">{p.host_name || "Owner"}</span></span>
          }
        </p>
      </div>
    </Link>
  );
}

export default function MarketplacePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ skip: 0, limit: 16 });
  const [listingTypes, setListingTypes] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [searchVal, setSearchVal] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const searchTimer = useRef(null);
  const catScrollRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get("/master/listing-types"),
      api.get("/master/property-types"),
    ]).then(([lt, pt]) => {
      setListingTypes(lt.data);
      setPropertyTypes(pt.data);
    });
  }, []);

  useEffect(() => { loadProperties(); }, [filters]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined)
      );
      const { data } = await api.get("/properties/public", { params });
      const items = data?.properties ?? [];
      setProperties(items);
      setTotal(data?.total ?? items.length);
    } catch { setProperties([]); }
    finally { setLoading(false); }
  };

  const handleSearch = (val) => {
    setSearchVal(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search: val || undefined, skip: 0 }));
    }, 400);
  };

  const handleCategoryClick = (id) => {
    setFilters((f) => ({
      ...f,
      property_type_id: f.property_type_id === id ? undefined : id,
      skip: 0,
    }));
  };

  const handleListingType = (id) => {
    setFilters((f) => ({
      ...f,
      listing_type_id: f.listing_type_id === id ? undefined : id,
      skip: 0,
    }));
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const scrollCats = (dir) => {
    catScrollRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navbar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 md:gap-4 md:px-6">
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-1.5 text-rose-500">
            <svg viewBox="0 0 32 32" className="h-8 w-8 fill-current" aria-hidden="true">
              <path d="M16 1C9 1 1 12.5 1 19.5 1 25.3 7.7 31 16 31s15-5.7 15-11.5C31 12.5 23 1 16 1zm0 26c-6.6 0-12-4.7-12-9.5C4 11.8 11.1 4 16 4s12 7.8 12 13.5C28 22.3 22.6 27 16 27z"/>
            </svg>
            <span className="hidden text-xl font-bold tracking-tight sm:inline">BrokerSaaS</span>
          </Link>

          {/* Search bar */}
          <div className="mx-auto hidden flex-1 max-w-lg md:block">
            <div className="flex items-center rounded-full border border-gray-300 bg-white shadow-sm hover:shadow-md transition-shadow">
              <input
                value={searchVal}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search properties, locations…"
                className="flex-1 bg-transparent px-5 py-2.5 text-sm outline-none placeholder-gray-400"
              />
              <button className="m-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors">
                <HiOutlineSearch className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {user ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors sm:px-4 sm:py-2 sm:text-sm"
              >
                Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors sm:px-4 sm:py-2 sm:text-sm"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-rose-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600 transition-colors sm:px-4 sm:py-2 sm:text-sm"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Category + Filter bar ───────────────────────────── */}
      <div className="sticky top-[64px] z-30 border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-3 sm:px-4 md:px-6">
          {/* Scroll left */}
          <button onClick={() => scrollCats(-1)} className="shrink-0 rounded-full border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 hidden sm:flex">
            <HiChevronLeft className="h-4 w-4" />
          </button>

          {/* Category pills */}
          <div
            ref={catScrollRef}
            className="flex flex-1 gap-6 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: "none" }}
          >
            {/* All */}
            <button
              onClick={() => setFilters((f) => ({ ...f, property_type_id: undefined, skip: 0 }))}
              className={`flex shrink-0 flex-col items-center gap-1 pb-1 text-xs font-medium transition-colors border-b-2 ${
                !filters.property_type_id ? "border-gray-800 text-gray-800" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="text-2xl">🏠</span>
              <span>All</span>
            </button>
            {propertyTypes.map((t) => {
              const emoji = CATEGORY_ICONS[t.name?.toLowerCase()] ?? CATEGORY_ICONS.default;
              const active = filters.property_type_id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleCategoryClick(t.id)}
                  className={`flex shrink-0 flex-col items-center gap-1 pb-1 text-xs font-medium transition-colors border-b-2 ${
                    active ? "border-gray-800 text-gray-800" : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <span className="text-2xl">{emoji}</span>
                  <span>{t.name}</span>
                </button>
              );
            })}
          </div>

          {/* Scroll right */}
          <button onClick={() => scrollCats(1)} className="shrink-0 rounded-full border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 hidden sm:flex">
            <HiChevronRight className="h-4 w-4" />
          </button>

          {/* Filters button */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="ml-2 flex shrink-0 items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <HiOutlineAdjustments className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Expanded filter panel */}
        {showFilters && (
          <div className="border-t border-gray-100 bg-white px-3 py-4 sm:px-4 md:px-6">
            <div className="mx-auto flex max-w-7xl flex-wrap gap-4">
              {/* Listing type */}
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase text-gray-500 tracking-wide">Listing Type</p>
                <div className="flex gap-2 flex-wrap">
                  {listingTypes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleListingType(t.id)}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                        filters.listing_type_id === t.id
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-800"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bedrooms quick filter */}
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase text-gray-500 tracking-wide">Bedrooms</p>
                <div className="flex gap-2">
                  {["Any", 1, 2, 3, "4+"].map((n) => (
                    <button
                      key={n}
                      onClick={() => setFilters((f) => ({ ...f, bedrooms: n === "Any" ? undefined : n === "4+" ? 4 : n, skip: 0 }))}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                        (n === "Any" && !filters.bedrooms) || filters.bedrooms === (n === "4+" ? 4 : n)
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-800"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Results grid ────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-4 md:px-6 md:py-8">
        {!loading && (
          <p className="mb-5 text-sm text-gray-500">
            {total > 0 ? `${total} properties found` : ""}
          </p>
        )}

        {loading ? (
          /* Skeleton grid */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] rounded-2xl bg-gray-200" />
                <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
                <div className="mt-1 h-3 w-1/2 rounded bg-gray-200" />
                <div className="mt-1 h-3 w-1/3 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <span className="text-6xl">🏚️</span>
            <p className="mt-4 text-xl font-semibold text-gray-700">No properties found</p>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters</p>
            <button
              onClick={() => setFilters({ skip: 0, limit: 16 })}
              className="mt-5 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {properties.map((p, i) => (
              <PropertyCard
                key={p.id}
                p={p}
                index={i}
                favorited={favorites.has(p.id)}
                onFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > filters.limit && (
          <div className="mt-12 flex items-center justify-center gap-3">
            <button
              disabled={filters.skip === 0}
              onClick={() => setFilters((f) => ({ ...f, skip: Math.max(0, f.skip - f.limit) }))}
              className="flex items-center gap-1.5 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <HiChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {Math.floor(filters.skip / filters.limit) + 1} of {Math.ceil(total / filters.limit)}
            </span>
            <button
              disabled={filters.skip + filters.limit >= total}
              onClick={() => setFilters((f) => ({ ...f, skip: f.skip + f.limit }))}
              className="flex items-center gap-1.5 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <HiChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
