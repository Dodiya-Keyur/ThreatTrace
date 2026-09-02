from typing import Dict, Any, List

class ThreatIntelService:
    @staticmethod
    def query_intel(query_type: str, query_val: str) -> List[Dict[str, Any]]:
        clean_val = query_val.strip().lower()

        # Simulated multi-source aggregation engine
        if query_type == "ip":
            return [
                {
                    "source": "VirusTotal",
                    "status": "malicious" if "185" in clean_val or "103" in clean_val else "clean",
                    "detail": "14/72 security engines flagged as malicious" if "185" in clean_val else "0/72 flagged clean",
                    "severity": "critical" if "185" in clean_val else "low"
                },
                {
                    "source": "AbuseIPDB",
                    "status": "high_risk" if "185" in clean_val else "low_risk",
                    "detail": "Confidence Score: 92/100 — 142 reports in 30 days" if "185" in clean_val else "0 abuse reports filed",
                    "severity": "critical" if "185" in clean_val else "low"
                },
                {
                    "source": "Shodan",
                    "status": "found",
                    "detail": "Open ports: 22, 25, 80, 443, 587 — Active SMTP mail server detected",
                    "severity": "high"
                },
                {
                    "source": "AlienVault OTX",
                    "status": "malicious" if "185" in clean_val else "clean",
                    "detail": "Associated with 3 active phishing and credential theft pulses",
                    "severity": "critical" if "185" in clean_val else "low"
                }
            ]

        elif query_type == "domain":
            return [
                {
                    "source": "VirusTotal",
                    "status": "malicious" if "paypa1" in clean_val else "clean",
                    "detail": "9 security vendors flagged domain as phishing / deceptive",
                    "severity": "critical" if "paypa1" in clean_val else "low"
                },
                {
                    "source": "URLScan",
                    "status": "suspicious",
                    "detail": "DOM analysis detected cloned login form targeting payment credentials",
                    "severity": "high"
                },
                {
                    "source": "WHOIS Registrar",
                    "status": "registered",
                    "detail": "Domain age: 12 days. Registrar: NameCheap Inc. Identity privacy masked.",
                    "severity": "medium"
                }
            ]

        elif query_type == "url":
            return [
                {
                    "source": "Google Safe Browsing",
                    "status": "social_engineering",
                    "detail": "URL flagged as deceptive site designed to harvest credentials",
                    "severity": "critical"
                },
                {
                    "source": "URLScan Sandbox",
                    "status": "malicious",
                    "detail": "HTTP redirects to IP host 185.220.101.4/phish/paypal-clone/",
                    "severity": "critical"
                }
            ]

        else: # hash or email
            return [
                {
                    "source": "VirusTotal",
                    "status": "malicious",
                    "detail": "File SHA-256 matches known credential stealer payload",
                    "severity": "critical"
                },
                {
                    "source": "Hybrid Analysis",
                    "status": "threat_detected",
                    "detail": "Sandbox execution observed suspicious process injection",
                    "severity": "high"
                }
            ]
