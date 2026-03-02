import { useState, useEffect, useCallback } from "react";
import { HiX, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { MdOutlinePhotoLibrary } from "react-icons/md";

const PLACEHOLDER = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200";

export default function ImageGallery({ images = [] }) {
  const [lightboxIdx, setLightboxIdx] = useState(null);

  const sorted = [...images].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  const photos = sorted.length > 0 ? sorted : [{ url: PLACEHOLDER, caption: "" }];

  const prev = useCallback(() => setLightboxIdx((i) => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setLightboxIdx((i) => (i + 1) % photos.length), [photos.length]);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") setLightboxIdx(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxIdx, prev, next]);

  // Lock body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightboxIdx !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxIdx]);

  const [p0, p1, p2, p3, p4] = photos;

  return (
    <>
      {/* ── Airbnb-style 1 + 4 mosaic ─────────────────────────────── */}
      <div className="relative rounded-xl overflow-hidden h-[340px] sm:h-[480px] grid grid-cols-2 gap-[3px] bg-gray-100">
        {/* Left: 1 big image */}
        <div
          className="row-span-2 overflow-hidden cursor-pointer group relative"
          onClick={() => setLightboxIdx(0)}
        >
          <img
            src={p0?.url || PLACEHOLDER}
            alt={p0?.caption || "Property"}
            className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-300"
            onError={(e) => { e.target.src = PLACEHOLDER; }}
          />
        </div>

        {/* Right: 2 × 2 grid */}
        <div className="grid grid-rows-2 grid-cols-2 gap-[3px]">
          {[p1, p2, p3, p4].map((photo, i) => (
            <div
              key={i}
              className="overflow-hidden cursor-pointer group relative bg-gray-200"
              onClick={() => photo && setLightboxIdx(i + 1)}
            >
              {photo ? (
                <img
                  src={photo.url}
                  alt={photo.caption || ""}
                  className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-300"
                  onError={(e) => { e.target.src = PLACEHOLDER; }}
                />
              ) : (
                <div className="w-full h-full bg-gray-100" />
              )}
            </div>
          ))}
        </div>

        {/* Show all photos button */}
        <button
          onClick={() => setLightboxIdx(0)}
          className="absolute bottom-4 right-4 flex items-center gap-2 bg-white border border-gray-900 text-gray-900 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
        >
          <MdOutlinePhotoLibrary className="w-4 h-4" />
          Show all photos
        </button>
      </div>

      {/* ── Fullscreen Lightbox ───────────────────────────────────── */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[100] bg-white flex flex-col"
          onClick={(e) => e.target === e.currentTarget && setLightboxIdx(null)}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <button
              onClick={() => setLightboxIdx(null)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-800 hover:underline"
            >
              <HiX className="w-5 h-5" />
              Close
            </button>
            <span className="text-sm text-gray-500 font-medium">
              {lightboxIdx + 1} / {photos.length}
            </span>
            <div className="w-20" />
          </div>

          {/* Image area */}
          <div className="flex-1 flex items-center justify-center relative px-16 py-6 bg-white overflow-hidden">
            <button
              onClick={prev}
              className="absolute left-4 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 transition"
            >
              <HiChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            <div className="w-full max-w-4xl flex flex-col items-center gap-4">
              <img
                src={photos[lightboxIdx]?.url || PLACEHOLDER}
                alt={photos[lightboxIdx]?.caption || ""}
                className="max-h-[72vh] w-full object-contain rounded-xl"
                onError={(e) => { e.target.src = PLACEHOLDER; }}
              />
              {photos[lightboxIdx]?.caption && (
                <p className="text-sm text-gray-500 text-center">
                  {photos[lightboxIdx].caption}
                </p>
              )}
            </div>

            <button
              onClick={next}
              className="absolute right-4 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 transition"
            >
              <HiChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Thumbnail strip */}
          {photos.length > 1 && (
            <div className="border-t border-gray-100 py-3 px-6 overflow-x-auto">
              <div className="flex gap-2 justify-center">
                {photos.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxIdx(i)}
                    className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all ${
                      i === lightboxIdx ? "border-gray-900 opacity-100" : "border-transparent opacity-60 hover:opacity-90"
                    }`}
                  >
                    <img
                      src={p.url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = PLACEHOLDER; }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
