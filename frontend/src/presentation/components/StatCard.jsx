/** Reusable stat card for dashboards */
export default function StatCard({ title, value, icon: Icon, color = "primary" }) {
  const colors = {
    primary: "bg-primary-50 text-primary-700",
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    red: "bg-red-50 text-red-700",
    purple: "bg-purple-50 text-purple-700",
    rose: "bg-rose-50 text-rose-700",
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${colors[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value ?? "—"}</p>
      </div>
    </div>
  );
}
