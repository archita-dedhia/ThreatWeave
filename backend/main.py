from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.services.log_processor import get_log_summary, get_logs_json, detect_threats
from backend.models.schemas import SecurityLog, Threat, SummaryStatistics
from typing import List, Optional

app = FastAPI(title="ThreatWeave API")

# Add CORS middleware to allow React/Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "ThreatWeave API is running"}

@app.get("/logs", response_model=List[SecurityLog])
def get_logs():
    try:
        logs = get_logs_json()
        return logs
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/summary", response_model=SummaryStatistics)
def get_summary():
    try:
        summary = get_log_summary()
        return summary
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/threats", response_model=List[Threat])
def get_threats(severity: Optional[str] = None, threat_type: Optional[str] = None):
    try:
        threats = detect_threats()
        if severity:
            threats = [t for t in threats if t["severity"].upper() == severity.upper()]
        if threat_type:
            threats = [t for t in threats if t["threat_type"].lower() == threat_type.lower()]
        return threats
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/threats/{id}", response_model=Threat)
def get_threat(id: str):
    try:
        threats = detect_threats()
        for t in threats:
            if t["id"] == id:
                return t
        raise HTTPException(status_code=404, detail="Threat not found")
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")