const STATUS_COLORS = {
  // general
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-500",
  // unit
  AVAILABLE: "bg-green-100 text-green-700",
  OCCUPIED: "bg-blue-100 text-blue-700",
  UNDER_MAINTENANCE: "bg-orange-100 text-orange-700",
  // lease
  PENDING: "bg-yellow-100 text-yellow-700",
  TERMINATED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-500",
  // payment
  PAID: "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-700",
  // maintenance
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
  // commission
  UNPAID: "bg-yellow-100 text-yellow-700",
  // blacklisted
  BLACKLISTED: "bg-red-100 text-red-700",
  // inquiry
  OPEN: "bg-blue-100 text-blue-700",
  RESPONDED: "bg-purple-100 text-purple-700",
  CLOSED: "bg-gray-100 text-gray-500",
};

export default function Badge({ status }) {
  const cls = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600";
  return <span className={`badge ${cls}`}>{status?.replace(/_/g, " ")}</span>;
}
