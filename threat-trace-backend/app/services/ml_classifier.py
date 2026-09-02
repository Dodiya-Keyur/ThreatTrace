from typing import Dict, Any, List, Tuple

class MLClassifier:
    @staticmethod
    def classify_email(
        parsed_email: Dict[str, Any],
        header_analysis: Dict[str, Any],
        nlp_analysis: Dict[str, int],
        domain_intel: Dict[str, Any]
    ) -> Tuple[int, str, str, List[Dict[str, Any]]]:
        indicators = []
        threat_score = 0

        sender = parsed_email["sender"].lower()
        sender_display = parsed_email["sender_display"].lower()
        sender_domain = sender.split("@")[-1] if "@" in sender else ""
        
        # 1. Typosquatting / Lookalike Domain
        is_typosquat = domain_intel.get("is_typosquat", False)
        typosquat_target = domain_intel.get("typosquat_target", "")
        if is_typosquat:
            threat_score += 35
            indicators.append({
                "type": "SUSPICIOUS_DOMAIN",
                "label": "Suspicious sender domain",
                "detected": True,
                "detail": f"{sender_domain} is a typosquat of {typosquat_target} ({int(domain_intel.get('similarity', 0)*100)}% similarity)"
            })
        elif domain_intel.get("domain_age_days", 999) < 30:
            threat_score += 20
            indicators.append({
                "type": "SUSPICIOUS_DOMAIN",
                "label": "Suspicious sender domain",
                "detected": True,
                "detail": f"Domain registered only {domain_intel.get('domain_age_days')} days ago"
            })
        else:
            indicators.append({
                "type": "SUSPICIOUS_DOMAIN",
                "label": "Sender domain reputation",
                "detected": False,
                "detail": f"Domain {sender_domain} has established reputation"
            })

        # 2. Display Name Impersonation
        if ("paypal" in sender_display and "paypal.com" not in sender_domain) or \
           ("microsoft" in sender_display and "microsoft.com" not in sender_domain) or \
           ("google" in sender_display and "google.com" not in sender_domain) or \
           ("ceo" in sender_display and "acmecorp.com" not in sender_domain):
            threat_score += 30
            indicators.append({
                "type": "SPOOFED_SENDER",
                "label": "Spoofed sender address",
                "detected": True,
                "detail": f'Display name "{parsed_email["sender_display"]}" does not match domain {sender_domain}'
            })
        else:
            indicators.append({
                "type": "SPOOFED_SENDER",
                "label": "Sender address alignment",
                "detected": False,
                "detail": "Display name aligns with sender mailbox"
            })

        # 3. Malicious URLs
        urls = parsed_email.get("urls", [])
        malicious_urls = [u for u in urls if u.get("malicious")]
        if malicious_urls:
            threat_score += 25
            indicators.append({
                "type": "MALICIOUS_URL",
                "label": "Malicious URL detected",
                "detected": True,
                "detail": f"Detected {len(malicious_urls)} suspicious/phishing URL links in email body"
            })
        else:
            indicators.append({
                "type": "MALICIOUS_URL",
                "label": "URL security",
                "detected": False,
                "detail": "No suspicious URLs detected"
            })

        # 4. Urgency Language
        if nlp_analysis["urgencyScore"] >= 60:
            threat_score += 15
            indicators.append({
                "type": "URGENCY_LANGUAGE",
                "label": "Urgency & pressure language",
                "detected": True,
                "detail": "High frequency of urgent/coercive deadline keywords detected"
            })

        # 5. Credential Requests
        if nlp_analysis["credentialPhishingScore"] >= 60:
            threat_score += 20
            indicators.append({
                "type": "CREDENTIAL_REQUEST",
                "label": "Credential harvesting attempt",
                "detected": True,
                "detail": "Requests password reset or identity verification via external link"
            })

        # 6. SPF / DKIM / DMARC Failures
        auth = header_analysis.get("authentication", {})
        if auth.get("spf", {}).get("status") in ["FAIL", "SOFTFAIL"]:
            threat_score += 15
            indicators.append({
                "type": "SPF_FAIL",
                "label": "SPF authentication failed",
                "detected": True,
                "detail": auth["spf"]["detail"]
            })
        
        if auth.get("dmarc", {}).get("status") == "FAIL":
            threat_score += 10
            indicators.append({
                "type": "DMARC_FAIL",
                "label": "DMARC policy failure",
                "detected": True,
                "detail": auth["dmarc"]["detail"]
            })

        # 7. Reply-To Mismatch
        if header_analysis.get("reply_to_mismatch"):
            threat_score += 15
            indicators.append({
                "type": "FORGED_REPLY_TO",
                "label": "Suspicious Reply-To",
                "detected": True,
                "detail": f"Reply-To ({parsed_email['reply_to']}) differs from sender address"
            })

        # Normalize score
        final_score = min(98, max(5, threat_score))
        if final_score < 30 and nlp_analysis["urgencyScore"] < 25 and not is_typosquat:
            final_score = 5

        # Determine Classification
        if final_score >= 80:
            if nlp_analysis["financialFraudScore"] >= 50 or "invoice" in parsed_email["subject"].lower():
                classification = "BEC"
            elif nlp_analysis["credentialPhishingScore"] >= 50 or is_typosquat:
                classification = "PHISHING"
            elif nlp_analysis["impersonationScore"] >= 60:
                classification = "IMPERSONATION"
            elif nlp_analysis["malwareRisk"] >= 40:
                classification = "MALWARE"
            else:
                classification = "PHISHING"
        elif final_score >= 50:
            classification = "SUSPICIOUS"
        else:
            classification = "LEGITIMATE"

        # Determine Severity
        if final_score >= 85:
            severity = "critical"
        elif final_score >= 65:
            severity = "high"
        elif final_score >= 40:
            severity = "medium"
        else:
            severity = "low"

        return final_score, classification, severity, indicators
