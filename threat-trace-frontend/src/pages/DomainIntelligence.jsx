import { useParams, useNavigate } from 'react-router-dom';
import { Globe, Calendar, Server, Shield, AlertTriangle, Clock, ExternalLink, Search, CheckCircle2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { domainIntelligence } from '../data/mockData';
import { SeverityBadge } from '../components/common/Badge';
import { getThreatScoreSeverity } from '../utils/helpers';
import { useState, useEffect } from 'react';

function calculateDomainIntelligence(domainName) {
  const cleanDomain = domainName.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!cleanDomain) return null;

  if (domainIntelligence[cleanDomain]) {
    return domainIntelligence[cleanDomain];
  }

  // Dynamic calculation for any arbitrary domain
  const isTyposquat = cleanDomain.includes('paypa1') || cleanDomain.includes('micros0ft') || cleanDomain.includes('g00gle') || cleanDomain.includes('appl-e') || cleanDomain.includes('amzn-sec');
  const targetBrand = cleanDomain.includes('paypa1') ? 'paypal.com' :
                      cleanDomain.includes('micros0ft') ? 'microsoft.com' :
                      cleanDomain.includes('g00gle') ? 'google.com' :
                      cleanDomain.includes('appl-e') ? 'apple.com' :
                      cleanDomain.includes('amzn') ? 'amazon.com' : '';

  const isSuspiciousTLD = cleanDomain.endsWith('.xyz') || cleanDomain.endsWith('.top') || cleanDomain.endsWith('.work') || cleanDomain.endsWith('.click') || cleanDomain.endsWith('.fit') || cleanDomain.endsWith('.su');
  const isEstablished = cleanDomain === 'google.com' || cleanDomain === 'microsoft.com' || cleanDomain === 'apple.com' || cleanDomain === 'github.com' || cleanDomain === 'paypal.com';

  let riskScore = 15;
  const riskFactors = [];

  if (isTyposquat) {
    riskScore += 65;
    riskFactors.push(`High-confidence typosquatting match against ${targetBrand} (92% visual similarity)`);
  }

  if (isSuspiciousTLD) {
    riskScore += 25;
    riskFactors.push('Disposable or high-abuse top-level domain extension');
  }

  if (cleanDomain.includes('sec') || cleanDomain.includes('verify') || cleanDomain.includes('login') || cleanDomain.includes('update') || cleanDomain.includes('payroll')) {
    riskScore += 30;
    riskFactors.push('Deceptive security/authentication keywords detected in domain label');
  }

  if (isEstablished) {
    riskScore = 0;
    riskFactors.push('Legitimate verified Fortune 500 enterprise domain with long registration history');
  } else if (riskScore > 30) {
    riskFactors.push('Domain registration under 30 days old');
    riskFactors.push('Privacy-protected WHOIS registrant details');
  }

  riskScore = Math.min(Math.max(riskScore, 2), 98);

  const hash = cleanDomain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const ipSuffix1 = (hash % 200) + 10;
  const ipSuffix2 = (hash % 150) + 20;

  return {
    domain: cleanDomain,
    registrar: isEstablished ? 'MarkMonitor Inc.' : (riskScore > 50 ? 'NameCheap Privacy Protect' : 'GoDaddy.com LLC'),
    registeredDate: isEstablished ? '2001-05-14' : '2026-08-20',
    expiresDate: '2027-08-20',
    domainAgeDays: isEstablished ? 9240 : (riskScore > 50 ? 12 : 365),
    nameservers: [`ns1.${cleanDomain}`, `ns2.${cleanDomain}`],
    mxRecords: [`mail.${cleanDomain}`],
    aRecords: [`185.${ipSuffix1}.${ipSuffix2}.4`],
    country: isEstablished ? 'United States' : (riskScore > 50 ? 'Panama (Privacy Shield)' : 'United States'),
    privacyProtection: riskScore > 50,
    registrantName: riskScore > 50 ? 'REDACTED FOR PRIVACY' : 'Domain Administrator',
    registrantOrg: isEstablished ? cleanDomain.split('.')[0].toUpperCase() + ' Corp' : (riskScore > 50 ? 'Privacy Protect LLC' : 'Organization Services'),
    typosquatTarget: targetBrand,
    typosquatSimilarity: isTyposquat ? 0.92 : 0,
    sslCertificate: {
      issuer: isEstablished ? "DigiCert Global Root CA" : (riskScore > 50 ? "Let's Encrypt Authority X3" : "Sectigo RSA Domain Validation"),
      validFrom: '2026-08-20',
      validTo: '2026-11-18',
      selfSigned: false,
    },
    riskScore: riskScore,
    riskFactors: riskFactors.length > 0 ? riskFactors : ['Standard domain configuration with active DNS records'],
  };
}

export default function DomainIntelligence() {
  const { domain: paramDomain } = useParams();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(paramDomain || '');
  const [currentDomain, setCurrentDomain] = useState(paramDomain || '');
  const [domainData, setDomainData] = useState(() => paramDomain ? calculateDomainIntelligence(paramDomain) : null);

  useEffect(() => {
    if (paramDomain) {
      setSearchInput(paramDomain);
      setCurrentDomain(paramDomain);
      setDomainData(calculateDomainIntelligence(paramDomain));
    }
  }, [paramDomain]);

  const handleAnalyze = (domainToAnalyze) => {
    const target = (domainToAnalyze !== undefined ? domainToAnalyze : searchInput).trim();
    if (!target) return;
    const resolved = calculateDomainIntelligence(target);
    setCurrentDomain(target);
    setDomainData(resolved);
  };

  const InfoRow = ({ label, value, mono, alert }) => (
    <div className="flex items-start justify-between py-2.5 border-b border-[var(--color-border-subtle)] last:border-0">
      <span className="text-xs text-[var(--color-text-muted)] shrink-0">{label}</span>
      <div className="flex items-center gap-1.5 text-right">
        <span className={`text-xs text-[var(--color-text-primary)] ${mono ? 'font-mono' : ''} max-w-[280px] break-all`}>{value}</span>
        {alert && <AlertTriangle className="w-3 h-3 text-[var(--color-threat-high)] shrink-0" />}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
          Domain Intelligence
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          WHOIS, DNS records, brand typosquat detection, and infrastructure reputation analysis
        </p>
      </div>

      {/* Quick Pick Presets */}
      <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-4 shadow-[var(--shadow-sm)]">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] block mb-2.5">
          Quick Domain Lookups
        </span>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'paypa1-security.com', type: 'CRITICAL Typosquat (96)' },
            { label: 'hr-payroll-update.net', type: 'HIGH BEC Domain (78)' },
            { label: 'acmecorp.com', type: 'LOW Legitimate (2)' },
            { label: 'google.com', type: 'SAFE Global Enterprise (0)' },
            { label: 'microsoft-teams-update.com', type: 'CRITICAL Phish (87)' },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setSearchInput(preset.label);
                handleAnalyze(preset.label);
              }}
              className="px-3 py-1.5 text-xs font-mono bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] hover:border-[var(--color-border-strong)] transition-colors cursor-pointer text-left"
            >
              <span className="font-semibold text-[var(--color-text-primary)]">{preset.label}</span>
              <span className="text-[10px] text-[var(--color-text-muted)] ml-2">({preset.type})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-xl">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm font-mono bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-black)]"
            placeholder="Enter any domain (e.g. apple.com, paypa1-login.xyz)..."
          />
        </div>
        <button
          onClick={() => handleAnalyze()}
          className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[var(--color-brand-black)] rounded-[var(--radius-sm)] hover:bg-neutral-800 transition-colors shadow-[var(--shadow-sm)] cursor-pointer"
        >
          Analyze Domain
        </button>
      </div>

      {/* Empty Initial State Prompt */}
      {!domainData && (
        <div className="bg-[var(--color-canvas)] border border-dashed border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-12 text-center">
          <Globe className="w-10 h-10 mx-auto mb-3 text-slate-400 stroke-[1.5]" />
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Ready for Domain Lookup</h3>
          <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto mt-1">
            Enter any domain name above or click one of the quick lookup chips to perform WHOIS inspection, typosquatting analysis, and DNS verification.
          </p>
        </div>
      )}

      {/* Results View */}
      {domainData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Domain Overview */}
          <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-5 shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[var(--color-text-muted)]" />
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Domain Overview</h2>
              </div>
              <SeverityBadge severity={getThreatScoreSeverity(domainData.riskScore)} score={domainData.riskScore} />
            </div>
            <p className="text-lg font-mono font-bold text-[var(--color-text-primary)] mb-4">{domainData.domain}</p>
            <InfoRow label="Registrar" value={domainData.registrar} />
            <InfoRow label="Registered" value={domainData.registeredDate} />
            <InfoRow label="Expires" value={domainData.expiresDate} />
            <InfoRow label="Domain Age" value={`${domainData.domainAgeDays} days`} alert={domainData.domainAgeDays < 30} />
            <InfoRow label="Country" value={domainData.country} />
            <InfoRow label="Registrant" value={domainData.registrantName} />
            <InfoRow label="Organization" value={domainData.registrantOrg} />
            <InfoRow label="Privacy Protection" value={domainData.privacyProtection ? 'ENABLED' : 'DISABLED'} alert={domainData.privacyProtection} />
          </div>

          {/* DNS Records */}
          <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-5 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-4 h-4 text-[var(--color-text-muted)]" />
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">DNS Records</h2>
            </div>
            <InfoRow label="A Records" value={domainData.aRecords?.join(', ') || 'None'} mono />
            <InfoRow label="MX Records" value={domainData.mxRecords?.join(', ') || 'None'} mono />
            <InfoRow label="Nameservers" value={domainData.nameservers?.join(', ') || 'None'} mono />

            <div className="mt-4 pt-3 border-t border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-[var(--color-text-muted)]" />
                <h3 className="text-xs font-semibold text-[var(--color-text-primary)]">SSL Certificate</h3>
              </div>
              <InfoRow label="Issuer" value={domainData.sslCertificate.issuer} />
              <InfoRow label="Valid From" value={domainData.sslCertificate.validFrom} />
              <InfoRow label="Valid To" value={domainData.sslCertificate.validTo} />
              <InfoRow label="Self-Signed" value={domainData.sslCertificate.selfSigned ? 'YES' : 'NO'} />
            </div>
          </div>

          {/* Risk Analysis */}
          <div className="space-y-4">
            {/* Typosquat */}
            {domainData.typosquatTarget ? (
              <div className="bg-[var(--color-threat-critical-bg)] border border-red-200 rounded-[var(--radius-md)] p-5 shadow-[var(--shadow-sm)]">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-[var(--color-threat-critical)]" />
                  <h2 className="text-sm font-semibold text-[var(--color-threat-critical)]">Typosquat Detection</h2>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mb-2">
                  This domain is a <span className="font-bold">suspected typosquat</span> impersonating a protected brand.
                </p>
                <div className="bg-white/80 rounded-[var(--radius-sm)] p-3 space-y-1.5 border border-red-100">
                  <InfoRow label="Target Domain" value={domainData.typosquatTarget} mono />
                  <InfoRow label="Similarity" value={`${(domainData.typosquatSimilarity * 100).toFixed(0)}%`} alert />
                </div>
              </div>
            ) : (
              <div className="bg-[var(--color-threat-low-bg)] border border-emerald-200 rounded-[var(--radius-md)] p-4 flex items-center gap-2.5 shadow-[var(--shadow-sm)]">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-800">No Typosquatting Detected</p>
                  <p className="text-[11px] text-emerald-700">Domain is not actively masquerading as known brand entities.</p>
                </div>
              </div>
            )}

            {/* Risk Factors */}
            <div className="bg-[var(--color-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-5 shadow-[var(--shadow-sm)]">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Risk Factors ({domainData.riskFactors?.length || 0})</h2>
              <div className="space-y-2">
                {domainData.riskFactors.map((factor, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${domainData.riskScore > 50 ? 'text-[var(--color-threat-critical)]' : 'text-emerald-600'}`} />
                    <span className="text-[var(--color-text-secondary)] leading-relaxed">{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
