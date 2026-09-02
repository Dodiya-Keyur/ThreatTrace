import { Archive, Hash, User, Calendar, Clock, ShieldCheck, FileText } from 'lucide-react';
import { evidenceItems } from '../data/mockData';
import { StatusBadge } from '../components/common/Badge';
import { formatDateTime } from '../utils/helpers';

export default function Evidence() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Chain of Custody</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Evidence registry with SHA-256 hashing, collection audit trails, and preservation logs
        </p>
      </div>

      <div className="space-y-4">
        {evidenceItems.map((item) => (
          <div key={item.id} className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] overflow-hidden">
            {/* Evidence Header */}
            <div className="flex items-start justify-between p-5 border-b border-[var(--color-border-subtle)]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[var(--color-threat-info-bg)] rounded-[var(--radius-sm)] flex items-center justify-center shrink-0">
                  <Archive className="w-5 h-5 text-[var(--color-threat-info)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[var(--color-text-primary)]">{item.id}</span>
                    <StatusBadge status={item.status} />
                    <span className="text-[10px] text-[var(--color-text-muted)] font-mono">{item.caseId}</span>
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{item.filename}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase mt-0.5">{item.type.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                  <User className="w-3 h-3" /> {item.collectedBy}
                </div>
                <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] mt-0.5">
                  <Calendar className="w-3 h-3" /> {formatDateTime(item.collectedDate)}
                </div>
              </div>
            </div>

            {/* Hash */}
            <div className="px-5 py-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
              <div className="flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase">SHA-256</span>
              </div>
              <p className="text-xs font-mono text-[var(--color-text-primary)] mt-1 break-all">{item.sha256}</p>
            </div>

            {/* Audit Trail */}
            <div className="p-5">
              <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Audit Trail</h3>
              <div className="space-y-0">
                {item.actions.map((action, i) => {
                  const isLast = i === item.actions.length - 1;
                  return (
                    <div key={i} className="flex gap-3 pb-3 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-[var(--color-surface-elevated)] flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-3 h-3 text-[var(--color-threat-low)]" />
                        </div>
                        {!isLast && <div className="w-px flex-1 bg-[var(--color-border-subtle)] mt-1" />}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[var(--color-text-primary)]">{action.action}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">{action.by} · {formatDateTime(action.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
