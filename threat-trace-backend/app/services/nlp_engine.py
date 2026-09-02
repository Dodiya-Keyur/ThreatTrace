import re
from typing import Dict, Any, List

class NLPEngine:
    URGENCY_KEYWORDS = [
        "urgent", "immediately", "immediate action", "account suspended", "limited access",
        "24 hours", "within 24 hours", "termination", "critical alert", "security alert",
        "action required", "expiring", "unauthorized activity", "compromised", "promptly"
    ]
    
    CREDENTIAL_KEYWORDS = [
        "verify your identity", "verify your account", "confirm your identity", "login to verify",
        "click here to verify", "update your password", "reset password", "credential",
        "sign in to review", "security verification", "validate account"
    ]
    
    BEC_KEYWORDS = [
        "wire transfer", "payment diversion", "invoice payment", "remittance", "new bank details",
        "confidential payment", "executive request", "ceo request", "funds transfer", "swift",
        "outstanding invoice", "payment overdue", "pay urgently"
    ]
    
    IMPERSONATION_KEYWORDS = [
        "paypal security", "microsoft 365", "microsoft team", "google drive", "fedex tracking",
        "it support", "security operations", "payroll department", "human resources", "admin team"
    ]

    MALWARE_KEYWORDS = [
        "invoice.exe", "payment_receipt.zip", "document.scr", "order_confirmation.iso",
        "enable macros", "run attached file", "extract archive"
    ]

    @staticmethod
    def analyze_text(subject: str, body: str, sender_display: str) -> Dict[str, int]:
        combined_text = f"{subject} {body} {sender_display}".lower()

        urgency_score = NLPEngine._score_category(combined_text, NLPEngine.URGENCY_KEYWORDS, base_weight=20)
        credential_score = NLPEngine._score_category(combined_text, NLPEngine.CREDENTIAL_KEYWORDS, base_weight=25)
        bec_score = NLPEngine._score_category(combined_text, NLPEngine.BEC_KEYWORDS, base_weight=25)
        impersonation_score = NLPEngine._score_category(combined_text, NLPEngine.IMPERSONATION_KEYWORDS, base_weight=22)
        malware_score = NLPEngine._score_category(combined_text, NLPEngine.MALWARE_KEYWORDS, base_weight=30)
        
        social_eng_score = min(100, int((urgency_score * 0.5) + (impersonation_score * 0.5)))

        return {
            "urgencyScore": urgency_score,
            "socialEngineeringScore": social_eng_score,
            "impersonationScore": impersonation_score,
            "credentialPhishingScore": credential_score,
            "financialFraudScore": bec_score,
            "malwareRisk": malware_score
        }

    @staticmethod
    def _score_category(text: str, keywords: List[str], base_weight: int) -> int:
        hits = 0
        for kw in keywords:
            if kw in text:
                hits += 1
        
        score = hits * base_weight
        return min(98, max(5, score)) if hits > 0 else 5
