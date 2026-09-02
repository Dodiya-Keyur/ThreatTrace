from typing import Dict, List, Any

def generate_threat_graph(email_record: Dict[str, Any] = None, case_id: str = "CASE-1001") -> Dict[str, Any]:
    """Generate attack & relationship graph nodes and edges for React Flow visualization."""
    if email_record is None:
        email_record = {}
    file_info = email_record.get('fileInfo', {})
    hops = email_record.get('hops', [])
    urls = email_record.get('iocs', {}).get('urls', [])
    
    subject = file_info.get('subject', 'CEO Wire Request')
    origin_ip = hops[0]['ip'] if hops else '185.220.101.4'
    domain = file_info.get('fromDomain', 'payroll-update-sec.com')
    first_url = urls[0]['url'] if urls else 'http://payroll-update-sec.com/portal'

    nodes = [
        {"id": "n-email", "label": subject, "type": "email", "data": {"label": subject, "type": "email", "color": "#dc2626"}},
        {"id": "n-ip", "label": origin_ip, "type": "ip", "data": {"label": origin_ip, "type": "ip", "color": "#000000"}},
        {"id": "n-domain", "label": domain, "type": "domain", "data": {"label": domain, "type": "domain", "color": "#ea580c"}},
        {"id": "n-campaign", "label": "Campaign 'Financial BEC'", "type": "campaign", "data": {"label": "Campaign 'Financial BEC'", "type": "campaign", "color": "#9333ea"}},
        {"id": "n-case", "label": case_id, "type": "case", "data": {"label": case_id, "type": "case", "color": "#0284c7"}},
        {"id": "n-url", "label": first_url[:35] + '...', "type": "url", "data": {"label": first_url[:35] + '...', "type": "url", "color": "#dc2626"}}
    ]

    edges = [
        {"id": "e1", "source": "n-email", "target": "n-ip", "label": "SENT FROM"},
        {"id": "e2", "source": "n-ip", "target": "n-domain", "label": "HOSTED ON"},
        {"id": "e3", "source": "n-email", "target": "n-url", "label": "CONTAINS URL"},
        {"id": "e4", "source": "n-domain", "target": "n-campaign", "label": "ASSOCIATED WITH"},
        {"id": "e5", "source": "n-email", "target": "n-case", "label": "APPEARS IN"}
    ]

    return {"nodes": nodes, "edges": edges}

class GraphService:
    @staticmethod
    def build_case_graph(case_data: Dict[str, Any] = None, emails: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        case_id = case_data.get("id", "CASE-1001") if isinstance(case_data, dict) else str(case_data or "CASE-1001")
        return generate_threat_graph(case_id=case_id)
