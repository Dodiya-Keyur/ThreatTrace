import email
from email import policy
from email.parser import BytesParser, Parser
import re
from typing import Dict, Any, List, Tuple
from datetime import datetime

class EmailParser:
    @staticmethod
    def parse_raw(raw_input: str or bytes) -> Dict[str, Any]:
        """Parses raw RFC 822 email text or bytes into a structured dictionary."""
        if isinstance(raw_input, str):
            msg = Parser(policy=policy.default).parsestr(raw_input)
            raw_text = raw_input
        else:
            msg = BytesParser(policy=policy.default).parsebytes(raw_input)
            raw_text = raw_input.decode('utf-8', errors='replace')

        subject = str(msg.get("subject", "No Subject"))
        from_header = str(msg.get("from", ""))
        to_header = str(msg.get("to", ""))
        reply_to = str(msg.get("reply-to", ""))
        return_path = str(msg.get("return-path", ""))
        message_id = str(msg.get("message-id", ""))
        date_str = str(msg.get("date", ""))

        sender_display, sender_email = EmailParser._extract_name_and_email(from_header)
        recipient_display, recipient_email = EmailParser._extract_name_and_email(to_header)
        _, reply_to_email = EmailParser._extract_name_and_email(reply_to)
        _, return_path_email = EmailParser._extract_name_and_email(return_path)

        body_text = ""
        body_html = ""
        attachments = []

        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("content-disposition", ""))

                if "attachment" in content_disposition:
                    filename = part.get_filename() or "unnamed_attachment"
                    payload = part.get_payload(decode=True) or b""
                    attachments.append({
                        "filename": filename,
                        "size_bytes": len(payload),
                        "content_type": content_type
                    })
                elif content_type == "text/plain" and not body_text:
                    payload = part.get_payload(decode=True)
                    if payload:
                        body_text = payload.decode('utf-8', errors='replace')
                elif content_type == "text/html" and not body_html:
                    payload = part.get_payload(decode=True)
                    if payload:
                        body_html = payload.decode('utf-8', errors='replace')
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                text_content = payload.decode('utf-8', errors='replace')
                if msg.get_content_type() == "text/html":
                    body_html = text_content
                    body_text = re.sub('<[^<]+?>', '', text_content)
                else:
                    body_text = text_content

        if not body_text and body_html:
            body_text = re.sub('<[^<]+?>', '', body_html)

        urls = EmailParser._extract_urls(body_text + " " + body_html)
        raw_headers = "\n".join([f"{k}: {v}" for k, v in msg.items()])

        return {
            "subject": subject,
            "sender": sender_email or from_header,
            "sender_display": sender_display or sender_email,
            "recipient": recipient_email or to_header,
            "reply_to": reply_to_email or reply_to,
            "return_path": return_path_email or return_path,
            "message_id": message_id,
            "date": date_str,
            "body_text": body_text.strip(),
            "body_html": body_html.strip(),
            "attachments": attachments,
            "urls": urls,
            "raw_headers": raw_headers or raw_text,
            "raw_eml": raw_text,
            "msg_object": msg
        }

    @staticmethod
    def _extract_name_and_email(header_val: str) -> Tuple[str, str]:
        if not header_val:
            return "", ""
        match = re.search(r'(?:"?([^"]*)"?\s*)?<([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)>', header_val)
        if match:
            display = match.group(1) or ""
            email_addr = match.group(2)
            return display.strip(), email_addr.strip().lower()
        
        email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', header_val)
        if email_match:
            return "", email_match.group(0).lower()
        
        return header_val.strip(), header_val.strip()

    @staticmethod
    def _extract_urls(content: str) -> List[Dict[str, Any]]:
        pattern = r'https?://[^\s<>"\')]+'
        raw_urls = list(set(re.findall(pattern, content)))
        
        results = []
        for url in raw_urls:
            is_ip_host = bool(re.search(r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', url))
            results.append({
                "url": url,
                "is_ip_hosted": is_ip_host,
                "malicious": is_ip_host or "verify" in url or "login" in url or "token=" in url
            })
        return results
