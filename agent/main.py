"""
main.py — SpatialCodeTwin FastAPI WebSocket server
Implements the Spatial-Telemetry-Protocol (STP) bridge between
the Python TelemetryEngine and the React/WebXR frontend.

Run:  uvicorn main:app --host 0.0.0.0 --port 8765 --reload
"""

import asyncio
import json
import threading
from typing import Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from ast_extractor import extract_graph
from telemetry_engine import TelemetryEngine

# ── App setup ────────────────────────────────────────────────────────────────

app = FastAPI(title="SpatialCodeTwin Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Connection manager ────────────────────────────────────────────────────────

class ConnectionManager:
    """Tracks all active WebSocket clients and provides broadcast helpers."""

    def __init__(self):
        self.active: list[WebSocket] = []
        self._lock = asyncio.Lock()

    async def connect(self, ws: WebSocket):
        await ws.accept()
        async with self._lock:
            self.active.append(ws)

    async def disconnect(self, ws: WebSocket):
        async with self._lock:
            if ws in self.active:
                self.active.remove(ws)

    async def send(self, ws: WebSocket, data: dict):
        try:
            await ws.send_text(json.dumps(data))
        except Exception:
            await self.disconnect(ws)

    async def broadcast(self, data: dict):
        dead: list[WebSocket] = []
        for ws in list(self.active):
            try:
                await ws.send_text(json.dumps(data))
            except Exception:
                dead.append(ws)
        for ws in dead:
            await self.disconnect(ws)


manager = ConnectionManager()

# One engine per server instance (single-user dev mode).
# For multi-user: scope engine to each WebSocket session.
engine: TelemetryEngine | None = None


# ── Health check ─────────────────────────────────────────────────────────────

@app.get("/")
async def health():
    return {"status": "ok", "service": "SpatialCodeTwin Agent"}


# ── WebSocket endpoint ───────────────────────────────────────────────────────

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global engine
    await manager.connect(websocket)
    loop = asyncio.get_event_loop()

    # Packet callback: called from the tracer thread, bridges to async broadcast
    def on_packet(packet: dict[str, Any]):
        asyncio.run_coroutine_threadsafe(manager.send(websocket, packet), loop)

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg: dict = json.loads(raw)
            except json.JSONDecodeError:
                await manager.send(websocket, {"type": "error", "message": "Invalid JSON"})
                continue

            cmd = msg.get("cmd")

            # ── CMD: run ───────────────────────────────────────────────────
            if cmd == "run":
                source: str = msg.get("source", "")
                if not source.strip():
                    await manager.send(websocket, {
                        "type": "error", "message": "Empty source"
                    })
                    continue

                # 1. Send static AST graph first
                graph = extract_graph(source)
                await manager.send(websocket, {"type": "graph", **graph})

                # 2. Run tracer in background thread so WS stays responsive
                engine = TelemetryEngine(on_packet=on_packet)

                def _run():
                    engine.run(source)

                thread = threading.Thread(target=_run, daemon=True)
                thread.start()

            # ── CMD: scrub ─────────────────────────────────────────────────
            elif cmd == "scrub":
                frame_id = int(msg.get("frame_id", 0))
                if engine is None:
                    await manager.send(websocket, {
                        "type": "error", "message": "No execution in progress"
                    })
                    continue
                frame = engine.get_frame(frame_id)
                if frame:
                    await manager.send(websocket, {"type": "scrub_frame", **frame})
                else:
                    await manager.send(websocket, {
                        "type": "error",
                        "message": f"Frame {frame_id} not found",
                    })

            # ── CMD: pause / resume ────────────────────────────────────────
            elif cmd in ("pause", "resume"):
                # Acknowledged — actual pause logic is frontend-side
                await manager.send(websocket, {"type": "ack", "cmd": cmd})

            else:
                await manager.send(websocket, {
                    "type": "error", "message": f"Unknown command: {cmd}"
                })

    except WebSocketDisconnect:
        await manager.disconnect(websocket)
