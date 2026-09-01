import hashlib
import os
import pandas as pd
import numpy as np
from typing import List, Dict, Any

# Resolve DATA_DIR across different working directories
POSSIBLE_PATHS = [
    os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "ThreatWeave_security_logs.csv"),
    os.path.join(os.path.dirname(__file__), "..", "data", "ThreatWeave_security_logs.csv"),
    os.path.join(os.getcwd(), "backend", "data", "ThreatWeave_security_logs.csv"),
    os.path.join(os.getcwd(), "data", "ThreatWeave_security_logs.csv"),
]

DATA_FILE = next((p for p in POSSIBLE_PATHS if os.path.isfile(p)), POSSIBLE_PATHS[0])

def check_dataset_exists() -> bool:
    """Check if the actual dataset file exists."""
    return os.path.isfile(DATA_FILE)

def load_security_logs() -> pd.DataFrame:
    """Load and clean the security logs CSV file."""
    if not check_dataset_exists():
        # Search again in case working directory changed
        for p in POSSIBLE_PATHS:
            if os.path.isfile(p):
                return pd.read_csv(p).replace({np.nan: None})
        raise FileNotFoundError(f"Dataset not found at {DATA_FILE}")
    
    df = pd.read_csv(DATA_FILE)
    
    # Handle NaN values by converting them to None for JSON serialization compatibility
    df = df.replace({np.nan: None})
    return df

def get_logs_json() -> List[Dict[str, Any]]:
    """Return logs as a JSON compatible list of dicts."""
    df = load_security_logs()
    return df.to_dict(orient="records")

def get_log_summary() -> Dict[str, Any]:
    """Calculate summary statistics from the actual CSV."""
    df = load_security_logs()
    
    failed_logins = len(df[(df['event_type'] == 'authentication') & (df['status'] == 'failed')])
    
    suspicious_commands = len(df[df['command'].str.contains('powershell|Invoke-WebRequest|curl -T', case=False, na=False)])
    
    total_bytes = df['bytes_transferred'].sum()
    unique_users = df['user'].nunique()
    unique_source_ips = df['source_ip'].nunique()
    
    return {
        "total_logs": len(df),
        "failed_logins": int(failed_logins),
        "suspicious_commands": int(suspicious_commands),
        "total_bytes_transferred": int(total_bytes),
        "unique_users": int(unique_users),
        "unique_source_ips": int(unique_source_ips)
    }

import uuid

def calculate_severity(score: int) -> str:
    if score <= 25:
        return "LOW"
    elif score <= 50:
        return "MEDIUM"
    elif score <= 75:
        return "HIGH"
    else:
        return "CRITICAL"

def detect_threats() -> List[Dict[str, Any]]:
    """Analyze the dataset to detect specific threats based on rules."""
    df = load_security_logs()
    threats = []
    
    # Sort by timestamp to ensure chronological order
    df['timestamp_dt'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values('timestamp_dt')
    
    # 1. Brute Force (Repeated failed authentications from same IP)
    failed_auths = df[(df['event_type'] == 'authentication') & (df['status'] == 'failed')]
    ip_fail_counts = failed_auths.groupby('source_ip').size()
    brute_force_ips = ip_fail_counts[ip_fail_counts >= 3].index.tolist()
    
    for ip in brute_force_ips:
        ip_logs = failed_auths[failed_auths['source_ip'] == ip]
        count = len(ip_logs)
        latest_log = ip_logs.iloc[-1].to_dict()
        latest_log.pop('timestamp_dt')
        
        # Risk Score logic for Brute Force:
        # Base score 60, +5 for each failure > 3, cap at 80
        # If there is a successful login AFTER the failures from same IP, set to 100
        risk_score = min(80, 60 + (count - 3) * 5)
        
        success_after = df[(df['source_ip'] == ip) & (df['event_type'] == 'authentication') & (df['status'] == 'success') & (df['timestamp_dt'] > ip_logs.iloc[-1]['timestamp_dt'])]
        if not success_after.empty:
            risk_score = 100
            
        threats.append({
            "id": hashlib.md5((str(latest_log['timestamp']) + str(latest_log['source_ip']) + 'BruteForce').encode()).hexdigest(),
            "timestamp": str(latest_log['timestamp']),
            "source_ip": latest_log['source_ip'],
            "destination_ip": latest_log['destination_ip'],
            "threat_type": "Brute Force",
            "severity": calculate_severity(risk_score),
            "risk_score": risk_score,
            "status": "Active" if risk_score < 100 else "Compromised",
            "description": f"{count} failed login attempts detected.",
            "detection_reason": f"Repeated failed authentication attempts ({count}) from the same source IP.",
            "relevant_log_information": latest_log
        })
        
    # 2. Suspicious Execution (Malware / PowerShell)
    suspicious_logs = df[df['command'].astype(str).str.contains('powershell|Invoke-WebRequest|-enc', case=False, na=False)]
    for _, row in suspicious_logs.iterrows():
        log = row.to_dict()
        log.pop('timestamp_dt')
        
        # Risk Score logic: PowerShell encoded commands are 90, simple bypass or scripts are 80
        cmd = str(log.get('command', ''))
        risk_score = 90 if '-enc' in cmd else 80
            
        threats.append({
            "id": hashlib.md5((str(log['timestamp']) + str(log['source_ip']) + str(log['event_type'])).encode()).hexdigest(),
            "timestamp": str(log['timestamp']),
            "source_ip": log['source_ip'],
            "destination_ip": log['destination_ip'],
            "threat_type": "Suspicious Execution",
            "severity": calculate_severity(risk_score),
            "risk_score": risk_score,
            "status": "Active",
            "description": "Potentially malicious command executed.",
            "detection_reason": f"Command execution matched suspicious signatures: {cmd}",
            "relevant_log_information": log
        })
        
    # 3. Data Exfiltration (Large byte transfers)
    # Define large transfer as > 10MB (10485760 bytes)
    exfiltration_logs = df[df['bytes_transferred'] > 10000000]
    for _, row in exfiltration_logs.iterrows():
        log = row.to_dict()
        log.pop('timestamp_dt')
        
        # Risk Score logic: Base 70, +10 for every additional 20MB, cap at 100
        bytes_mb = log['bytes_transferred'] / 1000000
        risk_score = int(min(100, 70 + max(0, (bytes_mb - 10) / 20 * 10)))
            
        threats.append({
            "id": hashlib.md5((str(log['timestamp']) + str(log['source_ip']) + str(log['event_type'])).encode()).hexdigest(),
            "timestamp": str(log['timestamp']),
            "source_ip": log['source_ip'],
            "destination_ip": log['destination_ip'],
            "threat_type": "Data Exfiltration",
            "severity": calculate_severity(risk_score),
            "risk_score": risk_score,
            "status": "Active",
            "description": f"Large data transfer of {bytes_mb:.1f} MB detected.",
            "detection_reason": f"High volume of bytes transferred ({log['bytes_transferred']} bytes), exceeding threshold.",
            "relevant_log_information": log
        })
        
    # 4. Privilege Escalation
    privilege_logs = df[df['action'] == 'privilege_escalation']
    for _, row in privilege_logs.iterrows():
        log = row.to_dict()
        log.pop('timestamp_dt')
        
        risk_score = 95
        threats.append({
            "id": hashlib.md5((str(log['timestamp']) + str(log['source_ip']) + str(log['event_type'])).encode()).hexdigest(),
            "timestamp": str(log['timestamp']),
            "source_ip": log['source_ip'],
            "destination_ip": log['destination_ip'],
            "threat_type": "Privilege Escalation",
            "severity": calculate_severity(risk_score),
            "risk_score": risk_score,
            "status": "Compromised",
            "description": "User requested privilege escalation.",
            "detection_reason": f"Privilege escalation action detected (e.g. {log.get('command', 'sudo')}).",
            "relevant_log_information": log
        })
        
    return threats