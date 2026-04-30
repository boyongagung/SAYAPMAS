interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: boolean;
  danger?: boolean;
}

export default function StatCard({ label, value, icon, accent, danger }: StatCardProps) {
  const color = danger ? 'var(--red-danger)' : accent ? 'var(--amber-accent)' : 'var(--coffee-mid)';
  return (
    <div className="rounded-xl border p-4 flex flex-col gap-3"
      style={{ backgroundColor: 'var(--cream-card)', borderColor: 'var(--cream-border)' }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--coffee-light)' }}>{label}</span>
        <span style={{ color }}>{icon}</span>
      </div>
      <span className="font-display text-2xl font-bold" style={{ color }}>{value}</span>
    </div>
  );
}
