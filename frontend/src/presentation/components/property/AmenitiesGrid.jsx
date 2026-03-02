import { useState } from "react";
import { HiX } from "react-icons/hi";

const DEFAULT_SHOWN = 10;

export default function AmenitiesGrid({ amenities = [] }) {
  const [showAll, setShowAll] = useState(false);

  if (amenities.length === 0) return null;

  const visible = showAll ? amenities : amenities.slice(0, DEFAULT_SHOWN);

  return (
    <div className="py-10 border-t border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">What this place offers</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
        {visible.map((a) => (
          <div key={a.id} className="flex items-center gap-4 py-1">
            <span className="text-[22px] leading-none w-7 text-center flex-shrink-0">{a.icon || "✓"}</span>
            <span className="text-gray-700 text-sm leading-snug">{a.name}</span>
          </div>
        ))}
      </div>

      {amenities.length > DEFAULT_SHOWN && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-6 px-6 py-3 rounded-xl border border-gray-800 text-gray-800 text-sm font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all"
        >
          Show all {amenities.length} amenities
        </button>
      )}

      {/* Full amenities modal */}
      {showAll && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setShowAll(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-xl max-h-[88vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                What this place offers
              </h3>
              <button
                onClick={() => setShowAll(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 transition"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto px-6 py-4 flex-1">
              {Object.entries(
                amenities.reduce((acc, a) => {
                  const cat = a.category || "Other";
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(a);
                  return acc;
                }, {})
              ).map(([cat, items]) => (
                <div key={cat} className="mb-8">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{cat}</p>
                  <div className="space-y-0">
                    {items.map((a) => (
                      <div key={a.id} className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0">
                        <span className="text-xl w-7 text-center flex-shrink-0">{a.icon || "✓"}</span>
                        <span className="text-gray-700 text-sm">{a.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
