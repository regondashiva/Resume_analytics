from fastapi import WebSocket
from typing import List
import json
import asyncio
import datetime

class NotificationManager:
    def __init__(self):
        # Store active websocket connections
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, notification_type: str, message: str, data: dict = None):
        """Broadcast an event to all connected active user clients"""
        payload = {
            "type": notification_type,
            "message": message,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "data": data or {}
        }
        
        json_payload = json.dumps(payload)
        
        # Clean up inactive connections while broadcasting
        inactive = []
        tasks = []
        
        for connection in self.active_connections:
            try:
                tasks.append(connection.send_text(json_payload))
            except Exception:
                inactive.append(connection)

        # Remove dead connections
        for conn in inactive:
            self.disconnect(conn)

        if tasks:
            # Execute all broadcasts concurrently
            await asyncio.gather(*tasks, return_exceptions=True)

notification_manager = NotificationManager()
