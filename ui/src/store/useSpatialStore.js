// useSpatialStore.js — Zustand store for Spatial-Telemetry-Protocol state
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export const useSpatialStore = create(
  subscribeWithSelector((set, get) => ({
    // ── Connection ──────────────────────────────────────────────────────────
    socket: null,
    connected: false,

    // ── Source code (for LineTracer) ────────────────────────────────────────
    sourceCode: "",

    // ── Static scene graph (from AST) ──────────────────────────────────────
    sceneGraph: { nodes: [], edges: [] },

    // ── Live execution log ─────────────────────────────────────────────────
    executionLog: [],
    currentFrameIdx: 0,
    isPlaying: false,          // starts false — user presses play to step through
    playbackSpeed: 300,        // ms per frame (adjustable 50–2000)

    // ── Current frame state (derived from executionLog[currentFrameIdx]) ───
    activeFunction: null,
    activeLineno: 0,
    activeLocals: {},
    activeEvent: "",           // call | line | return | exception

    // ── Loop iteration counters (keyed by loop node_id) ────────────────────
    loopIterations: {},

    runId: 0,

    // ── Exception state ────────────────────────────────────────────────────
    exception: null,

    // ── Run metadata ──────────────────────────────────────────────────────
    runEnd: null,

    // ── AI narration ──────────────────────────────────────────────────────
    narration: "",

    // ── Actions ────────────────────────────────────────────────────────────

    setSocket:    (ws) => set({ socket: ws }),
    setConnected: (v)  => set({ connected: v }),
    setSourceCode:(s)  => set({ sourceCode: s }),
    setGraph:     (g)  => set({ sceneGraph: g }),
    setNarration: (t)  => set({ narration: t }),
    setRunEnd:    (d)  => set({ runEnd: d, isPlaying: false }),

    setException: (exc) => set({ exception: exc }),
    clearException: ()  => set({ exception: null }),

    // ── Add a new frame (called per WS packet) ─────────────────────────────
    addFrame: (frame) =>
      set((s) => {
        const newLog = [...s.executionLog, frame];

        // Increment loop iteration counter if the line is inside a loop node
        const loopIter = { ...s.loopIterations };
        if (frame.event === "line") {
          const loopNode = s.sceneGraph.nodes.find(
            (n) =>
              n.type === "loop" &&
              frame.lineno >= n.lineno &&
              frame.lineno <= n.end_lineno
          );
          if (loopNode) {
            loopIter[loopNode.id] = (loopIter[loopNode.id] ?? 0) + 1;
          }
        }

        return {
          executionLog: newLog,
          loopIterations: loopIter,
        };
      }),

    // ── Move display to a specific frame index ─────────────────────────────
    setCurrentFrame: (idx) => {
      const { executionLog, socket } = get();
      const frame = executionLog[idx];
      if (!frame) return;
      set({
        currentFrameIdx: idx,
        activeFunction:  frame.function  ?? null,
        activeLineno:    frame.lineno    ?? 0,
        activeLocals:    frame.locals    ?? {},
        activeEvent:     frame.event     ?? "",
      });
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ cmd: "scrub", frame_id: idx }));
      }
    },

    // ── Scrub to index (pauses playback) ───────────────────────────────────
    scrubTo: (idx) => {
      get().setCurrentFrame(idx);
      set({ isPlaying: false });
    },

    // ── Playback speed ─────────────────────────────────────────────────────
    setPlaybackSpeed: (ms) => set({ playbackSpeed: ms }),

    play:  () => set({ isPlaying: true }),
    pause: () => set({ isPlaying: false }),

    // ── Reset for new run ──────────────────────────────────────────────────
    reset: () =>
      set((s) => ({
        runId:          s.runId + 1,
        executionLog:   [],
        currentFrameIdx: 0,
        isPlaying:      false,
        activeFunction: null,
        activeLineno:   0,
        activeLocals:   {},
        activeEvent:    "",
        loopIterations: {},
        exception:      null,
        runEnd:         null,
        narration:      "",
        sceneGraph:     { nodes: [], edges: [] },
      })),
  }))
);
