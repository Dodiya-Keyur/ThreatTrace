import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Globe,
  Server,
  Inbox,
  AlertTriangle,
  Copy,
  Check,
  Code2,
  GitCommitHorizontal,
  ArrowLeft,
  XCircle,
  CheckCircle2
} from 'lucide-react';
import { getEmailById, getStoredEmails } from '../utils/emailAnalyzer';
import { SeverityBadge } from '../components/common/Badge';
import { getThreatScoreSeverity } from '../utils/helpers';

export default function Forensics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const allEmails = getStoredEmails();

  // Find email by ID, default to first if not found
  const activeId = id || allEmails[0]?.id || 'eml-001';
  const detail = getEmailById(activeId);

  const [copied, setCopied] = useState(false);

  const copyHeaders = () => {
    navigator.clipboard.writeText(detail.rawHeaders || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const spf = detail.authentication?.spf || { status: 'FAIL', detail: `Sender IP ${detail.originIP || '103.45.12.89'} is not authorized by the domain's SPF record.` };
  const dkim = detail.authentication?.dkim || { status: 'FAIL', detail: 'Signature validation failed. The message body or headers may have been altered in transit.' };
  const dmarc = detail.authentication?.dmarc || { status: 'FAIL', detail: 'Both SPF and DKIM checks failed alignment. Policy dictates rejection.' };

  const isSpfPass = spf.status === 'PASS';
  const isDkimPass = dkim.status === 'PASS';
  const isDmarcPass = dmarc.status === 'PASS';

  // Format highlighted raw headers
  const getRawHeaderLines = () => {
    const raw = detail.rawHeaders || `Return-Path: <bounce@${detail.sender?.split('@')[1] || 'fake-domain.com'}>
Delivered-To: ${detail.recipient || 'victim@internal-corp.net'}
Received: from mail.${detail.sender?.split('@')[1] || 'fake-domain.com'} (mail.${detail.sender?.split('@')[1] || 'fake-domain.com'} [192.168.1.100])
    by mx-in.internal-corp.net with ESMTP id K8X92M
    for <${detail.recipient || 'victim@internal-corp.net'}>; Fri, 27 Oct 2026 08:14:12 -0400 (EDT)
Received: from unknown (HELO spoofed.sender.com) (${detail.originIP || '103.45.12.89'})
    by mail.${detail.sender?.split('@')[1] || 'fake-domain.com'} with SMTP id B82A4F
    for <${detail.recipient || 'victim@internal-corp.net'}>; Fri, 27 Oct 2026 08:14:09 -0400 (EDT)
Message-ID: <${detail.id}.23489@${detail.sender?.split('@')[1] || 'fake-domain.com'}>
Date: Fri, 27 Oct 2026 08:14:02 -0400
From: "${detail.senderDisplay || 'IT Support'}" <${detail.sender}>
To: ${detail.recipient || 'victim@internal-corp.net'}
Subject: ${detail.subject}
MIME-Version: 1.0
Content-Type: text/html; charset="UTF-8"
Authentication-Results: mx-in.internal-corp.net;
    spf=${spf.status.toLowerCase()} (sender IP is ${detail.originIP || '103.45.12.89'}) smtp.mailfrom=bounce@${detail.sender?.split('@')[1] || 'fake-domain.com'};
    dkim=${dkim.status.toLowerCase()} (bad signature) header.d=${detail.sender?.split('@')[1] || 'fake-domain.com'};
    dmarc=${dmarc.status.toLowerCase()} (p=reject dis=reject) header.from=${detail.sender?.split('@')[1] || 'internal-corp.net'}
X-Priority: 1 (Highest)
X-Mailer: PHPMailer 5.2.14`;

    return raw.split('\n');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Interactive Sample Selector Tabs */}
      <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-4 shadow-[var(--shadow-sm)]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Select Email to Inspect Protocol Forensics
          </p>
          <button
            onClick={() => navigate(`/threats/${detail.id}`)}
            className="text-xs font-medium text-[var(--color-brand-black)] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Threat Score
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {allEmails.map((email) => {
            const isSelected = email.id === detail.id;
            const sev = getThreatScoreSeverity(email.threatScore);
            return (
              <button
                key={email.id}
                onClick={() => navigate(`/forensics/${email.id}`)}
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

      {/* 1. Top Section: 3 Authentication Protocol Cards (SPF, DKIM, DMARC) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SPF Card */}
        <div className={`bg-white border rounded-[var(--radius-sm)] p-5 shadow-[var(--shadow-sm)] flex flex-col justify-between relative overflow-hidden ${
          isSpfPass ? 'border-emerald-300 border-r-4 border-r-emerald-600' : 'border-slate-200 border-r-4 border-r-[#B91C1C]'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-[var(--color-text-primary)]">SPF</h2>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                isSpfPass ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
              }`}>
                {isSpfPass ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {isSpfPass ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">
              {isSpfPass
                ? `Sender IP ${detail.originIP || '40.107.92.75'} is authorized by domain's SPF record.`
                : `Sender IP ${detail.originIP || '103.45.12.89'} is not authorized by the domain's SPF record.`}
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-100 font-mono">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">RECORD EVALUATED</span>
            <span className="text-[var(--color-text-primary)] font-semibold">{isSpfPass ? 'v=spf1 include:spf.protection.outlook.com -all' : 'v=spf1 -all'}</span>
          </div>
        </div>

        {/* DKIM Card */}
        <div className={`bg-white border rounded-[var(--radius-sm)] p-5 shadow-[var(--shadow-sm)] flex flex-col justify-between relative overflow-hidden ${
          isDkimPass ? 'border-emerald-300 border-r-4 border-r-emerald-600' : 'border-slate-200 border-r-4 border-r-[#B91C1C]'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-[var(--color-text-primary)]">DKIM</h2>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                isDkimPass ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
              }`}>
                {isDkimPass ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {isDkimPass ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">
              {isDkimPass
                ? 'Cryptographic signature verified successfully against published DNS public key.'
                : 'Signature validation failed. The message body or headers may have been altered in transit.'}
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-100 font-mono">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">SELECTOR</span>
            <span className="text-[var(--color-text-primary)] font-semibold">s1024</span>
          </div>
        </div>

        {/* DMARC Card */}
        <div className={`bg-white border rounded-[var(--radius-sm)] p-5 shadow-[var(--shadow-sm)] flex flex-col justify-between relative overflow-hidden ${
          isDmarcPass ? 'border-emerald-300 border-r-4 border-r-emerald-600' : 'border-slate-200 border-r-4 border-r-[#B91C1C]'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-[var(--color-text-primary)]">DMARC</h2>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                isDmarcPass ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
              }`}>
                {isDmarcPass ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {isDmarcPass ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">
              {isDmarcPass
                ? 'Domain alignment and cryptographic identity verified under strict policy enforcement.'
                : 'Both SPF and DKIM checks failed alignment. Policy dictates rejection.'}
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-100 font-mono">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">POLICY APPLIED</span>
            <span className="text-[var(--color-text-primary)] font-semibold">{isDmarcPass ? 'p=reject' : 'p=reject'}</span>
          </div>
        </div>
      </div>

      {/* 2. Main Section: Received Chain (Left ~35%) & Raw Headers (Right ~65%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Received Chain (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2">
            <GitCommitHorizontal className="w-4 h-4 text-[var(--color-brand-black)]" />
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">
              Received Chain
            </h2>
          </div>

          <div className="bg-white border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-5 shadow-[var(--shadow-sm)] space-y-4">
            {/* Hop 1: Original Sender */}
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-slate-700" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-[var(--color-text-primary)]">
                  Original Sender
                </h3>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  MUA Application
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-600 rounded">
                  2026-10-27T08:14:02Z
                </span>
              </div>
            </div>

            {/* Connecting Vertical Line */}
            <div className="w-0.5 h-4 bg-slate-200 ml-4.5 -my-2" />

            {/* Hop 2: Untrusted Relay (or Intermediate) */}
            <div className="flex items-start gap-3.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                detail.threatScore > 50
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-slate-100 border border-slate-200'
              }`}>
                {detail.threatScore > 50 ? (
                  <Globe className="w-4 h-4 text-red-600" />
                ) : (
                  <Server className="w-4 h-4 text-slate-700" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h3 className={`text-xs font-bold ${detail.threatScore > 50 ? 'text-red-700' : 'text-[var(--color-text-primary)]'}`}>
                    {detail.threatScore > 50 ? 'Untrusted Relay' : 'Verified Gateway'}
                  </h3>
                  {detail.threatScore > 50 && (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  )}
                </div>
                <p className="text-[11px] font-mono font-semibold text-[var(--color-text-primary)]">
                  {detail.originIP || '103.45.12.89'}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-600 rounded">
                  2026-10-27T08:14:05Z
                </span>
              </div>
            </div>

            {/* Connecting Vertical Line */}
            <div className="w-0.5 h-4 bg-slate-200 ml-4.5 -my-2" />

            {/* Hop 3: Intermediate MTA */}
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                <Server className="w-4 h-4 text-slate-700" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-[var(--color-text-primary)]">
                  Intermediate MTA
                </h3>
                <p className="text-[11px] font-mono text-[var(--color-text-muted)] truncate">
                  mail.{detail.sender?.split('@')[1] || 'fake-domain.com'}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-600 rounded">
                  2026-10-27T08:14:09Z
                </span>
              </div>
            </div>

            {/* Connecting Vertical Line */}
            <div className="w-0.5 h-4 bg-slate-200 ml-4.5 -my-2" />

            {/* Hop 4: Destination Mail Server */}
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-brand-black)] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Inbox className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-[var(--color-text-primary)]">
                  Your Mail Server
                </h3>
                <p className="text-[11px] font-mono text-[var(--color-text-muted)] truncate">
                  mx-in.internal-corp.net
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-600 rounded">
                  2026-10-27T08:14:12Z
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Raw Headers (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[var(--color-brand-black)]" />
              <h2 className="text-base font-bold text-[var(--color-text-primary)]">
                Raw Headers
              </h2>
            </div>
            <button
              onClick={copyHeaders}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] shadow-[var(--shadow-sm)] hover:border-[var(--color-border-strong)] transition-colors cursor-pointer text-[var(--color-text-primary)]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED' : 'COPY HEADERS'}</span>
            </button>
          </div>

          <div className="bg-[#F8FAFC] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-5 shadow-[var(--shadow-sm)] relative overflow-hidden">
            {/* Top Right READ ONLY Tag */}
            <div className="absolute top-4 right-4 z-10">
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-slate-200/90 text-slate-700 rounded border border-slate-300">
                READ ONLY
              </span>
            </div>

            {/* Formatted Code Stream with Color Cues */}
            <pre className="text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-[500px] text-slate-700">
              {getRawHeaderLines().map((line, idx) => {
                const isAuth = line.startsWith('Authentication-Results:') || line.includes('spf-fail') || line.includes('dkim-fail') || line.includes('dmarc-fail');
                const isRelayAlert = line.includes('Received: from unknown') || line.includes('HELO spoofed');
                const isFrom = line.startsWith('From:');

                if (isAuth || isRelayAlert) {
                  return (
                    <span key={idx} className="text-red-700 font-bold block">
                      {line}
                    </span>
                  );
                }

                if (isFrom) {
                  return (
                    <span key={idx} className="text-slate-900 font-semibold block">
                      {line}
                    </span>
                  );
                }

                return (
                  <span key={idx} className="block">
                    {line}
                  </span>
                );
              })}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
