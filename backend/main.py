import os
import sys
import datetime
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse

# Ensure root and backend directories are in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from backend.services.log_processor import get_log_summary, get_logs_json, detect_threats
    from backend.models.schemas import SecurityLog, Threat, SummaryStatistics
except ModuleNotFoundError:
    from services.log_processor import get_log_summary, get_logs_json, detect_threats
    from models.schemas import SecurityLog, Threat, SummaryStatistics

app = FastAPI(title="ThreatWeave API")

# Allow all origins, methods and headers for local and remote dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-Memory Storage Fallbacks
in_memory_reports: List[Dict[str, Any]] = []
in_memory_incidents: List[Dict[str, Any]] = []
in_memory_threats: List[Dict[str, Any]] = []
in_memory_events: List[Dict[str, Any]] = []

# ==========================================
# HEALTH & WELCOME ENDPOINTS
# ==========================================
@app.get("/")
@app.get("/api")
def root():
    return {
        "message": "ThreatWeave API is running",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/health",
            "logs": "/api/logs",
            "summary": "/api/summary",
            "threats": "/api/threats",
            "incidents": "/api/incidents",
            "events": "/api/events",
            "reports": "/api/reports",
            "db_status": "/api/db-status",
            "crewai_status": "/api/crewai-status",
            "crewai_run_pipeline": "/api/crewai/run-pipeline",
            "crewai_generate_report": "/api/crewai/generate-report",
            "generate_markdown": "/api/generate-markdown",
            "generate_pdf": "/api/generate-pdf",
        },
    }

@app.get("/health")
@app.get("/api/health")
def health():
    return {
        "status": "Server is running",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "dbConnected": False,
        "mongoUriConfigured": False,
        "crewai": {
            "configured": False,
            "base_url": "not set",
            "token_configured": False,
        },
    }

@app.get("/db-status")
@app.get("/api/db-status")
def db_status():
    return {
        "connected": False,
        "mongoUri": "not configured",
    }

@app.get("/crewai-status")
@app.get("/api/crewai-status")
def crewai_status():
    return {
        "configured": False,
        "connected": False,
        "base_url": "not set",
        "token_configured": False,
        "detail": "CrewAI credentials not configured in environment. Local SOC detection engine active.",
    }

@app.post("/crewai/run-pipeline")
@app.post("/api/crewai/run-pipeline")
def crewai_run_pipeline(payload: Optional[Dict[str, Any]] = None):
    return {
        "success": False,
        "configured": False,
        "fallback": True,
        "message": "CrewAI not configured. Built-in multi-agent heuristic engine active.",
    }

@app.post("/crewai/generate-report")
@app.post("/api/crewai/generate-report")
def crewai_generate_report(payload: Optional[Dict[str, Any]] = None):
    return {
        "success": False,
        "configured": False,
        "fallback": True,
        "message": "CrewAI not configured. Using local report generator.",
    }

# ==========================================
# LOGS & ANALYTICS
# ==========================================
@app.get("/logs", response_model=List[Dict[str, Any]])
@app.get("/api/logs", response_model=List[Dict[str, Any]])
def get_logs():
    try:
        logs = get_logs_json()
        return logs
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/summary", response_model=SummaryStatistics)
@app.get("/api/summary", response_model=SummaryStatistics)
def get_summary():
    try:
        summary = get_log_summary()
        return summary
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# ==========================================
# THREATS
# ==========================================
@app.get("/threats", response_model=List[Dict[str, Any]])
@app.get("/api/threats", response_model=List[Dict[str, Any]])
def get_threats(severity: Optional[str] = None, threat_type: Optional[str] = None):
    try:
        threats = detect_threats()
        if in_memory_threats:
            existing_ids = {t.get("id") for t in threats}
            for mem_t in in_memory_threats:
                if mem_t.get("id") not in existing_ids:
                    threats.append(mem_t)
        if severity:
            threats = [t for t in threats if str(t.get("severity", "")).upper() == severity.upper()]
        if threat_type:
            threats = [t for t in threats if str(t.get("threat_type", "")).lower() == threat_type.lower()]
        return threats
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/threats/{id}", response_model=Dict[str, Any])
@app.get("/api/threats/{id}", response_model=Dict[str, Any])
def get_threat(id: str):
    try:
        threats = detect_threats()
        for t in threats:
            if t["id"] == id:
                return t
        for t in in_memory_threats:
            if t.get("id") == id:
                return t
        raise HTTPException(status_code=404, detail="Threat not found")
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.post("/threats/batch")
@app.post("/api/threats/batch")
def save_threats_batch(items: List[Dict[str, Any]]):
    for item in items:
        idx = next((i for i, t in enumerate(in_memory_threats) if t.get("id") == item.get("id")), -1)
        if idx >= 0:
            in_memory_threats[idx] = item
        else:
            in_memory_threats.append(item)
    return {"saved": True, "count": len(items)}

# ==========================================
# INCIDENTS
# ==========================================
@app.get("/incidents")
@app.get("/api/incidents")
def get_incidents():
    return in_memory_incidents

@app.post("/incidents/batch")
@app.post("/api/incidents/batch")
def save_incidents_batch(items: List[Dict[str, Any]]):
    for item in items:
        idx = next((i for i, inc in enumerate(in_memory_incidents) if inc.get("id") == item.get("id")), -1)
        if idx >= 0:
            in_memory_incidents[idx] = item
        else:
            in_memory_incidents.append(item)
    return {"saved": True, "count": len(items)}

# ==========================================
# EVENTS
# ==========================================
@app.get("/events")
@app.get("/api/events")
def get_events():
    return in_memory_events

@app.post("/events/batch")
@app.post("/api/events/batch")
def save_events_batch(items: List[Dict[str, Any]]):
    for item in items:
        idx = next((i for i, e in enumerate(in_memory_events) if e.get("id") == item.get("id")), -1)
        if idx < 0:
            in_memory_events.append(item)
    return {"saved": True, "count": len(items)}

# ==========================================
# REPORTS
# ==========================================
@app.get("/reports")
@app.get("/api/reports")
def get_reports():
    return in_memory_reports

@app.get("/reports/{id}")
@app.get("/api/reports/{id}")
def get_report(id: str):
    for r in in_memory_reports:
        if r.get("id") == id:
            return r
    raise HTTPException(status_code=404, detail="Report not found")

@app.post("/reports")
@app.post("/api/reports")
def save_report(report: Dict[str, Any]):
    idx = next((i for i, r in enumerate(in_memory_reports) if r.get("id") == report.get("id")), -1)
    if idx >= 0:
        in_memory_reports[idx] = report
    else:
        in_memory_reports.insert(0, report)
    return {"saved": True, "report": report}

@app.delete("/reports/{id}")
@app.delete("/api/reports/{id}")
def delete_report(id: str):
    global in_memory_reports
    in_memory_reports = [r for r in in_memory_reports if r.get("id") != id]
    return {"deleted": True}

# ==========================================
# REPORT GENERATION (Markdown & PDF)
# ==========================================
@app.post("/generate-markdown")
@app.post("/api/generate-markdown")
def generate_markdown(r: Dict[str, Any]):
    md = f"""# {r.get('title') or r.get('threat_title') or 'Incident Investigation Report'}

**Report ID:** {r.get('id', 'N/A')}
**Incident ID:** {r.get('incident_id', 'N/A')}
**Generated Date:** {r.get('generated_at', datetime.datetime.now(datetime.timezone.utc).isoformat())}
**Generated By:** {r.get('generated_by', 'ThreatWeave AI')}
**Risk Level:** {r.get('risk_level', 'N/A')} (Score: {r.get('risk_score', 'N/A')}/100)
**Confidence:** {r.get('confidence', 'N/A')}%

---

## 1. Executive Summary
{r.get('executive_summary') or r.get('threat_summary') or 'N/A'}

---

## 2. Incident Context & Affected Assets

| Attribute | Value |
|-----------|-------|
| Target Entity | {r.get('affected_user', 'N/A')} |
| Impacted System | {r.get('affected_system', 'N/A')} |
| Affected Asset | {r.get('affected_user_system', 'N/A')} |
| Attack Origin / Vector | {r.get('source') or r.get('attack_vector') or 'N/A'} |
| Classification | {r.get('threat_classification') or r.get('type') or 'N/A'} |
| Detection Time | {r.get('detection_time', 'N/A')} |

---

## 3. Root Cause Analysis
{r.get('root_cause') or 'Root cause analysis pending.'}

---

## 4. Immediate Containment Actions Taken
{chr(10).join(f"{i+1}. {c}" for i, c in enumerate(r.get('containment_actions', []))) if r.get('containment_actions') else 'No containment actions recorded.'}

---

*Document generated by ThreatWeave Security Operations Platform*
"""
    return PlainTextResponse(
        content=md,
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="ThreatWeave_Report_{r.get("id", "UNSAVED")}.md"'},
    )