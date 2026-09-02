import uvicorn
import os
import sys

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"[INFO] Starting ThreatTrace AI Forensic Backend Server on http://{host}:{port} ...")
    uvicorn.run("app.main:app", host=host, port=port, reload=False)
