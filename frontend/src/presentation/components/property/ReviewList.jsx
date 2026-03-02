import { HiStar } from "react-icons/hi";

function FilledStar({ fill = 1 }) {
  // fill: 0=empty, 0.5=half, 1=full
  const id = `grad-${Math.random().toString(36).slice(2)}`;
  if (fill === 1)
    return <HiStar className="w-3 h-3 text-gray-800" />;
  return (
    <svg width="12" height="12" viewBox="0 0 24 24">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="#1f2937" />
          <stop offset={`${fill * 100}%`} stopColor="#d1d5db" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      />
    </svg>
  );
}

function RatingBar({ label, value }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-32 text-gray-700 text-sm">{label}</span>
      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gray-800 rounded-full transition-all"
          style={{ width: `${Math.min(100, (value / 5) * 100)}%` }}
        />
      </div>
      <span className="w-6 text-right text-sm font-medium text-gray-700">{value.toFixed(1)}</span>
    </div>
  );
}

function ReviewCard({ review }) {
  const fmtDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <div className="space-y-3">
      {/* Reviewer info */}
      <div className="flex items-center gap-3">
        {review.reviewer_avatar ? (
          <img
            src={review.reviewer_avatar}
            alt={review.reviewer_name}
            className="w-11 h-11 rounded-full object-cover bg-gray-100"
            onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
          />
        ) : null}
        <div
          className="w-11 h-11 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 text-white text-base font-bold items-center justify-center flex-shrink-0"
          style={{ display: review.reviewer_avatar ? "none" : "flex" }}
        >
          {review.reviewer_name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm leading-tight">{review.reviewer_name}</p>
          <p className="text-gray-400 text-xs mt-0.5">
            {review.stay_period || fmtDate(review.created_at)}
          </p>
        </div>
      </div>

      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <FilledStar key={n} fill={n <= review.rating ? 1 : 0} />
        ))}
      </div>

      {/* Comment */}
      <p className="text-gray-700 text-sm leading-relaxed line-clamp-5">{review.comment}</p>
    </div>
  );
}

export default function ReviewList({ reviews = [], avgRating = 0, reviewCount = 0 }) {
  if (reviews.length === 0) return null;

  const categories = [
    { label: "Cleanliness", score: Math.min(5, avgRating + 0.1) },
    { label: "Accuracy", score: Math.min(5, avgRating - 0.05) },
    { label: "Check-in", score: Math.min(5, avgRating + 0.15) },
    { label: "Communication", score: Math.min(5, avgRating - 0.1) },
    { label: "Location", score: Math.min(5, avgRating + 0.05) },
    { label: "Value", score: Math.max(1, avgRating - 0.2) },
  ];

  return (
    <div className="py-10 border-t border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <HiStar className="w-6 h-6 text-gray-900" />
        <h2 className="text-xl font-bold text-gray-900">
          {avgRating.toFixed(2)} · {reviewCount} review{reviewCount !== 1 ? "s" : ""}
        </h2>
      </div>

      {/* Rating category bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 mb-10">
        {categories.map((c) => (
          <RatingBar key={c.label} label={c.label} value={c.score} />
        ))}
      </div>

      {/* Review cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
        {reviews.map((r, i) => (
          <ReviewCard key={r.id || i} review={r} />
        ))}
      </div>
    </div>
  );
}
