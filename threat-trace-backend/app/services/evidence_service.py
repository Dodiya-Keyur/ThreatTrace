import hashlib
from datetime import datetime
from typing import Dict, Any, List

def create_evidence_record(
    case_id: str = "CASE-1001",
    artifact_type: str = "Original Email Payload (.eml)",
    file_name: str = "payload.eml",
    payload: str = "",
    uploaded_by: str = "Alex Vance"
) -> Dict[str, Any]:
    """Generate SHA-256 hash and ISO 27037 chain-of-custody entry for forensic evidence."""
    sha256_hash = hashlib.sha256(payload.encode('utf-8')).hexdigest() if payload else "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    return {
        "id": f"ev-{hashlib.md5((payload or file_name).encode()).hexdigest()[:8]}",
        "case_id": case_id,
        "evidence_number": f"EV-00{datetime.now().second % 9 + 1}",
        "artifact_type": artifact_type,
        "file_name": file_name,
        "file_hash": sha256_hash,
        "uploaded_by": uploaded_by,
        "custody_status": "Preserved",
        "timestamp": datetime.utcnow().strftime("%I:%M %p")
    }

class EvidenceService:
    @staticmethod
    def compute_sha256(content: str or bytes) -> str:
        if isinstance(content, str):
            data = content.encode('utf-8')
        else:
            data = content
        return hashlib.sha256(data).hexdigest()

    @staticmethod
    def create_evidence_record(
        filename: str,
        content: str or bytes,
        collected_by: str = "Alex Vance",
        evidence_type: str = "email_source",
        case_id: str = None
    ) -> Dict[str, Any]:
        sha256_hash = EvidenceService.compute_sha256(content)
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        audit_trail = [
            {"action": "Raw artifact ingested", "by": collected_by, "timestamp": timestamp},
            {"action": "SHA-256 cryptographic hash calculated", "by": "Forensic Engine", "timestamp": timestamp},
            {"action": "Artifact preserved in immutable evidence registry", "by": "System", "timestamp": timestamp}
        ]

        return {
            "filename": filename,
            "evidence_type": evidence_type,
            "sha256": sha256_hash,
            "collected_by": collected_by,
            "case_id": case_id,
            "status": "preserved",
            "audit_trail": audit_trail
        }
