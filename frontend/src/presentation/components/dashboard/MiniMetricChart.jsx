import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

function buildSeries(value) {
  const amount = Number(value) || 0;
  const shape = [56, 68, 79, 90, 100];
  return shape.map((pct, idx) => ({
    idx,
    value: Math.max(0, Math.round((amount * pct) / 100)),
  }));
}

const tone = {
  blue: { stroke: "#2563eb", fill: "#bfdbfe", chip: "bg-blue-50 text-blue-700" },
  emerald: { stroke: "#059669", fill: "#a7f3d0", chip: "bg-emerald-50 text-emerald-700" },
  amber: { stroke: "#d97706", fill: "#fde68a", chip: "bg-amber-50 text-amber-700" },
  rose: { stroke: "#e11d48", fill: "#fecdd3", chip: "bg-rose-50 text-rose-700" },
};

export default function MiniMetricChart({ title, value, toneKey = "blue", hint }) {
  const palette = tone[toneKey] || tone.blue;
  const data = buildSeries(value);

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value ?? 0}</p>
        </div>
        {hint && <span className={`rounded-md px-2 py-1 text-[11px] font-medium ${palette.chip}`}>{hint}</span>}
      </div>
      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <Tooltip
              formatter={(val) => [val, title]}
              labelFormatter={() => ""}
              cursor={false}
              contentStyle={{ borderRadius: 10, borderColor: "#e5e7eb" }}
            />
            <Area type="monotone" dataKey="value" stroke={palette.stroke} fill={palette.fill} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
