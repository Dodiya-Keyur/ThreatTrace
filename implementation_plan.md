# ThreatTrace Backend & AI/ML Forensic Engine — Implementation Plan

## Goal Description
Build and deploy the Python FastAPI backend for **ThreatTrace**, containing a complete email forensics engine, NLP/ML threat detection algorithms, SPF/DKIM/DMARC verification, IP geolocation & threat intelligence, domain typosquatting detection, graph relationship mapping, case management, and evidence preservation with SHA-256 hashing.

---

## User Review Required

> [!IMPORTANT]
> **Database & Storage**: We will use SQLite with SQLAlchemy ORM by default for zero-friction local development and hackathon demonstration, with direct compatibility for PostgreSQL via standard connection string configuration in `.env`.

> [!TIP]
> **Offline-Resilient Intelligence**: All threat intelligence, WHOIS, and IP Geolocation services will feature live online lookup fallbacks with built-in heuristic/cache engines so that the platform functions flawlessly even if rate limits or network issues occur during demonstrations.

---

## Proposed Changes

### Backend Architecture Overview

```
threat-trace-backend/
├── app/
│   ├── main.py                     # FastAPI app entry point with CORS and routing
│   ├── config.py                   # Environment settings and configuration
│   ├── database.py                 # SQLAlchemy engine and session dependency
│   ├── models/                     # SQLAlchemy database models
│   │   ├── user.py
│   │   ├── email_record.py
│   │   ├── threat.py
│   │   ├── case.py
│   │   ├── evidence.py
│   │   └── alert.py
│   ├── schemas/                    # Pydantic validation schemas
│   │   ├── auth.py
│   │   ├── email_schema.py
│   │   ├── threat_schema.py
│   │   ├── intelligence_schema.py
│   │   ├── case_schema.py
│   │   └── report_schema.py
│   ├── services/                   # Core Forensic & Intelligence Services
│   │   ├── email_parser.py         # RFC 822 / MIME parser (.eml / raw text)
│   │   ├── header_analyzer.py      # Received hop chain reconstruction, SPF/DKIM/DMARC check
│   │   ├── nlp_engine.py           # NLP feature extraction, urgency & BEC scoring
│   │   ├── ml_classifier.py        # Threat classification (Phishing, BEC, Spoofing, Legit)
│   │   ├── ip_intelligence.py      # IP geolocation, ISP/ASN lookup, VPN/TOR/Proxy detection
│   │   ├── domain_intelligence.py  # WHOIS, DNS/MX analysis, typosquatting algorithm
│   │   ├── threat_intel.py         # AbuseIPDB, VirusTotal, and Shodan correlation
│   │   ├── graph_service.py        # Graph relationship generator (Nodes & Edges)
│   │   └── evidence_service.py     # SHA-256 evidence hashing & chain-of-custody tracking
│   ├── api/v1/                     # REST API Endpoint Routers
│   │   ├── auth.py                 # /auth/login, /auth/register, /auth/me
│   │   ├── emails.py               # /emails/upload, /emails/analyze, /emails
│   │   ├── threats.py              # /threats, /threats/{id}, /threats/statistics
│   │   ├── forensics.py            # /forensics/{id}/headers, /forensics/{id}/relay-path
│   │   ├── intelligence.py         # /intelligence/ip/{ip}, /intelligence/domain/{domain}
│   │   ├── cases.py                # /cases, /cases/{id}, /cases/{id}/graph
│   │   ├── alerts.py               # /alerts, /alerts/{id}/read
│   │   ├── reports.py              # /reports/generate, /reports/{id}/download
│   │   └── evidence.py             # /evidence, /evidence/verify
│   └── samples/                    # Sample .eml test files for demo & evaluation
├── requirements.txt
└── run.py                          # Startup script for Uvicorn
```

---

## Step-by-Step Implementation

### Phase 1: Environment & Dependencies
- Create `requirements.txt` with:
  `fastapi`, `uvicorn[standard]`, `pydantic`, `pydantic-settings`, `sqlalchemy`, `python-multipart`, `aiofiles`, `dnspython`, `python-jose[cryptography]`, `passlib[bcrypt]`, `httpx`, `numpy`, `scikit-learn`
- Create virtual environment / install dependencies.

### Phase 2: Core Database & Models
- [NEW] `app/config.py`: Application settings (JWT secrets, CORS origins, API keys)
- [NEW] `app/database.py`: SQLAlchemy session management, engine setup
- [NEW] `app/models/*.py`: Users, Email Records, Threats, Cases, Evidence, Alerts

### Phase 3: Forensic & AI/ML Engines
- [NEW] `app/services/email_parser.py`: RFC 822 header extraction, body parsing, attachment inspection, URL extraction with redirect tracing
- [NEW] `app/services/header_analyzer.py`: Multi-hop `Received:` chain reconstruction, timestamp latency calculation, SPF/DKIM/DMARC validation, `Reply-To` vs `From` mismatch detection
- [NEW] `app/services/nlp_engine.py`: Natural Language Processing for urgency keywords, credential solicitation cues, fake invoice patterns, and CEO impersonation heuristics
- [NEW] `app/services/ml_classifier.py`: Heuristic & feature-weighted machine learning classifier outputting overall Threat Score (0-100) and Classification (`PHISHING`, `BEC`, `CREDENTIAL_THEFT`, `MALWARE`, `SPOOFING`, `LEGITIMATE`)
- [NEW] `app/services/ip_intelligence.py`: Geolocation coordinates, country, city, ISP, ASN, and VPN/Proxy/TOR heuristics
- [NEW] `app/services/domain_intelligence.py`: WHOIS age calculation, MX/DNS check, Levenshtein distance typosquatting detector (e.g. `paypa1-security.com` vs `paypal.com`)
- [NEW] `app/services/graph_service.py`: Dynamic graph node/edge creation for React Flow visualization
- [NEW] `app/services/evidence_service.py`: Automated SHA-256 hashing and chain-of-custody logging

### Phase 4: REST API Endpoints & FastAPI App
- [NEW] `app/api/v1/auth.py`: JWT-based analyst login and registration
- [NEW] `app/api/v1/emails.py`: `.eml` upload and raw text analysis endpoints
- [NEW] `app/api/v1/threats.py`: Threat listings, details, and statistical summaries
- [NEW] `app/api/v1/forensics.py`: Header drilldown and relay path inspection
- [NEW] `app/api/v1/intelligence.py`: Real-time lookup for IP, domain, URL, and file hashes
- [NEW] `app/api/v1/cases.py`: Case management, campaign clustering, and graph payload endpoints
- [NEW] `app/api/v1/alerts.py` & `reports.py` & `evidence.py`: Alerts, forensic PDF/JSON reporting, and evidence ledger
- [NEW] `app/main.py`: Main FastAPI app wiring all routers with CORS enabled for `http://localhost:5173` and `http://localhost:5174`

### Phase 5: Test Dataset & Sample `.eml` Files
- Provide 4 sample `.eml` files:
  1. `paypal_credential_phishing.eml` (Critical score ~96)
  2. `ceo_invoice_bec.eml` (Critical score ~94)
  3. `microsoft_teams_spoof.eml` (Critical score ~91)
  4. `legitimate_newsletter.eml` (Low score ~5)

---

## Verification Plan

### Automated Endpoint Testing
- Run test suite with `pytest` / custom Python script to test:
  1. Ingestion of `.eml` files
  2. Header parsing and Received hop extraction
  3. NLP and ML threat scoring accuracy
  4. IP Geolocation and typosquatting calculation
  5. Case and graph relationship generation
  6. Evidence SHA-256 hash preservation

### Manual Verification
- Start FastAPI server on port 8000: `python run.py`
- Open interactive API documentation at `http://localhost:8000/docs`
- Execute live `.eml` uploads and verify full JSON response payloads.
