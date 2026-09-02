import { useNavigate } from 'react-router-dom';
import { getStoredEmails } from '../utils/emailAnalyzer';
import { SeverityBadge, StatusBadge, AuthBadge } from '../components/common/Badge';
import { formatTimeAgo, getThreatScoreSeverity } from '../utils/helpers';

export default function Threats() {
  const navigate = useNavigate();
  const emails = getStoredEmails();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Detected Threats & Scanned Emails</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            All emails analyzed and classified by the AI threat detection engine
          </p>
        </div>
        <button
          onClick={() => navigate('/scanner')}
          className="px-4 py-2 text-xs font-semibold text-white bg-[var(--color-brand-black)] rounded-[var(--radius-sm)] hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          + Scan New Email
        </button>
      </div>

      <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--color-surface)]">
                <th className="text-left px-5 py-3 text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-muted)]">Subject</th>
                <th className="text-left px-3 py-3 text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-muted)]">Sender</th>
                <th className="text-center px-3 py-3 text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-muted)]">Score</th>
                <th className="text-left px-3 py-3 text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-muted)]">Type</th>
                <th className="text-center px-3 py-3 text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-muted)]">SPF</th>
                <th className="text-center px-3 py-3 text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-muted)]">DKIM</th>
                <th className="text-center px-3 py-3 text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-muted)]">DMARC</th>
                <th className="text-left px-3 py-3 text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-muted)]">Status</th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-muted)]">Time</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((threat) => {
                const spf = threat.spf || threat.authentication?.spf?.status || 'NONE';
                const dkim = threat.dkim || threat.authentication?.dkim?.status || 'NONE';
                const dmarc = threat.dmarc || threat.authentication?.dmarc?.status || 'NONE';
                return (
                  <tr
                    key={threat.id}
                    className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-surface)] cursor-pointer transition-colors"
                    onClick={() => navigate(`/threats/${threat.id}`)}
                  >
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-[var(--color-text-primary)] truncate max-w-[280px]">{threat.subject}</p>
                      <p className="text-[10px] font-mono text-[var(--color-text-muted)] mt-0.5">{threat.id}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-xs text-[var(--color-text-primary)]">{threat.senderDisplay || threat.sender}</p>
                      <p className="text-[10px] font-mono text-[var(--color-text-muted)]">{threat.sender}</p>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <SeverityBadge severity={getThreatScoreSeverity(threat.threatScore)} score={threat.threatScore} />
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-medium text-[var(--color-text-secondary)]">{threat.classification}</span>
                    </td>
                    <td className="px-3 py-3 text-center"><AuthBadge status={spf} /></td>
                    <td className="px-3 py-3 text-center"><AuthBadge status={dkim} /></td>
                    <td className="px-3 py-3 text-center"><AuthBadge status={dmarc} /></td>
                    <td className="px-3 py-3"><StatusBadge status={threat.status || 'detected'} /></td>
                    <td className="px-5 py-3 text-right text-xs text-[var(--color-text-muted)]">{formatTimeAgo(threat.date)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
