from pydantic import BaseModel, Field
from typing import Optional, List

class SecurityLog(BaseModel):
    timestamp: str
    source_ip: str
    destination_ip: str
    user: str
    event_type: str
    action: str
    status: str
    process: Optional[str] = None
    command: Optional[str] = None
    file: Optional[str] = None
    bytes_transferred: int

class Threat(BaseModel):
    id: str
    timestamp: str
    source_ip: str
    destination_ip: str
    threat_type: str
    severity: str
    risk_score: int
    status: str
    description: str
    detection_reason: str
    relevant_log_information: SecurityLog

class SummaryStatistics(BaseModel):
    total_logs: int
    failed_logins: int
    suspicious_commands: int
    total_bytes_transferred: int
    unique_users: int
    unique_source_ips: int
