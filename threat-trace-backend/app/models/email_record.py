import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class EmailRecord(Base):
    __tablename__ = "email_records"

    id = Column(String, primary_key=True, index=True)
    subject = Column(String, nullable=False)
    sender = Column(String, nullable=False)
    sender_display = Column(String, default="")
    recipient = Column(String, nullable=False)
    reply_to = Column(String, default="")
    return_path = Column(String, default="")
    message_id = Column(String, default="")
    date = Column(DateTime, default=datetime.datetime.utcnow)
    body_text = Column(Text, default="")
    body_html = Column(Text, default="")
    raw_headers = Column(Text, default="")
    raw_eml = Column(Text, default="")
    
    case_id = Column(String, ForeignKey("cases.id"), nullable=True)
    
    threat = relationship("Threat", back_populates="email", uselist=False, cascade="all, delete-orphan")
    case = relationship("Case", back_populates="emails")
