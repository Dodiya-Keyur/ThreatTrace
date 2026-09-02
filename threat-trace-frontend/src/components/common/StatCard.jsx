import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, trend, trendLabel, iconColor }) {
  const isPositive = trend > 0;
  const trendColor = isPositive ? 'var(--color-threat-critical)' : 'var(--color-threat-low)';

  return (
    <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-5 hover:border-[var(--color-border-strong)] transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold tracking-wider uppercase text-[var(--color-text-muted)]">
          {label}
        </p>
        <div
          className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center transition-colors"
          style={{ backgroundColor: iconColor ? `${iconColor}15` : 'var(--color-surface-elevated)' }}
        >
          <Icon className="w-[18px] h-[18px]" style={{ color: iconColor || 'var(--color-text-secondary)' }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {trend !== undefined && (
        <div className="flex items-center gap-1 text-xs" style={{ color: trendColor }}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span className="font-medium">{Math.abs(trend)}%</span>
          <span className="text-[var(--color-text-muted)]">{trendLabel || 'vs last week'}</span>
        </div>
      )}
    </div>
  );
}
