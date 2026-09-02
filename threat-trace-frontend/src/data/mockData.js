/* ============================================================
   ThreatTrace — Comprehensive Mock Data Layer
   All data structures mirror the expected backend API shapes.
   Includes 3 complete rich presets: CRITICAL, HIGH, and LOW.
   ============================================================ */

// ---- Users ----
export const mockUser = {
  id: 'usr-001',
  name: 'Dr. Anika Sharma',
  email: 'anika.sharma@soc.acmecorp.com',
  role: 'Lead Threat Analyst',
  department: 'Security Operations',
  avatar: null,
};

// ---- Dashboard Stats ----
export const dashboardStats = {
  totalEmails: 12845,
  threatsDetected: 1284,
  criticalThreats: 184,
  openCases: 67,
  trendsComparedLastWeek: {
    totalEmails: +12.3,
    threatsDetected: +8.7,
    criticalThreats: -3.2,
    openCases: +5.1,
  },
};

// ---- Threat Volume Over Time (Recharts) ----
export const threatVolumeData = [
  { date: 'Aug 01', total: 380, phishing: 42, bec: 8, malware: 15, spoofing: 22 },
  { date: 'Aug 04', total: 410, phishing: 55, bec: 12, malware: 9, spoofing: 18 },
  { date: 'Aug 07', total: 395, phishing: 38, bec: 6, malware: 21, spoofing: 25 },
  { date: 'Aug 10', total: 450, phishing: 67, bec: 14, malware: 18, spoofing: 30 },
  { date: 'Aug 13', total: 420, phishing: 50, bec: 10, malware: 12, spoofing: 20 },
  { date: 'Aug 16', total: 480, phishing: 72, bec: 18, malware: 24, spoofing: 35 },
  { date: 'Aug 19', total: 510, phishing: 85, bec: 22, malware: 28, spoofing: 40 },
  { date: 'Aug 22', total: 465, phishing: 60, bec: 15, malware: 20, spoofing: 28 },
  { date: 'Aug 25', total: 530, phishing: 90, bec: 25, malware: 32, spoofing: 45 },
  { date: 'Aug 28', total: 495, phishing: 78, bec: 20, malware: 26, spoofing: 38 },
  { date: 'Aug 31', total: 550, phishing: 95, bec: 28, malware: 35, spoofing: 48 },
];

// ---- Threat Category Distribution ----
export const threatCategoryData = [
  { name: 'Phishing', value: 482, color: '#DC2626' },
  { name: 'Spoofing', value: 298, color: '#D97706' },
  { name: 'BEC', value: 156, color: '#7C3AED' },
  { name: 'Malware', value: 198, color: '#09090B' },
  { name: 'Credential Theft', value: 150, color: '#CA8A04' },
];

// ---- Top Malicious Domains ----
export const topMaliciousDomains = [
  { domain: 'paypa1-security.com', threatCount: 47, riskScore: 96, registeredDays: 12 },
  { domain: 'hr-payroll-update.net', threatCount: 38, riskScore: 78, registeredDays: 3 },
  { domain: 'acc0unt-verify.net', threatCount: 31, riskScore: 91, registeredDays: 8 },
  { domain: 'secure-banklogin.org', threatCount: 28, riskScore: 89, registeredDays: 5 },
  { domain: 'microsoft-teams-update.com', threatCount: 24, riskScore: 87, registeredDays: 21 },
];

// ---- Top Malicious IPs ----
export const topMaliciousIPs = [
  { ip: '185.220.101.4', country: 'Germany', isp: 'Leaseweb', reports: 892, riskScore: 98 },
  { ip: '103.45.12.89', country: 'Netherlands', isp: 'HostEurope B.V.', reports: 654, riskScore: 95 },
  { ip: '91.234.56.78', country: 'Russia', isp: 'SELECTEL', reports: 521, riskScore: 93 },
  { ip: '45.33.32.156', country: 'United States', isp: 'Linode LLC', reports: 412, riskScore: 88 },
  { ip: '198.51.100.23', country: 'Romania', isp: 'M247 Ltd', reports: 378, riskScore: 86 },
];

// ============================================================
// 3 PRESET RICH SAMPLES: 1 CRITICAL, 1 HIGH, 1 LOW
// ============================================================

export const sampleCriticalEmail = {
  id: 'eml-001',
  subject: 'URGENT: Your Bank Account Has Been Compromised',
  sender: 'security@paypa1-security.com',
  senderDisplay: 'PayPal Security Team',
  replyTo: 'phish-reply@protonmail.com',
  returnPath: 'bounce@paypa1-security.com',
  recipient: 'finance@acmecorp.com',
  cc: '',
  messageId: '<20260831102300.ABC123@paypa1-security.com>',
  date: '2026-08-31T10:23:00Z',
  bodyPreview: `Dear Customer,

We have detected unauthorized activity on your PayPal account. Your account has been temporarily limited.

You must verify your identity immediately to restore full access to your account. Failure to verify within 24 hours will result in permanent account suspension.

Click here to verify your account: https://paypa1-security.com/verify?token=abc123xyz

If you did not request this verification, please ignore this email.

Regards,
PayPal Security Team`,
  urls: [
    { url: 'https://paypa1-security.com/verify?token=abc123xyz', malicious: true, redirectsTo: 'https://185.220.101.4/phish/paypal-clone/' },
  ],
  attachments: [],
  threatScore: 96,
  classification: 'PHISHING',
  severity: 'critical',
  status: 'detected',
  originIP: '185.220.101.4',
  originCountry: 'Germany',
  spf: 'FAIL',
  dkim: 'FAIL',
  dmarc: 'FAIL',
  indicators: [
    { type: 'SPOOFED_SENDER', label: 'Spoofed sender address', detected: true, detail: 'Display name "PayPal Security Team" does not match domain paypa1-security.com' },
    { type: 'SUSPICIOUS_DOMAIN', label: 'Suspicious sender domain', detected: true, detail: 'paypa1-security.com is a typosquat of paypal.com (registered 12 days ago)' },
    { type: 'MALICIOUS_URL', label: 'Malicious URL detected', detected: true, detail: 'Link redirects to IP-hosted phishing clone at 185.220.101.4' },
    { type: 'URGENCY_LANGUAGE', label: 'Urgency & pressure language', detected: true, detail: '"URGENT", "immediately", "24 hours", "permanent suspension"' },
    { type: 'CREDENTIAL_REQUEST', label: 'Credential harvesting attempt', detected: true, detail: 'Requests identity verification via external link' },
    { type: 'SPF_FAIL', label: 'SPF authentication failed', detected: true, detail: 'Sender IP 185.220.101.4 not authorized for paypa1-security.com' },
    { type: 'DMARC_FAIL', label: 'DMARC policy failure', detected: true, detail: 'DMARC policy is "none" - no enforcement on paypa1-security.com' },
    { type: 'FORGED_REPLY_TO', label: 'Suspicious Reply-To', detected: true, detail: 'Reply-To (protonmail.com) differs from sender domain' },
  ],
  nlpAnalysis: {
    urgencyScore: 95,
    socialEngineeringScore: 92,
    impersonationScore: 88,
    credentialPhishingScore: 96,
    financialFraudScore: 45,
    malwareRisk: 12,
  },
  authentication: {
    spf: { status: 'FAIL', detail: 'v=spf1 — IP 185.220.101.4 is not listed in paypa1-security.com SPF record', domain: 'paypa1-security.com' },
    dkim: { status: 'FAIL', detail: 'No valid DKIM signature found for selector "default"', selector: 'default', domain: 'paypa1-security.com' },
    dmarc: { status: 'FAIL', policy: 'none', detail: 'DMARC record exists but policy is "none" — no enforcement', domain: 'paypa1-security.com' },
  },
  receivedChain: [
    {
      hop: 1,
      from: 'unknown',
      by: 'mail.paypa1-security.com',
      ip: '185.220.101.4',
      timestamp: '2026-08-31T10:22:48Z',
      delay: '0s',
      anomaly: 'Originating server — no HELO verification',
    },
    {
      hop: 2,
      from: 'mail.paypa1-security.com',
      by: 'relay.intermediate-isp.net',
      ip: '91.234.56.78',
      timestamp: '2026-08-31T10:22:51Z',
      delay: '3s',
      anomaly: 'Open relay — accepts unauthenticated SMTP',
    },
    {
      hop: 3,
      from: 'relay.intermediate-isp.net',
      by: 'mx.acmecorp.com',
      ip: '172.217.14.101',
      timestamp: '2026-08-31T10:23:00Z',
      delay: '9s',
      anomaly: null,
    },
  ],
  rawHeaders: `Return-Path: <bounce@paypa1-security.com>
Received: from mx.acmecorp.com (172.217.14.101) by acme-internal.acmecorp.com; Mon, 31 Aug 2026 10:23:00 +0000
Received: from relay.intermediate-isp.net (91.234.56.78) by mx.acmecorp.com; Mon, 31 Aug 2026 10:22:51 +0000
Received: from mail.paypa1-security.com (185.220.101.4) by relay.intermediate-isp.net; Mon, 31 Aug 2026 10:22:48 +0000
From: "PayPal Security Team" <security@paypa1-security.com>
To: finance@acmecorp.com
Reply-To: phish-reply@protonmail.com
Subject: URGENT: Your Bank Account Has Been Compromised
Date: Mon, 31 Aug 2026 10:22:45 +0000
Message-ID: <20260831102300.ABC123@paypa1-security.com>
MIME-Version: 1.0
Content-Type: text/html; charset="UTF-8"
X-Originating-IP: 185.220.101.4
Authentication-Results: mx.acmecorp.com;
  spf=fail (sender IP is 185.220.101.4) smtp.mailfrom=paypa1-security.com;
  dkim=fail (no signature) header.d=paypa1-security.com;
  dmarc=fail (p=none) header.from=paypa1-security.com`,
};

export const sampleHighEmail = {
  id: 'eml-002',
  subject: 'Invoice #INV-2026-8847 - Payment Required Immediately',
  sender: 'ceo@hr-payroll-update.net',
  senderDisplay: 'John Mitchell - CEO',
  replyTo: 'exec-direct@mail-temp-secure.net',
  returnPath: 'bounce@hr-payroll-update.net',
  recipient: 'accounts@acmecorp.com',
  cc: '',
  messageId: '<20260831091500.INV8847@hr-payroll-update.net>',
  date: '2026-08-31T09:15:00Z',
  bodyPreview: `Sarah,

Please find attached the overdue invoice #INV-2026-8847 from our European vendor. We need to process this payment of $48,500 immediately to avoid service interruption on our Q3 infrastructure contracts.

Wire instructions are updated in our vendor billing portal: http://hr-payroll-update.net/billing/pay.php

Do not delay this transfer as vendor enforcement starts at 11:00 AM today.

Regards,
John Mitchell
Chief Executive Officer
Acme Corporation`,
  urls: [
    { url: 'http://hr-payroll-update.net/billing/pay.php', malicious: true, redirectsTo: 'https://103.45.12.89/wire-portal/' },
  ],
  attachments: [],
  threatScore: 78,
  classification: 'BEC',
  severity: 'high',
  status: 'investigating',
  originIP: '103.45.12.89',
  originCountry: 'Netherlands',
  spf: 'SOFTFAIL',
  dkim: 'FAIL',
  dmarc: 'FAIL',
  indicators: [
    { type: 'SPOOFED_SENDER', label: 'Executive Display Name Impersonation', detected: true, detail: 'Claims identity "John Mitchell - CEO" but sent from unverified domain hr-payroll-update.net' },
    { type: 'SUSPICIOUS_DOMAIN', label: 'Disposable / Fresh Domain', detected: true, detail: 'Domain hr-payroll-update.net registered only 3 days ago' },
    { type: 'MALICIOUS_URL', label: 'Unverified Financial Link', detected: true, detail: 'Links to unencrypted portal http://hr-payroll-update.net/billing/pay.php' },
    { type: 'URGENCY_LANGUAGE', label: 'High Urgency Wire Transfer', detected: true, detail: '"Payment Required Immediately", "$48,500", "overdue invoice", "avoid interruption"' },
    { type: 'SPF_FAIL', label: 'SPF Softfail Status', detected: true, detail: 'Sending IP 103.45.12.89 is in transitional relay status' },
    { type: 'DMARC_FAIL', label: 'DMARC Alignment Failure', detected: true, detail: 'Sender domain hr-payroll-update.net failed strict policy validation' },
  ],
  nlpAnalysis: {
    urgencyScore: 88,
    socialEngineeringScore: 86,
    impersonationScore: 92,
    credentialPhishingScore: 28,
    financialFraudScore: 94,
    malwareRisk: 15,
  },
  authentication: {
    spf: { status: 'SOFTFAIL', detail: 'v=spf1 ~all — IP 103.45.12.89 softfail on hr-payroll-update.net', domain: 'hr-payroll-update.net' },
    dkim: { status: 'FAIL', detail: 'DKIM selector key mismatch in header', selector: 'default', domain: 'hr-payroll-update.net' },
    dmarc: { status: 'FAIL', policy: 'none', detail: 'DMARC alignment failed for hr-payroll-update.net', domain: 'hr-payroll-update.net' },
  },
  receivedChain: [
    {
      hop: 1,
      from: 'origin-vps.hosteurope.nl',
      by: 'mail.hr-payroll-update.net',
      ip: '103.45.12.89',
      timestamp: '2026-08-31T09:14:50Z',
      delay: '0s',
      anomaly: 'Originating server — offshore datacenter host',
    },
    {
      hop: 2,
      from: 'mail.hr-payroll-update.net',
      by: 'mx.acmecorp.com',
      ip: '172.217.14.101',
      timestamp: '2026-08-31T09:15:00Z',
      delay: '10s',
      anomaly: null,
    },
  ],
  rawHeaders: `Return-Path: <bounce@hr-payroll-update.net>
Received: from mx.acmecorp.com (172.217.14.101) by acme-internal.acmecorp.com; Mon, 31 Aug 2026 09:15:00 +0000
Received: from origin-vps.hosteurope.nl (103.45.12.89) by mx.acmecorp.com; Mon, 31 Aug 2026 09:14:50 +0000
From: "John Mitchell - CEO" <ceo@hr-payroll-update.net>
To: accounts@acmecorp.com
Reply-To: exec-direct@mail-temp-secure.net
Subject: Invoice #INV-2026-8847 - Payment Required Immediately
Date: Mon, 31 Aug 2026 09:15:00 +0000
Message-ID: <20260831091500.INV8847@hr-payroll-update.net>
Content-Type: text/html; charset="UTF-8"
Authentication-Results: mx.acmecorp.com;
  spf=softfail smtp.mailfrom=hr-payroll-update.net;
  dkim=fail header.d=hr-payroll-update.net;
  dmarc=fail header.from=hr-payroll-update.net`,
};

export const sampleLowEmail = {
  id: 'eml-003',
  subject: 'Monthly Engineering & Company Newsletter - August 2026',
  sender: 'newsletter@acmecorp.com',
  senderDisplay: 'Acme Corp Internal Newsletter',
  replyTo: 'newsletter@acmecorp.com',
  returnPath: 'newsletter@acmecorp.com',
  recipient: 'all-staff@acmecorp.com',
  cc: '',
  messageId: '<20260830100000.NEWSLET@acmecorp.com>',
  date: '2026-08-30T10:00:00Z',
  bodyPreview: `Hello Team Acme,

Welcome to the August 2026 edition of our monthly internal company newsletter.

Highlights this month:
- Security Operations SOC completed ISO 27001 audit with zero findings.
- New cloud infrastructure deployed across Frankfurt and Ashburn regions.
- Annual company all-hands scheduled for September 15.

Have a great week!
Corporate Communications Team
Acme Corporation`,
  urls: [
    { url: 'https://internal.acmecorp.com/newsletter/august', malicious: false, redirectsTo: null },
  ],
  attachments: [],
  threatScore: 8,
  classification: 'LEGITIMATE',
  severity: 'low',
  status: 'cleared',
  originIP: '40.107.92.75',
  originCountry: 'United States',
  spf: 'PASS',
  dkim: 'PASS',
  dmarc: 'PASS',
  indicators: [],
  nlpAnalysis: {
    urgencyScore: 5,
    socialEngineeringScore: 4,
    impersonationScore: 0,
    credentialPhishingScore: 0,
    financialFraudScore: 0,
    malwareRisk: 0,
  },
  authentication: {
    spf: { status: 'PASS', detail: 'v=spf1 include:spf.protection.outlook.com -all — IP 40.107.92.75 authorized', domain: 'acmecorp.com' },
    dkim: { status: 'PASS', detail: 'DKIM signature valid for selector "s1024" (rsa-sha256 verified)', selector: 's1024', domain: 'acmecorp.com' },
    dmarc: { status: 'PASS', policy: 'reject', detail: 'DMARC pass with strict p=reject policy enforcement', domain: 'acmecorp.com' },
  },
  receivedChain: [
    {
      hop: 1,
      from: 'mail-relay.microsoft.com',
      by: 'mail.acmecorp.com',
      ip: '40.107.92.75',
      timestamp: '2026-08-30T09:59:50Z',
      delay: '0s',
      anomaly: null,
    },
    {
      hop: 2,
      from: 'mail.acmecorp.com',
      by: 'mx.internal.acmecorp.com',
      ip: '172.217.14.101',
      timestamp: '2026-08-30T10:00:00Z',
      delay: '10s',
      anomaly: null,
    },
  ],
  rawHeaders: `Return-Path: <newsletter@acmecorp.com>
Received: from mx.internal.acmecorp.com (172.217.14.101) by acme-internal.acmecorp.com; Sun, 30 Aug 2026 10:00:00 +0000
Received: from mail-relay.microsoft.com (40.107.92.75) by mx.internal.acmecorp.com; Sun, 30 Aug 2026 09:59:50 +0000
From: "Acme Corp Internal Newsletter" <newsletter@acmecorp.com>
To: all-staff@acmecorp.com
Reply-To: newsletter@acmecorp.com
Subject: Monthly Engineering & Company Newsletter - August 2026
Date: Sun, 30 Aug 2026 10:00:00 +0000
Message-ID: <20260830100000.NEWSLET@acmecorp.com>
Authentication-Results: mx.acmecorp.com;
  spf=pass smtp.mailfrom=acmecorp.com;
  dkim=pass header.d=acmecorp.com header.s=s1024;
  dmarc=pass header.from=acmecorp.com`,
};

// 3 Default Loaded Samples (Critical, High, Low)
export const recentThreats = [
  sampleCriticalEmail,
  sampleHighEmail,
  sampleLowEmail,
];

export const emailDetail = sampleCriticalEmail;

// ---- IP Intelligence ----
export const ipIntelligence = {
  '185.220.101.4': {
    ip: '185.220.101.4',
    country: 'Germany',
    countryCode: 'DE',
    region: 'Hesse',
    city: 'Frankfurt',
    lat: 50.1109,
    lng: 8.6821,
    isp: 'Leaseweb Deutschland GmbH',
    org: 'Leaseweb DE',
    asn: 'AS60781',
    hostingProvider: 'Leaseweb',
    isVPN: true,
    vpnProvider: 'Mullvad VPN Exit Node',
    isTOR: false,
    isProxy: true,
    isHosting: true,
    abuseIPDBScore: 92,
    abuseIPDBReports: 142,
    virusTotalMalicious: 14,
    virusTotalClean: 58,
    shodanPorts: [22, 25, 80, 443, 587],
    shodanServices: ['SSH', 'SMTP', 'HTTP', 'HTTPS', 'SMTP-Submission'],
  },
  '103.45.12.89': {
    ip: '103.45.12.89',
    country: 'Netherlands',
    countryCode: 'NL',
    region: 'North Holland',
    city: 'Amsterdam',
    lat: 52.3676,
    lng: 4.9041,
    isp: 'HostEurope B.V.',
    org: 'HostEurope',
    asn: 'AS20857',
    hostingProvider: 'HostEurope',
    isVPN: false,
    vpnProvider: null,
    isTOR: false,
    isProxy: true,
    isHosting: true,
    abuseIPDBScore: 78,
    abuseIPDBReports: 89,
    virusTotalMalicious: 8,
    virusTotalClean: 64,
    shodanPorts: [25, 80, 443],
    shodanServices: ['SMTP', 'HTTP', 'HTTPS'],
  },
  '40.107.92.75': {
    ip: '40.107.92.75',
    country: 'United States',
    countryCode: 'US',
    region: 'Illinois',
    city: 'Chicago',
    lat: 41.8781,
    lng: -87.6298,
    isp: 'Microsoft Corporation (O365 Mail Gateway)',
    org: 'Microsoft Corporation',
    asn: 'AS8075',
    hostingProvider: 'Microsoft Azure',
    isVPN: false,
    vpnProvider: null,
    isTOR: false,
    isProxy: false,
    isHosting: true,
    abuseIPDBScore: 0,
    abuseIPDBReports: 0,
    virusTotalMalicious: 0,
    virusTotalClean: 85,
    shodanPorts: [25, 443, 587],
    shodanServices: ['SMTP', 'HTTPS', 'Submission'],
  },
};

// ---- Domain Intelligence ----
export const domainIntelligence = {
  'paypa1-security.com': {
    domain: 'paypa1-security.com',
    registrar: 'NameCheap Inc.',
    registeredDate: '2026-08-19',
    expiresDate: '2027-08-19',
    domainAgeDays: 12,
    nameservers: ['ns1.anonymousdns.net', 'ns2.anonymousdns.net'],
    mxRecords: ['mail.paypa1-security.com'],
    aRecords: ['185.220.101.4'],
    country: 'Panama',
    privacyProtection: true,
    registrantName: 'REDACTED FOR PRIVACY',
    registrantOrg: 'Privacy Protect LLC',
    typosquatTarget: 'paypal.com',
    typosquatSimilarity: 0.92,
    sslCertificate: { issuer: "Let's Encrypt", validFrom: '2026-08-19', validTo: '2026-11-17', selfSigned: false },
    riskScore: 96,
    riskFactors: [
      'Domain age under 30 days',
      'Typosquat of paypal.com (92% similarity)',
      'Privacy-protected WHOIS',
      'MX record points to same IP as A record',
      'Anonymous DNS nameservers',
    ],
  },
  'hr-payroll-update.net': {
    domain: 'hr-payroll-update.net',
    registrar: 'Tucows Domains Inc.',
    registeredDate: '2026-08-28',
    expiresDate: '2027-08-28',
    domainAgeDays: 3,
    nameservers: ['ns1.offshoredns.org', 'ns2.offshoredns.org'],
    mxRecords: ['mail.hr-payroll-update.net'],
    aRecords: ['103.45.12.89'],
    country: 'Seychelles',
    privacyProtection: true,
    registrantName: 'Privacy Guardian',
    registrantOrg: 'WhoisGuard',
    typosquatTarget: '',
    typosquatSimilarity: 0.0,
    sslCertificate: { issuer: "ZeroSSL", validFrom: '2026-08-28', validTo: '2026-11-26', selfSigned: false },
    riskScore: 78,
    riskFactors: [
      'Extremely fresh domain (3 days old)',
      'Payroll/HR keyword impersonation',
      'Offshore DNS hosting',
    ],
  },
  'acmecorp.com': {
    domain: 'acmecorp.com',
    registrar: 'MarkMonitor Inc.',
    registeredDate: '2015-03-12',
    expiresDate: '2030-03-12',
    domainAgeDays: 4180,
    nameservers: ['ns1.acmecorp.com', 'ns2.acmecorp.com'],
    mxRecords: ['acmecorp-com.mail.protection.outlook.com'],
    aRecords: ['40.107.92.75'],
    country: 'United States',
    privacyProtection: false,
    registrantName: 'Acme Corporation Legal Ops',
    registrantOrg: 'Acme Corporation',
    typosquatTarget: '',
    typosquatSimilarity: 0.0,
    sslCertificate: { issuer: "DigiCert Global Root G2", validFrom: '2025-01-01', validTo: '2027-01-01', selfSigned: false },
    riskScore: 2,
    riskFactors: ['Established enterprise corporate domain (11+ years old)'],
  },
};

// ---- Cases ----
export const cases = [
  {
    id: '1024',
    title: 'PayPal Phishing Campaign',
    status: 'OPEN',
    severity: 'critical',
    createdDate: '2026-08-25T14:30:00Z',
    updatedDate: '2026-08-31T10:30:00Z',
    updatedLabel: 'Updated 10 mins ago by Analyst A.',
    assignee: 'Analyst A',
    emailCount: 1420,
    ipCount: 8,
    domainCount: 12,
    countryCount: 4,
    description: 'Coordinated phishing campaign using PayPal typosquat domains to harvest credentials from finance department employees across multiple organizations.',
    relatedEmails: ['eml-001'],
    relatedIPs: ['185.220.101.4'],
    relatedDomains: ['paypa1-security.com'],
    tags: ['phishing', 'credential-theft', 'paypal', 'typosquat'],
  },
  {
    id: '1025',
    title: 'Suspicious Internal Lateral Movement',
    status: 'OPEN',
    severity: 'high',
    createdDate: '2026-08-28T09:00:00Z',
    updatedDate: '2026-08-31T09:30:00Z',
    updatedLabel: 'Updated 2 hours ago by Analyst B.',
    assignee: 'Analyst B',
    emailCount: 0,
    ipCount: 45,
    domainCount: 1,
    countryCount: 2,
    description: 'Suspicious authentication anomalies and rapid port scans detected originating from internal staging jump host.',
    relatedEmails: [],
    relatedIPs: ['103.45.12.89'],
    relatedDomains: ['hr-payroll-update.net'],
    tags: ['lateral-movement', 'internal', 'port-scan'],
  },
  {
    id: '1021',
    title: 'Routine Malware Sandbox Analysis',
    status: 'RESOLVED',
    severity: 'low',
    createdDate: '2026-08-20T08:00:00Z',
    updatedDate: '2026-08-30T12:00:00Z',
    updatedLabel: 'Closed yesterday by System.',
    assignee: 'System',
    emailCount: 2,
    ipCount: 1,
    domainCount: 0,
    countryCount: 1,
    description: 'Automated dynamic detonation in sandbox environment yielded zero payload execution or persistence artifacts.',
    relatedEmails: ['eml-003'],
    relatedIPs: ['40.107.92.75'],
    relatedDomains: ['acmecorp.com'],
    tags: ['sandbox', 'automated', 'cleared'],
  },
  {
    id: '1026',
    title: 'Ransomware Payload Delivery Attempt',
    status: 'OPEN',
    severity: 'critical',
    createdDate: '2026-08-31T01:00:00Z',
    updatedDate: '2026-08-31T08:00:00Z',
    updatedLabel: 'Updated 10 hours ago by Analyst C.',
    assignee: 'Analyst C',
    emailCount: 15,
    ipCount: 2,
    domainCount: 3,
    countryCount: 2,
    description: 'Malicious macro-enabled attachment dropped from fake invoice email with known LockBit staging C2 servers.',
    relatedEmails: ['eml-002'],
    relatedIPs: ['185.220.101.4'],
    relatedDomains: ['hr-payroll-update.net'],
    tags: ['ransomware', 'macro-dropper', 'lockbit'],
  },
];

// ---- Alerts ----
export const alerts = [
  { id: 'alt-001', severity: 'critical', title: 'Phishing URL with Active Credential Harvesting', description: 'Malicious URL paypa1-security.com/verify redirects to IP-hosted PayPal login clone. Active credential harvesting confirmed.', emailId: 'eml-001', caseId: 'case-1024', timestamp: '2026-08-31T10:23:00Z', read: false },
  { id: 'alt-002', severity: 'high', title: 'CEO Impersonation Detected', description: 'Email from hr-payroll-update.net impersonating CEO John Mitchell requesting urgent wire transfer to accounts payable.', emailId: 'eml-002', caseId: 'case-1025', timestamp: '2026-08-31T09:15:00Z', read: false },
];

// ---- Evidence / Chain of Custody ----
export const evidenceItems = [
  {
    id: 'EV-001',
    type: 'email_source',
    filename: 'eml-001_raw_source.eml',
    sha256: 'a7f3b2c1d4e5f6a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
    collectedBy: 'Dr. Anika Sharma',
    collectedDate: '2026-08-31T10:25:00Z',
    caseId: 'case-1024',
    status: 'preserved',
    actions: [
      { action: 'Collected', by: 'Dr. Anika Sharma', timestamp: '2026-08-31T10:25:00Z' },
      { action: 'Hash verified', by: 'System', timestamp: '2026-08-31T10:25:01Z' },
      { action: 'Stored in evidence locker', by: 'System', timestamp: '2026-08-31T10:25:02Z' },
    ],
  },
  {
    id: 'EV-002',
    type: 'email_source',
    filename: 'eml-002_ceo_invoice.eml',
    sha256: 'f4e2a1b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1',
    collectedBy: 'Raj Patel',
    collectedDate: '2026-08-31T09:30:00Z',
    caseId: 'case-1025',
    status: 'preserved',
    actions: [
      { action: 'Collected', by: 'Raj Patel', timestamp: '2026-08-31T09:30:00Z' },
      { action: 'Hash verified', by: 'System', timestamp: '2026-08-31T09:30:01Z' },
      { action: 'Stored in evidence locker', by: 'System', timestamp: '2026-08-31T09:30:02Z' },
    ],
  },
];

// ---- Reports ----
export const reports = [
  {
    id: 'rpt-001',
    title: 'Forensic Report — PayPal Phishing Campaign (Case #1024)',
    caseId: 'case-1024',
    generatedDate: '2026-08-31T12:00:00Z',
    generatedBy: 'Dr. Anika Sharma',
    format: 'PDF',
    sections: ['Email Information', 'Threat Classification', 'Risk Score', 'Header Analysis', 'SPF/DKIM/DMARC', 'IP Analysis', 'GeoLocation', 'Domain Intelligence', 'Threat Intelligence', 'Evidence', 'Timeline', 'Analyst Conclusion'],
    status: 'generated',
  },
  {
    id: 'rpt-002',
    title: 'Incident Summary — CEO Wire Fraud Attempt',
    caseId: 'case-1025',
    generatedDate: '2026-08-31T10:00:00Z',
    generatedBy: 'Raj Patel',
    format: 'PDF',
    sections: ['Email Information', 'Threat Classification', 'Risk Score', 'Header Analysis', 'Evidence'],
    status: 'generated',
  },
];

// ---- Investigation Graph Nodes & Edges ----
export const graphData = {
  nodes: [
    { id: 'case-1024', type: 'case', label: 'Case #1024', data: { title: 'Fake Banking Campaign' } },
    { id: 'eml-001', type: 'email', label: 'Phishing Email', data: { subject: 'URGENT: Your Bank Account...' } },
    { id: 'domain-paypa1', type: 'domain', label: 'paypa1-security.com', data: { age: '12 days', risk: 96 } },
    { id: 'ip-185', type: 'ip', label: '185.220.101.4', data: { country: 'Germany', risk: 98 } },
    { id: 'isp-leaseweb', type: 'isp', label: 'Leaseweb DE', data: { asn: 'AS60781' } },
    { id: 'loc-de', type: 'location', label: 'Frankfurt, DE', data: {} },
  ],
  edges: [
    { id: 'e1', source: 'case-1024', target: 'eml-001', label: 'CONTAINS' },
    { id: 'e2', source: 'eml-001', target: 'domain-paypa1', label: 'SENT_FROM' },
    { id: 'e3', source: 'domain-paypa1', target: 'ip-185', label: 'RESOLVES_TO' },
    { id: 'e4', source: 'ip-185', target: 'isp-leaseweb', label: 'HOSTED_ON' },
    { id: 'e5', source: 'ip-185', target: 'loc-de', label: 'LOCATED_IN' },
  ],
};

// ---- Geo markers for map ----
export const geoMarkers = [
  { ip: '185.220.101.4', lat: 50.1109, lng: 8.6821, city: 'Frankfurt', country: 'Germany', threatCount: 47 },
  { ip: '103.45.12.89', lat: 52.3676, lng: 4.9041, city: 'Amsterdam', country: 'Netherlands', threatCount: 38 },
  { ip: '40.107.92.75', lat: 41.8781, lng: -87.6298, city: 'Chicago', country: 'United States', threatCount: 1 },
];
