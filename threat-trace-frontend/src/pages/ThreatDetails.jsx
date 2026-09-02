import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Clock,
  Globe,
  AlertTriangle,
  FileSearch,
  MapPin,
  FolderPlus,
  Bot,
  Copy,
  Check,
  ExternalLink,
  Link2,
  Zap,
  Code2,
  Briefcase,
  Monitor,
  CheckCircle2,
  X,
  Loader2,
  Download,
  Terminal
} from 'lucide-react';
import { getEmailById, getStoredEmails } from '../utils/emailAnalyzer';
import { SeverityBadge } from '../components/common/Badge';
import { getThreatScoreColor, getThreatScoreSeverity, getClassificationLabel, formatDateTime } from '../utils/helpers';
import { toast } from 'sonner';

export default function ThreatDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const allEmails = getStoredEmails();

  // Find email by ID, default to first (Critical) if not found
  const activeId = id || allEmails[0]?.id || 'eml-001';
  const detail = getEmailById(activeId);

  const [artifactTab, setArtifactTab] = useState('html'); // 'headers' | 'html' | 'sandbox' | 'yara'
  const [executiveMode, setExecutiveMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedRule, setCopiedRule] = useState(false);

  // Containment Playbook State per sample
  const [containmentOpen, setContainmentOpen] = useState(false);
  const [containmentProgress, setContainmentProgress] = useState(0);
  const [containmentRunning, setContainmentRunning] = useState(false);
  const [containedMap, setContainedMap] = useState({});

  const isCurrentContained = !!containedMap[detail.id];
  const containmentComplete = containmentProgress === 100;

  const scoreColor = getThreatScoreColor(detail.threatScore);
  const severity = getThreatScoreSeverity(detail.threatScore);

  // SVG ring calculation
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (detail.threatScore / 100) * circumference;

  const copyRawHeaders = () => {
    navigator.clipboard.writeText(detail.rawHeaders || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyYaraRule = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedRule(true);
    toast.success('YARA / Sigma detection rule copied to clipboard');
    setTimeout(() => setCopiedRule(false), 2000);
  };

  // Run automated SOC containment playbook simulation for current active sample
  const handleExecuteContainment = (sampleId = detail.id) => {
    setContainmentOpen(true);
    setContainmentRunning(true);
    setContainmentProgress(10);

    setTimeout(() => setContainmentProgress(35), 450);
    setTimeout(() => setContainmentProgress(70), 950);
    setTimeout(() => setContainmentProgress(90), 1450);
    setTimeout(() => {
      setContainmentProgress(100);
      setContainmentRunning(false);
      setContainedMap((prev) => ({ ...prev, [sampleId]: true }));
      toast.success(`SOC Containment Playbook executed for ${sampleId.toUpperCase()}! Threat vectors isolated.`);
    }, 1900);
  };

  const targetDomain = detail.sender.split('@')[1] || 'paypa1-security.com';
  const targetIP = detail.originIP || '185.220.101.4';

  // Generated YARA Rule tailored to this sample
  const yaraRule = `rule ThreatTrace_${detail.id.replace('-', '_')}_PhishDetection {
    meta:
        author = "ThreatTrace Automated SOC Engine"
        date = "${new Date().toISOString().split('T')[0]}"
        description = "Detects ${detail.subject.replace(/"/g, '')} phishing artifacts"
        threat_score = "${detail.threatScore}"
        severity = "${severity.toUpperCase()}"
        ioc_domain = "${targetDomain}"
        ioc_ip = "${targetIP}"
    strings:
        $s1 = "${targetDomain}" ascii wide nocase
        $s2 = "verify your identity" ascii wide nocase
        $s3 = "immediate suspension" ascii wide nocase
        $s4 = "Authentication-Results: dkim=fail; dmarc=fail" ascii wide
    condition:
        ($s1 or $s2) and ($s3 or $s4)
}`;

  // Generated Sigma SIEM Rule
  const sigmaRule = `title: Detect Email Phishing Campaign targeting ${detail.recipient}
id: sigma-${detail.id}
status: production
description: Correlates network proxy traffic and email gateway logs matching campaign ${detail.id}
author: ThreatTrace SOC
logsource:
    category: email_delivery
    product: m365_exchange
detection:
    selection:
        sender_domain|contains: '${targetDomain}'
        connecting_ip: '${targetIP}'
        auth_dmarc: 'fail'
    condition: selection
falsepositives:
    - None known
level: critical`;

  // AI Diagnostic Summary text tailored to the email
  const getDiagnosticSummary = () => {
    if (detail.threatScore >= 80) {
      return (
        detail.diagnosticSummary ||
        `This communication exhibits multiple critical threat vectors indicative of a targeted credential harvesting attack. Analysis confirms a severe sender-domain mismatch (displaying internal corporate branding while originating from an external, low-reputation infrastructure). The payload utilizes credential request patterns masked within a fabricated administrative workflow, amplified by artificial urgency to bypass user scrutiny.`
      );
    }
    if (detail.threatScore >= 50) {
      return (
        detail.diagnosticSummary ||
        `Linguistic and infrastructure evaluation indicates a high probability of Business Email Compromise (BEC) and unauthorized financial invoice redirection. Authentication records reveal SPF softfail and suspicious unverified relay routing from fresh hosting infrastructure.`
      );
    }
    return (
      detail.diagnosticSummary ||
      `Comprehensive protocol inspection verified valid DKIM cryptographic signatures and full SPF/DMARC alignment. Content parsing detected zero coercion markers, unverified external links, or anomalous sender-domain mismatches. Communication cleared as legitimate.`
    );
  };

  // Detection Signatures
  const signatures = [
    {
      id: 'dmarc',
      title: detail.authentication?.dmarc?.status === 'FAIL' ? 'DMARC Failed' : (detail.authentication?.dmarc?.status === 'PASS' ? 'DMARC Passed' : 'DMARC Policy Warning'),
      detail: detail.authentication?.dmarc?.status === 'FAIL' ? 'Domain alignment checks failed. Sender IP not authorized.' : 'Cryptographic domain alignment verified.',
      isCritical: detail.authentication?.dmarc?.status === 'FAIL',
      icon: detail.authentication?.dmarc?.status === 'FAIL' ? ShieldX : ShieldCheck,
    },
    {
      id: 'domain',
      title: detail.threatScore > 50 ? 'Suspicious Sender Domain' : 'Verified Enterprise Domain',
      detail: detail.threatScore > 50 ? `Domain '${targetDomain}' registered under disposable infrastructure.` : `Domain '${targetDomain}' has established corporate history.`,
      isCritical: false,
      icon: Globe,
    },
    {
      id: 'urgency',
      title: detail.threatScore > 50 ? 'Urgency Language Detected' : 'Standard Business Tone',
      detail: detail.threatScore > 50 ? 'NLP identified high coercion ("immediate suspension", "24 hours").' : 'No artificial pressure keywords or coercive phrases detected.',
      isCritical: false,
      icon: Clock,
    },
    {
      id: 'url',
      title: detail.urls?.some(u => u.malicious) ? 'Malicious URL Found' : (detail.urls?.length > 0 ? 'Verified Safe Links' : 'No External Links Found'),
      detail: detail.urls?.some(u => u.malicious) ? 'Embedded link directs to known credential harvesting infrastructure.' : 'All embedded URLs routed to verified corporate infrastructure.',
      isCritical: detail.urls?.some(u => u.malicious),
      icon: Link2,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Sample Switcher Tabs */}
      <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-4 shadow-[var(--shadow-sm)]">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
          Select Analyzed Email Threat Sample
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {allEmails.map((email) => {
            const isSelected = email.id === detail.id;
            const sev = getThreatScoreSeverity(email.threatScore);
            return (
              <button
                key={email.id}
                onClick={() => navigate(`/threats/${email.id}`)}
                className={`flex items-center justify-between p-3 rounded-[var(--radius-sm)] border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[var(--color-brand-black)] bg-[var(--color-surface)] ring-1 ring-[var(--color-brand-black)] shadow-[var(--shadow-sm)]'
                    : 'border-[var(--color-border-subtle)] bg-[var(--color-canvas)] hover:border-[var(--color-border-strong)]'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`w-2 h-2 rounded-full ${sev === 'critical' ? 'bg-red-600' : sev === 'high' ? 'bg-amber-500' : 'bg-emerald-600'}`} />
                    <span className="text-xs font-bold text-[var(--color-text-primary)] uppercase">{sev} ({email.threatScore}/100)</span>
                  </div>
                  <p className="text-xs font-medium text-[var(--color-text-primary)] truncate max-w-[200px]">{email.subject}</p>
                  <p className="text-[10px] font-mono text-[var(--color-text-muted)] truncate">{email.sender}</p>
                </div>
                <SeverityBadge severity={sev} score={email.threatScore} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Header Breadcrumb & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-1">
        <div>
          <p className="text-xs font-mono text-[var(--color-text-muted)]">
            Received: {formatDateTime(detail.date)} · Target: <span className="font-semibold text-[var(--color-text-primary)]">{detail.recipient || 'finance@acmecorp.com'}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Executive Mode Toggle */}
          <button
            onClick={() => setExecutiveMode(!executiveMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-[var(--radius-sm)] border transition-all cursor-pointer ${
              executiveMode
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-[var(--color-canvas)] border-[var(--color-border-subtle)] text-slate-700 hover:border-slate-400'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{executiveMode ? 'Executive Brief ON' : 'C-Level Brief'}</span>
          </button>

          {/* 1-Click Automated Containment Playbook Button (All High / Critical Cases) */}
          {detail.threatScore >= 40 && (
            <button
              onClick={() => handleExecuteContainment(detail.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-[var(--radius-sm)] shadow-xs transition-colors cursor-pointer ${
                isCurrentContained
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{isCurrentContained ? 'Contained (Re-run)' : 'Execute Containment'}</span>
            </button>
          )}

          <button
            onClick={() => navigate(`/forensics/${detail.id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] hover:border-[var(--color-border-strong)] transition-colors cursor-pointer"
          >
            <FileSearch className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            <span>Forensics</span>
          </button>
          <button
            onClick={() => navigate(`/trace/${detail.originIP || detail.receivedChain?.[0]?.ip || '185.220.101.4'}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] hover:border-[var(--color-border-strong)] transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            <span>Trace Origin</span>
          </button>
          <button
            onClick={() => navigate('/cases')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[var(--color-brand-black)] rounded-[var(--radius-sm)] hover:bg-neutral-800 transition-colors shadow-[var(--shadow-sm)] cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Create Case</span>
          </button>
        </div>
      </div>

      {/* C-Level Executive Brief Card (Visible when toggled) */}
      {executiveMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-xs space-y-3 animate-in fade-in zoom-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-800" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                CISO & Board Executive Briefing
              </h3>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-200 text-amber-900 rounded">
              Financial Impact Assessment
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-white/80 p-3 rounded-lg border border-amber-100">
              <span className="text-slate-500 block text-[11px]">Attack Vector</span>
              <strong className="text-slate-900 font-bold block mt-0.5">Brand Identity Impersonation</strong>
            </div>
            <div className="bg-white/80 p-3 rounded-lg border border-amber-100">
              <span className="text-slate-500 block text-[11px]">Est. Exposure / Impact</span>
              <strong className="text-red-700 font-bold block mt-0.5">$48,500 Wire Diversion Risk</strong>
            </div>
            <div className="bg-white/80 p-3 rounded-lg border border-amber-100">
              <span className="text-slate-500 block text-[11px]">Compliance Status</span>
              <strong className="text-emerald-700 font-bold block mt-0.5">Contained · Zero Breach Logged</strong>
            </div>
          </div>

          <p className="text-xs text-amber-950 leading-relaxed bg-white/60 p-3 rounded-lg border border-amber-100">
            <strong>Executive Summary:</strong> An external threat actor attempted unauthorized impersonation of corporate identity. Automated AI forensics blocked authentication relays and quarantined communications before any credentials or funds were compromised. Recommended board action: Maintain active enforcement of DMARC rejection policy.
          </p>
        </div>
      )}

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Threat Score Card */}
          <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-6 shadow-[var(--shadow-sm)] relative flex flex-col items-center">
            {/* Top Right Classification Badge */}
            <div className="absolute top-4 right-4">
              <span className={`px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded ${
                severity === 'critical'
                  ? 'bg-red-100 text-red-700'
                  : severity === 'high'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {detail.classification || 'PHISHING'}
              </span>
            </div>

            {/* Circular Score Gauge */}
            <div className="relative w-36 h-36 mt-4 mb-3 flex items-center justify-center">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="#F4F4F5"
                  strokeWidth="10"
                />
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={severity === 'critical' ? '#B91C1C' : severity === 'high' ? '#D97706' : '#10B981'}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold tracking-tight font-mono text-[var(--color-text-primary)]">
                  {detail.threatScore}
                </span>
                <span className="text-xs font-semibold text-[var(--color-text-muted)] mt-0.5">
                  / 100
                </span>
              </div>
            </div>

            {/* Bottom Verdict */}
            <div className="text-center mt-2">
              <h2 className="text-base font-bold text-[var(--color-text-primary)]">
                {severity === 'critical' ? 'Critical Threat' : severity === 'high' ? 'High Risk Threat' : 'Clean / Safe Email'}
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {severity === 'critical' ? 'Immediate containment recommended.' : severity === 'high' ? 'Analyst review recommended.' : 'Zero security anomalies detected.'}
              </p>
            </div>
          </div>

          {/* AI Diagnostic Summary Card */}
          <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-6 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-4 h-4 text-[var(--color-brand-black)]" />
              <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
                AI Diagnostic Summary
              </h2>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed text-justify">
              {getDiagnosticSummary()}
            </p>
          </div>
        </div>

        {/* Right Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Detection Signatures Card */}
          <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-6 shadow-[var(--shadow-sm)]">
            <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-4">
              Detection Signatures
            </h2>

            <div className="space-y-3">
              {signatures.map((sig) => {
                const IconComponent = sig.icon;
                return (
                  <div
                    key={sig.id}
                    className={`flex items-start gap-3.5 p-3.5 rounded-[var(--radius-sm)] border transition-all ${
                      sig.isCritical
                        ? 'bg-[#FEF2F2] border-red-200 text-red-900'
                        : 'bg-[var(--color-canvas)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)]'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <IconComponent className={`w-4 h-4 ${sig.isCritical ? 'text-red-600' : 'text-neutral-700'}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className={`text-xs font-bold ${sig.isCritical ? 'text-red-900' : 'text-[var(--color-text-primary)]'}`}>
                        {sig.title}
                      </h3>
                      <p className={`text-xs mt-0.5 leading-normal ${sig.isCritical ? 'text-red-700' : 'text-[var(--color-text-muted)]'}`}>
                        {sig.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Raw Content & Sandbox Artifact Card */}
          <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] overflow-hidden shadow-[var(--shadow-sm)]">
            {/* Header & Tabs */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)] flex-wrap gap-2">
              <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
                Forensic Artifact Inspection
              </h2>
              <div className="flex items-center gap-1 bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] p-0.5 rounded-[var(--radius-sm)] flex-wrap">
                <button
                  onClick={() => setArtifactTab('html')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                    artifactTab === 'html'
                      ? 'bg-[var(--color-brand-black)] text-white'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  HTML Body
                </button>
                <button
                  onClick={() => setArtifactTab('headers')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                    artifactTab === 'headers'
                      ? 'bg-[var(--color-brand-black)] text-white'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  RFC Headers
                </button>
                <button
                  onClick={() => setArtifactTab('sandbox')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer flex items-center gap-1 ${
                    artifactTab === 'sandbox'
                      ? 'bg-[var(--color-brand-black)] text-white'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  <Monitor className="w-3 h-3" />
                  <span>Sandbox Preview</span>
                </button>
                <button
                  onClick={() => setArtifactTab('yara')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer flex items-center gap-1 ${
                    artifactTab === 'yara'
                      ? 'bg-[var(--color-brand-black)] text-white'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  <Code2 className="w-3 h-3" />
                  <span>YARA / Sigma</span>
                </button>
              </div>
            </div>

            {/* Artifact Body */}
            <div className="p-6">
              {/* Tab 1: HTML Body */}
              {artifactTab === 'html' && (
                <div className="space-y-4 text-xs font-sans">
                  <div className="space-y-1.5 pb-4 border-b border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]">
                    <p>
                      <strong className="text-[var(--color-text-primary)] font-semibold">From:</strong> {detail.senderDisplay || 'IT Support'} &lt;{detail.sender}&gt;
                    </p>
                    <p>
                      <strong className="text-[var(--color-text-primary)] font-semibold">To:</strong> {detail.recipient || 'admin@corp.net'}
                    </p>
                    <p>
                      <strong className="text-[var(--color-text-primary)] font-semibold">Subject:</strong> {detail.subject}
                    </p>
                  </div>

                  <div className="space-y-3 pt-1 text-[var(--color-text-primary)] leading-relaxed">
                    <p>Dear User,</p>
                    <div className="border-l-4 border-l-black bg-neutral-100/80 p-3.5 rounded-r text-xs text-neutral-900 leading-relaxed font-medium">
                      We have detected unusual activity on your corporate account. To prevent <span className="font-bold">immediate suspension</span>, you must verify your identity.
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Please click the secure link below to update your credentials within the next <span className="font-bold text-[var(--color-text-primary)]">24 hours</span>.
                    </p>
                    {detail.urls?.length > 0 && (
                      <div className="pt-2">
                        <a
                          href="#verify"
                          onClick={(e) => e.preventDefault()}
                          className="inline-block text-xs font-mono text-red-600 underline break-all bg-red-50 px-2 py-1 rounded border border-red-100"
                        >
                          {detail.urls[0].url}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Raw Headers */}
              {artifactTab === 'headers' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
                    <span className="text-xs font-mono text-[var(--color-text-muted)]">RFC 822 Raw Headers</span>
                    <button
                      onClick={copyRawHeaders}
                      className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded text-[11px] font-mono text-[var(--color-text-secondary)] whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                    {detail.rawHeaders || `Received: from mail.${targetDomain} (${targetIP}) by mx.acmecorp.com;
From: "${detail.senderDisplay}" <${detail.sender}>
To: ${detail.recipient}
Subject: ${detail.subject}
Authentication-Results: spf=fail; dkim=fail; dmarc=fail`}
                  </pre>
                </div>
              )}

              {/* Tab 3: Headless Browser Sandbox Screenshot */}
              {artifactTab === 'sandbox' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                      <span className="font-bold text-slate-800">Quarantined Headless Chromium Sandbox</span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">DOM Snapshot: Isolated Container</span>
                  </div>

                  {/* Browser Mockup Frame */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden shadow-xs bg-slate-900 text-slate-100">
                    <div className="px-3 py-2 bg-slate-800 border-b border-slate-700 flex items-center gap-2 text-[11px]">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      </div>
                      <div className="flex-1 bg-slate-900 px-3 py-1 rounded font-mono text-[10px] text-red-400 border border-red-900/50 flex items-center justify-between">
                        <span>https://{targetDomain}/verify?session_token=harvest_98a1</span>
                        <span className="text-[9px] uppercase font-bold bg-red-950 text-red-400 px-1 rounded">DECEPTIVE LOGIN</span>
                      </div>
                    </div>

                    <div className="p-8 bg-slate-950 flex flex-col items-center justify-center min-h-[220px] text-center">
                      <div className="max-w-xs w-full bg-slate-900 p-5 rounded-lg border border-slate-800 space-y-3">
                        <p className="font-bold text-sm text-white">Sign In to Continue</p>
                        <p className="text-[10px] text-slate-400">Security verification required for your corporate account</p>
                        <input type="text" placeholder="Email or Username" disabled className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-400" />
                        <input type="password" placeholder="Password" disabled className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-400" />
                        <button disabled className="w-full py-1.5 bg-red-600 text-white rounded font-bold text-xs opacity-75">Verify & Login</button>
                      </div>
                      <p className="text-[10px] text-red-400 mt-4">
                        ⚠️ Sandbox flagged: Intercepts POST credentials to unencrypted Tor node ({targetIP}).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: YARA & Sigma Rules */}
              {artifactTab === 'yara' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">YARA & Sigma SIEM Detection Signatures</span>
                    <button
                      onClick={() => copyYaraRule(yaraRule + '\n\n---\n\n' + sigmaRule)}
                      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-black text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      {copiedRule ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedRule ? 'Copied All' : 'Copy Rules'}</span>
                    </button>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">YARA Rule:</span>
                    <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg text-[11px] font-mono overflow-x-auto">
                      {yaraRule}
                    </pre>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Sigma SIEM Detection Rule:</span>
                    <pre className="p-3 bg-slate-900 text-amber-300 rounded-lg text-[11px] font-mono overflow-x-auto">
                      {sigmaRule}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: 1-Click Automated SOC Containment Playbook */}
      {containmentOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-red-600 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Automated SOC Containment Playbook
                  </h3>
                  <p className="text-[11px] text-slate-400">Target ID: {detail.id} · Campaign #{detail.id.replace('eml-', '102')}</p>
                </div>
              </div>
              <button onClick={() => setContainmentOpen(false)} className="text-slate-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">
                  {containmentComplete ? 'Containment Playbook Completed' : 'Executing Active Response Steps...'}
                </span>
                <span className="font-mono text-black">{containmentProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${containmentComplete ? 'bg-emerald-600' : 'bg-red-600'}`}
                  style={{ width: `${containmentProgress}%` }}
                />
              </div>
            </div>

            {/* Playbook Steps Checklist */}
            <div className="space-y-2.5 text-xs">
              <div className={`p-3 rounded-lg border flex items-center justify-between ${containmentProgress >= 25 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <div className="flex items-center gap-2">
                  {containmentProgress >= 25 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                  <span>Block Origin IP ({targetIP}) on Edge Firewalls</span>
                </div>
                <span className="text-[10px] font-bold font-mono">Palo Alto / Fortinet</span>
              </div>

              <div className={`p-3 rounded-lg border flex items-center justify-between ${containmentProgress >= 50 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <div className="flex items-center gap-2">
                  {containmentProgress >= 50 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                  <span>Add Typosquat Domain ({targetDomain}) to DNS Sinkhole</span>
                </div>
                <span className="text-[10px] font-bold font-mono">Cloudflare Gateway</span>
              </div>

              <div className={`p-3 rounded-lg border flex items-center justify-between ${containmentProgress >= 75 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <div className="flex items-center gap-2">
                  {containmentProgress >= 75 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                  <span>Quarantine Correlated Inbox Messages (12 Recipients)</span>
                </div>
                <span className="text-[10px] font-bold font-mono">M365 Exchange</span>
              </div>

              <div className={`p-3 rounded-lg border flex items-center justify-between ${containmentProgress >= 100 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <div className="flex items-center gap-2">
                  {containmentProgress >= 100 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                  <span>Revoke Active SSO Tokens & Enforce MFA Challenge</span>
                </div>
                <span className="text-[10px] font-bold font-mono">Okta / Entra ID</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              {containmentProgress === 100 && (
                <button
                  onClick={() => handleExecuteContainment(detail.id)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                >
                  Re-run Playbook
                </button>
              )}
              <button
                onClick={() => setContainmentOpen(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-black rounded-lg hover:bg-neutral-800 cursor-pointer shadow-xs"
              >
                {containmentProgress === 100 ? 'Done & Close' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
