/* ============================================================
   ThreatTrace — Cases & Forensic Reports Store Manager
   Handles CRUD operations with persistent localStorage support.
   ============================================================ */

import { cases as defaultCases, reports as defaultReports } from '../data/mockData';

const CASES_KEY = 'threattrace_cases_store_v1';
const REPORTS_KEY = 'threattrace_reports_store_v1';

// ---- CASES ----

export function getStoredCases() {
  try {
    const raw = localStorage.getItem(CASES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load cases:', e);
  }
  return defaultCases;
}

export function getCaseById(id) {
  const all = getStoredCases();
  return all.find(c => c.id === id || c.id === `case-${id}` || `case-${c.id}` === id) || all[0];
}

export function saveCase(caseObj) {
  const all = getStoredCases();
  const filtered = all.filter(c => c.id !== caseObj.id);
  const updated = [caseObj, ...filtered];
  try {
    localStorage.setItem(CASES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save case:', e);
  }
  return caseObj;
}

export function deleteCase(id) {
  const all = getStoredCases();
  const updated = all.filter(c => c.id !== id && c.id !== `case-${id}` && `case-${c.id}` !== id);
  try {
    localStorage.setItem(CASES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete case:', e);
  }
  return updated;
}

export function createNewCase({ title, description, severity, status, assignee, relatedEmails, relatedIPs, relatedDomains, tags }) {
  const id = `case-${Math.floor(1000 + Math.random() * 9000)}`;
  const newCase = {
    id: id,
    title: title || 'New Security Incident Investigation',
    description: description || 'Active threat investigation initiated by SOC analyst.',
    severity: severity || 'high',
    status: status || 'OPEN',
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
    updatedLabel: 'Updated just now by SOC Analyst.',
    assignee: assignee || 'Dr. Anika Sharma',
    emailCount: relatedEmails?.length || 1,
    ipCount: relatedIPs?.length || 1,
    domainCount: relatedDomains?.length || 1,
    countryCount: 2,
    relatedEmails: relatedEmails || ['eml-001'],
    relatedIPs: relatedIPs || ['185.220.101.4'],
    relatedDomains: relatedDomains || ['paypa1-security.com'],
    tags: tags || ['incident', 'soc-investigation'],
    timeline: [
      { time: new Date().toISOString(), action: 'Case opened by SOC analyst', by: assignee || 'Dr. Anika Sharma' },
      { time: new Date().toISOString(), action: 'Threat indicators linked to incident dossier', by: 'System Engine' },
    ]
  };

  return saveCase(newCase);
}

// ---- REPORTS ----

export function getStoredReports() {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load reports:', e);
  }
  return defaultReports;
}

export function saveReport(reportObj) {
  const all = getStoredReports();
  const filtered = all.filter(r => r.id !== reportObj.id);
  const updated = [reportObj, ...filtered];
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save report:', e);
  }
  return reportObj;
}

export function deleteReport(id) {
  const all = getStoredReports();
  const updated = all.filter(r => r.id !== id);
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete report:', e);
  }
  return updated;
}

export function createNewReport({ title, caseId, generatedBy, format = 'PDF', sections, targetEmailId }) {
  const id = `rpt-${Math.floor(100 + Math.random() * 900)}`;
  const newReport = {
    id: id,
    title: title || `Forensic Analysis Incident Report (${caseId || 'Case #1024'})`,
    caseId: caseId || 'case-1024',
    targetEmailId: targetEmailId || 'eml-001',
    generatedDate: new Date().toISOString(),
    generatedBy: generatedBy || 'Dr. Anika Sharma',
    format: format,
    sections: sections || [
      'Executive Summary',
      'Email Header Forensics',
      'SPF/DKIM/DMARC Authentication',
      'Originating IP Geolocation',
      'Domain Intelligence',
      'Threat Correlation',
      'Evidence Chain of Custody',
      'Analyst Conclusion'
    ],
    status: 'generated',
  };

  return saveReport(newReport);
}
