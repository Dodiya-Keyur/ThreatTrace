# 🛡️ ThreatTrace — AI-Powered Email Forensic & Incident Response Platform

> **ThreatTrace** is an enterprise-grade Security Operations Center (SOC) investigation platform designed to analyze, trace, and remediate advanced email cyberattacks (BEC fraud, spear-phishing, credential harvesting, and weaponized payload delivery).

---

## ✨ Key Capabilities

- **Deep RFC 822 Email Header Forensics**: Instant cryptographic verification of SPF, DKIM, and DMARC alignment, plus MTA routing hop breakdown.
- **Global GIS Origin Trace Map**: Interactive Leaflet world map tracing malicious Tor exit nodes, bulletproof relays, and geographic hops.
- **Interactive Threat Relationship Graph**: Node-link attack graph (`@xyflow/react`) modeling relationships between attackers, spoofed senders, payloads, domains, and bulletproof ASNs.
- **AI-Powered Threat Correlation Engine**: Dynamic heuristic scoring, typosquatting domain detection, and AI forensic diagnostic summaries.
- **1-Click Automated SOC Containment**: Automated playbook execution isolating malicious IPs on edge firewalls, sinkholing domains, and quarantining affected inbox messages.
- **YARA & Sigma Rule Generator**: Instant generation and export of detection signatures for Splunk, Microsoft Sentinel, and SIEMs.
- **Certified Forensic PDF Reports**: Automated executive dossiers and audit reports with complete chain-of-custody logs.
- **Admin & Role-Based SOC Access**: Complete team management, incident triage center, and detection categories directory.

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS & Custom Design System
- **Visualizations**: Leaflet Maps (`react-leaflet`), React Flow (`@xyflow/react`), Recharts
- **Icons**: Lucide React

### Backend
- **Framework**: Python FastAPI + Uvicorn
- **Data & ML**: SQLAlchemy, Scikit-Learn, Pydantic, DNSPython, Httpx

---

## 🚀 Quickstart Guide

### 1. Run the Frontend
```bash
cd threat-trace-frontend
npm install
npm run dev
```

### 2. Run the Backend
```bash
cd threat-trace-backend
pip install -r requirements.txt
python run.py
```

---

## 🔒 License
MIT License. Developed for Cybersecurity Hackathon & Enterprise SOC Incident Response.
