import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FolderOpen, Network, Mail, Globe, Wifi, MapPin, FileText, Clock, User, Tag, Plus, CheckCircle, ArrowLeft } from 'lucide-react';
import { getCaseById, saveCase, createNewReport, deleteCase } from '../utils/casesManager';
import { getStoredEmails, getEmailById } from '../utils/emailAnalyzer';
import { SeverityBadge, StatusBadge } from '../components/common/Badge';
import { formatDateTime } from '../utils/helpers';

export default function CaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(() => getCaseById(id));
  const [noteText, setNoteText] = useState('');
  const allEmails = getStoredEmails();

  const relatedEmailObjs = (caseData.relatedEmails || []).map(emId => getEmailById(emId)).filter(Boolean);

  const handleStatusChange = (newStatus) => {
    const updated = { ...caseData, status: newStatus, updatedDate: new Date().toISOString() };
    saveCase(updated);
    setCaseData(updated);
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const newEvent = {
      time: new Date().toISOString(),
      action: noteText.trim(),
      by: caseData.assignee || 'SOC Analyst',
    };

    const updatedTimeline = [newEvent, ...(caseData.timeline || [])];
    const updated = { ...caseData, timeline: updatedTimeline, updatedDate: new Date().toISOString() };
    saveCase(updated);
    setCaseData(updated);
    setNoteText('');
  };

  const handleGenerateReportForCase = () => {
    const report = createNewReport({
      title: `Forensic Incident Report — ${caseData.title} (${caseData.id})`,
      caseId: caseData.id,
      generatedBy: caseData.assignee || 'Dr. Anika Sharma',
      targetEmailId: caseData.relatedEmails?.[0] || 'eml-001'
    });
    navigate('/reports');
  };

  const timeline = caseData.timeline || [
    { time: caseData.createdDate, action: 'Case opened by SOC analyst', by: caseData.assignee },
    { time: caseData.updatedDate || caseData.createdDate, action: 'Evidence and IOCs correlated to case dossier', by: 'System' },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/cases')}
          className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] mb-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Cases
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderOpen className="w-4 h-4 text-[var(--color-text-muted)]" />
            <span className="text-xs font-mono font-bold text-[var(--color-text-muted)]">{caseData.id}</span>
            <StatusBadge status={caseData.status} />
            <SeverityBadge severity={caseData.severity} />
          </div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">{caseData.title}</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{caseData.description}</p>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => {
              if (window.confirm('Execute 1-Click SOC Containment Playbook across Firewall, DNS sinkhole, and M365 exchange?')) {
                handleStatusChange('contained');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-[var(--radius-sm)] shadow-xs transition-colors cursor-pointer animate-pulse"
          >
            Execute Containment
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete Case #${caseData.id?.replace('case-', '')}?`)) {
                deleteCase(caseData.id);
                navigate('/cases');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-[var(--radius-sm)] hover:bg-red-100 transition-colors cursor-pointer"
          >
            Delete Case
          </button>
          <button
            onClick={() => navigate(`/graph/${caseData.id}`)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[var(--color-brand-black)] rounded-[var(--radius-sm)] hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Network className="w-3.5 h-3.5" /> View Attack Graph
          </button>
          <button
            onClick={handleGenerateReportForCase}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] hover:border-[var(--color-border-strong)] transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" /> Generate Report
          </button>
        </div>
      </div>

      {/* Status Action Switcher */}
      <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <span className="font-semibold text-[var(--color-text-primary)]">Lead Investigator:</span>
          <span>{caseData.assignee || 'Dr. Anika Sharma'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-[var(--color-text-muted)] mr-1">Case Status:</span>
          {['investigating', 'contained', 'resolved', 'closed'].map((st) => (
            <button
              key={st}
              onClick={() => handleStatusChange(st)}
              className={`px-2.5 py-1 text-xs rounded-[var(--radius-sm)] capitalize font-semibold transition-all cursor-pointer ${
                caseData.status === st
                  ? 'bg-[var(--color-brand-black)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Mail, value: relatedEmailObjs.length || 1, label: 'Linked Emails' },
          { icon: Wifi, value: caseData.relatedIPs?.length || 1, label: 'Linked IPs' },
          { icon: Globe, value: caseData.relatedDomains?.length || 1, label: 'Linked Domains' },
          { icon: MapPin, value: caseData.countryCount || 2, label: 'Countries' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-4 text-center">
            <stat.icon className="w-5 h-5 text-[var(--color-text-muted)] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stat.value}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Related Emails & Linked Indicators */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] overflow-hidden">
            <div className="px-5 py-3 border-b border-[var(--color-border-subtle)]">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Linked Suspicious Emails ({relatedEmailObjs.length})</h2>
            </div>
            {relatedEmailObjs.map((email) => (
              <div
                key={email.id}
                className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-surface)] cursor-pointer transition-colors"
                onClick={() => navigate(`/threats/${email.id}`)}
              >
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{email.subject}</p>
                  <p className="text-xs font-mono text-[var(--color-text-muted)]">{email.sender}</p>
                </div>
                <SeverityBadge severity={email.severity} score={email.threatScore} />
              </div>
            ))}

            {/* Linked Domains */}
            <div className="px-5 py-3 border-b border-[var(--color-border-subtle)]">
              <h3 className="text-xs font-semibold text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">Linked Domains</h3>
              <div className="flex flex-wrap gap-2">
                {(caseData.relatedDomains || ['paypa1-security.com']).map((d) => (
                  <span
                    key={d}
                    className="px-2.5 py-1 text-xs font-mono bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] cursor-pointer hover:border-[var(--color-border-strong)] transition-colors"
                    onClick={() => navigate(`/domains/${d}`)}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Linked IPs */}
            <div className="px-5 py-3">
              <h3 className="text-xs font-semibold text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">Linked Origin IPs</h3>
              <div className="flex flex-wrap gap-2">
                {(caseData.relatedIPs || ['185.220.101.4']).map((ip) => (
                  <span
                    key={ip}
                    className="px-2.5 py-1 text-xs font-mono bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] cursor-pointer hover:border-[var(--color-border-strong)] transition-colors"
                    onClick={() => navigate(`/trace/${ip}`)}
                  >
                    {ip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline & Notes */}
        <div className="space-y-4">
          <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-5">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Investigation Timeline & Audit Trail</h2>
            
            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add analyst observation..."
                  className="flex-1 px-3 py-1.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-black)]"
                />
                <button type="submit" className="px-3 py-1.5 text-xs font-semibold text-white bg-[var(--color-brand-black)] rounded-[var(--radius-sm)] hover:bg-neutral-800 cursor-pointer">
                  + Add
                </button>
              </div>
            </form>

            <div className="space-y-0 max-h-[350px] overflow-y-auto">
              {timeline.map((event, i) => {
                const isLast = i === timeline.length - 1;
                return (
                  <div key={i} className="flex gap-3 pb-4 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-[var(--color-surface-elevated)] flex items-center justify-center shrink-0">
                        <Clock className="w-3 h-3 text-[var(--color-text-muted)]" />
                      </div>
                      {!isLast && <div className="w-px flex-1 bg-[var(--color-border-subtle)] mt-1" />}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[var(--color-text-primary)]">{event.action}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                        {event.by || 'SOC Analyst'} · {formatDateTime(event.time)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        <Tag className="w-4 h-4 text-[var(--color-text-muted)]" />
        {(caseData.tags || []).map((tag) => (
          <span key={tag} className="px-2.5 py-1 text-xs font-medium bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-full">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
