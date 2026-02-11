"""
Health check endpoint for the Python API
"""
import os
import json
from http.server import BaseHTTPRequestHandler


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Simple health check"""
        try:
            # Check if essential env vars are set
            has_db = bool(os.environ.get('DATABASE_URL'))
            has_api_key = bool(os.environ.get('OPENROUTER_API_KEY'))
            
            status = "healthy" if (has_db and has_api_key) else "degraded"
            
            response = {
                "status": status,
                "service": "learning-path-agent",
                "checks": {
                    "database_configured": has_db,
                    "api_key_configured": has_api_key
                }
            }
            
            self.send_response(200 if status == "healthy" else 503)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "error",
                "message": str(e)
            }).encode('utf-8'))
