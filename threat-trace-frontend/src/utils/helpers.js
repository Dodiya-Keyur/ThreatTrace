export function getSeverityConfig(severity) {
  const map = {
    critical: { bg: 'var(--color-threat-critical-bg)', text: 'var(--color-threat-critical)', border: '#FECACA', label: 'CRITICAL' },
    high: { bg: 'var(--color-threat-high-bg)', text: 'var(--color-threat-high)', border: '#FDE68A', label: 'HIGH' },
    medium: { bg: 'var(--color-threat-medium-bg)', text: 'var(--color-threat-medium)', border: '#FEF08A', label: 'MEDIUM' },
    low: { bg: 'var(--color-threat-low-bg)', text: 'var(--color-threat-low)', border: '#A7F3D0', label: 'LOW' },
    info: { bg: 'var(--color-threat-info-bg)', text: 'var(--color-threat-info)', border: '#BFDBFE', label: 'INFO' },
  };
  return map[severity] || map.info;
}

export function getAuthStatusConfig(status) {
  const s = status?.toUpperCase();
  if (s === 'PASS') return { bg: 'var(--color-threat-low-bg)', text: 'var(--color-threat-low)', label: 'PASS' };
  if (s === 'FAIL') return { bg: 'var(--color-threat-critical-bg)', text: 'var(--color-threat-critical)', label: 'FAIL' };
  if (s === 'SOFTFAIL') return { bg: 'var(--color-threat-high-bg)', text: 'var(--color-threat-high)', label: 'SOFTFAIL' };
  return { bg: 'var(--color-surface-elevated)', text: 'var(--color-text-muted)', label: s || 'NONE' };
}

export function getClassificationLabel(classification) {
  const map = {
    PHISHING: 'Phishing',
    BEC: 'Business Email Compromise',
    CREDENTIAL_THEFT: 'Credential Theft',
    MALWARE: 'Malware',
    SPOOFING: 'Spoofing',
    FRAUD: 'Fraud',
    IMPERSONATION: 'Impersonation',
    SUSPICIOUS: 'Suspicious',
    LEGITIMATE: 'Legitimate',
  };
  return map[classification] || classification;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatTimeAgo(dateStr) {
  if (!dateStr) return '—';
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getThreatScoreColor(score) {
  if (score >= 85) return 'var(--color-threat-critical)';
  if (score >= 65) return 'var(--color-threat-high)';
  if (score >= 40) return 'var(--color-threat-medium)';
  return 'var(--color-threat-low)';
}

export function getThreatScoreSeverity(score) {
  if (score >= 85) return 'critical';
  if (score >= 65) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}
