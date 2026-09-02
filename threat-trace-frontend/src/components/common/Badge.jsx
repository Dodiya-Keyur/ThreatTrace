import { getSeverityConfig, getAuthStatusConfig } from '../../utils/helpers';

export function SeverityBadge({ severity, score, className = '' }) {
  const config = getSeverityConfig(severity);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${className}`}
      style={{ backgroundColor: config.bg, color: config.text, border: `1px solid ${config.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.text }} />
      {config.label}
      {score !== undefined && (
        <span className="font-mono">{score}/100</span>
      )}
    </span>
  );
}

export function AuthBadge({ status }) {
  const config = getAuthStatusConfig(status);
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    detected: { bg: 'var(--color-threat-critical-bg)', text: 'var(--color-threat-critical)', label: 'Detected' },
    investigating: { bg: 'var(--color-threat-high-bg)', text: 'var(--color-threat-high)', label: 'Investigating' },
    open: { bg: 'var(--color-threat-info-bg)', text: 'var(--color-threat-info)', label: 'Open' },
    resolved: { bg: 'var(--color-threat-low-bg)', text: 'var(--color-threat-low)', label: 'Resolved' },
    cleared: { bg: 'var(--color-surface-elevated)', text: 'var(--color-text-muted)', label: 'Cleared' },
    generated: { bg: 'var(--color-threat-low-bg)', text: 'var(--color-threat-low)', label: 'Generated' },
    preserved: { bg: 'var(--color-threat-info-bg)', text: 'var(--color-threat-info)', label: 'Preserved' },
  };
  const config = map[status] || map.open;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  );
}
