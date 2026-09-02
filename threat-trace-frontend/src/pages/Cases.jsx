import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Wifi,
  Globe,
  Plus,
  Clock,
  ChevronDown,
  X,
  Trash2,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { getStoredCases, createNewCase, deleteCase } from '../utils/casesManager';
import { getStoredEmails } from '../utils/emailAnalyzer';

export default function Cases() {
  const navigate = useNavigate();
  const [casesList, setCasesList] = useState(() => getStoredCases());
  const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'Critical' | 'High' | 'Open' | 'Resolved'
  const [sortBy, setSortBy] = useState('Last Updated');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState(null);
  const storedEmails = getStoredEmails();

  // Form State for new case modal
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('critical');
  const [assignee, setAssignee] = useState('Analyst A');
  const [selectedEmail, setSelectedEmail] = useState(storedEmails[0]?.id || 'eml-001');
  const [linkedIP, setLinkedIP] = useState('185.220.101.4');
  const [linkedDomain, setLinkedDomain] = useState('paypa1-security.com');
  const [tagInput, setTagInput] = useState('phishing, credential-theft, paypal');

  const handleCreateCase = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
    createNewCase({
      title: title.trim(),
      description: description.trim() || 'Active security investigation opened by analyst.',
      severity: severity,
      status: 'OPEN',
      assignee: assignee,
      relatedEmails: [selectedEmail],
      relatedIPs: [linkedIP.trim()],
      relatedDomains: [linkedDomain.trim()],
      tags: tags.length > 0 ? tags : ['incident', 'soc'],
    });

    setCasesList(getStoredCases());
    setShowModal(false);
    setTitle('');
    setDescription('');
  };

  const confirmDelete = () => {
    if (!caseToDelete) return;
    deleteCase(caseToDelete.id);
    setCasesList(getStoredCases());
    setCaseToDelete(null);
  };

  // Filtered and sorted cases
  const filteredCases = useMemo(() => {
    let result = [...casesList];

    // Filter
    if (activeFilter === 'Critical') {
      result = result.filter(c => c.severity?.toLowerCase() === 'critical');
    } else if (activeFilter === 'High') {
      result = result.filter(c => c.severity?.toLowerCase() === 'high');
    } else if (activeFilter === 'Open') {
      result = result.filter(c => c.status?.toUpperCase() === 'OPEN' || c.status?.toLowerCase() === 'investigating');
    } else if (activeFilter === 'Resolved') {
      result = result.filter(c => c.status?.toUpperCase() === 'RESOLVED' || c.status?.toLowerCase() === 'closed');
    }

    // Sort
    if (sortBy === 'Last Updated') {
      result.sort((a, b) => new Date(b.updatedDate || 0) - new Date(a.updatedDate || 0));
    } else if (sortBy === 'Title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'Email Count') {
      result.sort((a, b) => (b.emailCount || 0) - (a.emailCount || 0));
    }

    return result;
  }, [casesList, activeFilter, sortBy]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Cases Overview
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Manage and track active security investigations.
          </p>
        </div>

        {/* Top Right Action Button */}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[var(--color-brand-black)] rounded-[var(--radius-sm)] hover:bg-neutral-800 transition-colors shadow-[var(--shadow-sm)] cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Case</span>
        </button>
      </div>

      {/* 2. Filter Tabs and Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['All', 'Critical', 'High', 'Open', 'Resolved'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-sm)] transition-all cursor-pointer ${
                activeFilter === filter
                  ? 'bg-[var(--color-brand-black)] text-white shadow-[var(--shadow-sm)]'
                  : 'bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="relative self-end sm:self-auto">
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <span>Sort by:</span>
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-1 px-3 py-1.5 font-semibold text-[var(--color-text-primary)] bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] shadow-[var(--shadow-sm)] hover:border-[var(--color-border-strong)] transition-colors cursor-pointer"
            >
              <span>{sortBy}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            </button>
          </div>

          {showSortDropdown && (
            <div className="absolute right-0 mt-1 w-36 bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] shadow-lg py-1 z-30 text-xs">
              {['Last Updated', 'Title', 'Email Count'].map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSortBy(option);
                    setShowSortDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Case List Rows (Horizontal Cards) */}
      <div className="space-y-3">
        {filteredCases.map((c) => {
          const caseNum = c.id.replace('case-', '');
          const isCritical = c.severity?.toLowerCase() === 'critical';
          const isResolved = c.status?.toUpperCase() === 'RESOLVED' || c.status?.toLowerCase() === 'closed';

          return (
            <div
              key={c.id}
              className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-5 shadow-[var(--shadow-sm)] hover:border-[var(--color-border-strong)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group"
            >
              {/* Left Column: Title & Metadata */}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    #{caseNum}
                  </span>
                  <h2
                    onClick={() => navigate(`/cases/${c.id}`)}
                    className="text-sm sm:text-base font-bold text-[var(--color-text-primary)] hover:underline cursor-pointer"
                  >
                    {c.title}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mt-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{c.updatedLabel || `Updated recently by ${c.assignee || 'Analyst'}`}</span>
                </div>
              </div>

              {/* Middle Column: 3 Metric Counters */}
              <div className="flex items-center gap-8 sm:gap-10 border-t md:border-t-0 border-b md:border-b-0 py-3 md:py-0 border-slate-100 shrink-0">
                {/* Emails */}
                <div className="text-center min-w-[50px]">
                  <p className="text-sm font-extrabold text-[var(--color-text-primary)]">
                    {c.emailCount !== undefined ? Number(c.emailCount).toLocaleString() : 0}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] flex items-center justify-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>Emails</span>
                  </p>
                </div>

                {/* Domains */}
                <div className="text-center min-w-[50px]">
                  <p className="text-sm font-extrabold text-[var(--color-text-primary)]">
                    {c.domainCount || 0}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] flex items-center justify-center gap-1 mt-0.5">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span>Domains</span>
                  </p>
                </div>

                {/* IPs */}
                <div className="text-center min-w-[50px]">
                  <p className="text-sm font-extrabold text-[var(--color-text-primary)]">
                    {c.ipCount || 0}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] flex items-center justify-center gap-1 mt-0.5">
                    <Wifi className="w-3 h-3 text-slate-400" />
                    <span>IPs</span>
                  </p>
                </div>
              </div>

              {/* Right Column: Status Badge, View Case Button & Delete Trash Button */}
              <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                {/* Badge */}
                {isCritical ? (
                  <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded bg-red-100 text-red-700">
                    CRITICAL
                  </span>
                ) : isResolved ? (
                  <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded bg-slate-100 text-slate-600">
                    RESOLVED
                  </span>
                ) : (
                  <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded bg-slate-100 text-slate-700">
                    OPEN
                  </span>
                )}

                {/* View Case Button */}
                <button
                  onClick={() => navigate(`/cases/${c.id}`)}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] shadow-[var(--shadow-sm)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer text-[var(--color-text-primary)]"
                >
                  View Case
                </button>

                {/* Delete Case Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCaseToDelete(c);
                  }}
                  title="Delete case"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredCases.length === 0 && (
          <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-lg text-slate-500">
            <FolderOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-sm text-slate-700">No Cases Found</p>
            <p className="text-xs text-slate-400 mt-0.5">No cases matched the selected filter criteria.</p>
          </div>
        )}
      </div>

      {/* 4. Delete Confirmation Modal */}
      {caseToDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900">
                  Delete Investigation Case?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to delete <span className="font-bold text-slate-900">#{caseToDelete.id?.replace('case-', '')} "{caseToDelete.title}"</span>? This will remove the case and its linked indicators from the investigation dossier.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setCaseToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-semibold border border-slate-200 rounded hover:bg-slate-50 text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 rounded hover:bg-red-700 shadow-xs cursor-pointer"
              >
                Delete Case
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. New Case Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)] mb-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-[var(--color-brand-black)]" />
                <h2 className="text-base font-bold text-[var(--color-text-primary)]">Open New Investigation Case</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--color-text-primary)] mb-1">Case Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Targeted Executive BEC Wire Fraud Campaign"
                  className="w-full px-3 py-2 border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-black)] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--color-text-primary)] mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-black)] text-xs"
                  >
                    <option value="critical">CRITICAL</option>
                    <option value="high">HIGH</option>
                    <option value="medium">MEDIUM</option>
                    <option value="low">LOW</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[var(--color-text-primary)] mb-1">Lead Analyst</label>
                  <input
                    type="text"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-black)] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--color-text-primary)] mb-1">Target Threat Email</label>
                <select
                  value={selectedEmail}
                  onChange={(e) => setSelectedEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-black)] text-xs font-mono"
                >
                  {storedEmails.map((em) => (
                    <option key={em.id} value={em.id}>
                      [{em.id}] {em.subject?.substring(0, 45)}... ({em.sender})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--color-text-primary)] mb-1">Origin IP Indicator</label>
                  <input
                    type="text"
                    value={linkedIP}
                    onChange={(e) => setLinkedIP(e.target.value)}
                    className="w-full px-3 py-2 font-mono border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-black)] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--color-text-primary)] mb-1">Target Domain Indicator</label>
                  <input
                    type="text"
                    value={linkedDomain}
                    onChange={(e) => setLinkedDomain(e.target.value)}
                    className="w-full px-3 py-2 font-mono border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-black)] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--color-text-primary)] mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="phishing, wire-fraud, credential-harvest"
                  className="w-full px-3 py-2 border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-black)] text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--color-text-primary)] mb-1">Incident Summary & Scope</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the attack vector, affected employees, and forensic scope..."
                  className="w-full px-3 py-2 border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-black)] text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--color-border-subtle)]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-[var(--color-brand-black)] rounded-[var(--radius-sm)] hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Create & Save Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
