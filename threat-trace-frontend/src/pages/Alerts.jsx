import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Filter } from 'lucide-react';
import { alerts as mockAlerts } from '../data/mockData';
import { SeverityBadge } from '../components/common/Badge';
import { formatTimeAgo } from '../utils/helpers';

export default function Alerts() {
  const navigate = useNavigate();
  const [alertsList, setAlertsList] = useState(mockAlerts);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? alertsList :
    filter === 'unread' ? alertsList.filter(a => !a.read) :
    alertsList.filter(a => a.severity === filter);

  const markRead = (id) => {
    setAlertsList(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const markAllRead = () => {
    setAlertsList(prev => prev.map(a => ({ ...a, read: true })));
  };

  const unreadCount = alertsList.filter(a => !a.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Alerts</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={markAllRead}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] hover:border-[var(--color-border-strong)] transition-colors"
        >
          <CheckCheck className="w-3.5 h-3.5" /> Mark all read
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-1 bg-[var(--color-surface)] rounded-[var(--radius-sm)] p-1 w-fit flex-wrap">
        {['all', 'unread', 'critical', 'high', 'medium'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] transition-all capitalize ${
              filter === f
                ? 'bg-[var(--color-canvas)] text-[var(--color-text-primary)] shadow-[var(--shadow-sm)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div className="space-y-2">
        {filtered.map((alert) => (
          <div
            key={alert.id}
            className={`bg-[var(--color-canvas)] border rounded-[var(--radius-md)] p-4 cursor-pointer transition-all hover:border-[var(--color-border-strong)] ${
              alert.read ? 'border-[var(--color-border-subtle)]' : 'border-l-4 border-l-[var(--color-threat-critical)] border-[var(--color-border-subtle)]'
            }`}
            onClick={() => alert.emailId && navigate(`/threats/${alert.emailId}`)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${alert.read ? 'bg-transparent' : 'bg-[var(--color-threat-critical)]'}`} />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <SeverityBadge severity={alert.severity} />
                    <span className="text-xs text-[var(--color-text-muted)]">{formatTimeAgo(alert.timestamp)}</span>
                  </div>
                  <h3 className={`text-sm font-medium ${alert.read ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-primary)]'}`}>
                    {alert.title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">{alert.description}</p>
                  {alert.caseId && (
                    <span
                      className="inline-block mt-2 text-[10px] font-mono text-[var(--color-text-muted)] bg-[var(--color-surface)] px-1.5 py-0.5 rounded cursor-pointer hover:bg-[var(--color-surface-elevated)]"
                      onClick={(e) => { e.stopPropagation(); navigate(`/cases/${alert.caseId}`); }}
                    >
                      {alert.caseId}
                    </span>
                  )}
                </div>
              </div>
              {!alert.read && (
                <button
                  onClick={(e) => { e.stopPropagation(); markRead(alert.id); }}
                  className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] rounded-[var(--radius-sm)] transition-colors shrink-0"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
