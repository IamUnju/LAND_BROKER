import { HiStar, HiOutlineShare } from "react-icons/hi";
import { HiOutlineHeart, HiHeart } from "react-icons/hi";
import { useState } from "react";
import toast from "react-hot-toast";

export default function PropertyHeader({ property }) {
  const [saved, setSaved] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <h1 className="text-2xl sm:text-[26px] font-semibold text-gray-900 leading-snug">
        {property.title}
      </h1>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-100 underline underline-offset-2 transition-colors"
        >
          <HiOutlineShare className="w-4 h-4" />
          Share
        </button>
        <button
          onClick={() => { setSaved((s) => !s); toast.success(saved ? "Removed from saved" : "Saved"); }}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-100 underline underline-offset-2 transition-colors"
        >
          {saved ? <HiHeart className="w-4 h-4 text-rose-500" /> : <HiOutlineHeart className="w-4 h-4" />}
          Save
        </button>
      </div>
    </div>
  );
}
