interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  colorClass?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  colorClass = 'text-indigo-400',
}: StatCardProps) {
  return (
    <div className="card flex items-start gap-4">
      <div
        className={`flex-shrink-0 p-3 rounded-xl bg-slate-800 ${colorClass}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          {title}
        </p>
        <p className="mt-1 text-3xl font-bold text-slate-100 tabular-nums">
          {value}
        </p>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
