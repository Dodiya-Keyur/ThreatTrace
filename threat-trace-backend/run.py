import os
import sys

# Ensure current directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"[INFO] ThreatTrace API starting on host {host} and port {port}...")
    uvicorn.run(app, host=host, port=port)
