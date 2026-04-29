// useWebSocket.js — opens WS to STP agent and routes all incoming packets
import { useEffect, useCallback } from "react";
import { useSpatialStore } from "../store/useSpatialStore";

const WS_URL = "ws://localhost:8765/ws";

export function useWebSocket() {
  const {
    setSocket, setConnected,
    setGraph, addFrame, setException, setRunEnd,
    reset,
  } = useSpatialStore();

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    setSocket(ws);

    ws.onopen = () => {
      console.log("[STP] Connected to agent");
      setConnected(true);
    };

    ws.onclose = () => {
      console.log("[STP] Disconnected");
      setConnected(false);
    };

    ws.onerror = (e) => {
      console.error("[STP] WebSocket error", e);
      setConnected(false);
    };

    ws.onmessage = (evt) => {
      let packet;
      try {
        packet = JSON.parse(evt.data);
      } catch {
        return;
      }

      switch (packet.type) {
        case "graph":
          setGraph({ nodes: packet.nodes ?? [], edges: packet.edges ?? [] });
          break;

        case "trace":
          addFrame(packet);
          break;

        case "exception":
          setException(packet);
          addFrame(packet);
          break;

        case "run_end":
          setRunEnd(packet);
          break;

        case "scrub_frame":
          // Handled by store.scrubTo — no extra action needed
          break;

        case "error":
          console.warn("[STP] Agent error:", packet.message);
          break;

        default:
          break;
      }
    };

    return () => {
      ws.close();
    };
  }, []); // eslint-disable-line

  // ── Public helpers ────────────────────────────────────────────────────────

  const sendRun = useCallback(
    (source) => {
      const { socket, setSourceCode } = useSpatialStore.getState();
      if (!socket || socket.readyState !== WebSocket.OPEN) return;
      useSpatialStore.getState().reset();
      setSourceCode(source);
      socket.send(JSON.stringify({ cmd: "run", source }));
    },
    []
  );

  const sendScrub = useCallback((frameId) => {
    const { socket } = useSpatialStore.getState();
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ cmd: "scrub", frame_id: frameId }));
  }, []);

  return { sendRun, sendScrub };
}
