// App.jsx — SpatialCodeTwin Mission Control
import { useState, useEffect } from "react";
import "aframe";
import Editor from "@monaco-editor/react";
import { useSpatialStore } from "./store/useSpatialStore";
import { useWebSocket } from "./hooks/useWebSocket";
import CentrifugeLoop from "./components/CentrifugeLoop";
import VariablePedestal from "./components/VariablePedestal";
import FunctionGateway from "./components/FunctionGateway";
import FractureFX from "./components/FractureFX";
import TimeScrubBar from "./components/TimeScrubBar";
import ExplainerPanel from "./components/ExplainerPanel";
import LineTracer from "./components/LineTracer";
import FlowPipe from "./components/FlowPipe";
import MetaphorLegend from "./components/MetaphorLegend";
import { usePlayback } from "./hooks/usePlayback";

// Register proximity tooltip for VR
if (typeof window !== "undefined" && window.AFRAME && !window.AFRAME.components["proximity-tooltip"]) {
  window.AFRAME.registerComponent("proximity-tooltip", {
    tick: function () {
      const cam = document.querySelector("a-camera")?.object3D;
      if (!cam) return;
      const dist = this.el.object3D.position.distanceTo(cam.position);
      const textEl = this.el.querySelector(".tooltip-text");
      if (textEl) {
        textEl.setAttribute("opacity", dist < 2.5 ? 1 : 0);
      }
    }
  });
}

// Z-axis linear timeline layout generator
function generateLinearTimeline(nodes, spacing, xOffset) {
  return nodes.map((node, i) => {
    // Start at z=-5, shift deeper for each subsequent node
    const z = -5 - (i * spacing);
    return { ...node, position: `${xOffset} 0 ${z}` };
  });
}

const DEMO_CODE = ``;

export default function App() {
  const [code, setCode]           = useState(DEMO_CODE);
  const [sidebarOpen, setSidebar] = useState(true);
  const [grabbedFn, setGrabbedFn] = useState(null);
  const [camZ, setCamZ]           = useState(0);

  const { sendRun } = useWebSocket();

  const {
    connected, sceneGraph, activeFunction, activeLineno, activeLocals,
    loopIterations, exception, runEnd, setSourceCode, executionLog, currentFrameIdx, runId
  } = useSpatialStore();

  usePlayback(); // Initialize auto-playback engine

  // Dynamic Z-axis linear timeline for arbitrary user code
  const sortedNodes = [...sceneGraph.nodes].sort((a, b) => a.lineno - b.lineno);
  const placedNodes = sortedNodes.map((n, i) => ({ 
    ...n, 
    position: `${n.type === "loop" ? 3 : 0} 0 ${-5 - (i * 4)}` 
  }));
  
  const fnNodes   = placedNodes.filter(n => n.type === "function");
  const loopNodes = placedNodes.filter(n => n.type === "loop");

  // Teleport handler for Click-to-Focus
  const handleVarClick = (varName, index) => {
    const targetZ = -5 - (index * 2) + 3; // Step back 3 units from the pedestal
    setCamZ(targetZ);
  };

  // Auto-trigger VR mode if accessed from Immersive Eidolon CTA
  useEffect(() => {
    if (window.location.search.includes("mode=vr")) {
      const enterVR = () => {
        const scene = document.querySelector("a-scene");
        if (scene) {
          scene.enterVR();
        } else {
          setTimeout(enterVR, 500); // Retry if A-Frame hasn't initialized
        }
      };
      // Give A-Frame a second to load before forcing VR
      setTimeout(enterVR, 1000);
    }
  }, []);

  // Flow arrow logic
  const prevFrame = currentFrameIdx > 0 ? executionLog[currentFrameIdx - 1] : null;
  const currFrame = executionLog[currentFrameIdx];
  
  let arrowStart = null;
  let arrowEnd = null;

  if (prevFrame && currFrame && prevFrame.function !== currFrame.function) {
    const startNode = fnNodes.find(n => n.label === prevFrame.function);
    const endNode = fnNodes.find(n => n.label === currFrame.function);
    if (startNode && endNode) {
      arrowStart = startNode.position;
      arrowEnd = endNode.position;
    }
  }

  return (
    <div className="app-root">
      {/* ── Sidebar: Monaco Editor ─────────────────────────────────── */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <span className="logo">⬡ SpatialCodeTwin</span>
          <button className="sidebar-toggle" onClick={() => setSidebar(!sidebarOpen)}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <div className="conn-status">
          <span className={`conn-dot ${connected ? "live" : "dead"}`} />
          {connected ? "Agent Connected" : "Agent Offline — run backend"}
        </div>

        <Editor
          height="52vh"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={(v) => setCode(v ?? "")}
          options={{ fontSize: 13, minimap: { enabled: false }, lineNumbers: "on", scrollBeyondLastLine: false }}
        />

        <button
          className="run-btn"
          onClick={() => sendRun(code)}
          disabled={!connected}
        >
          ▶ Execute in 3D Space
        </button>

        {runEnd && (
          <div className="run-stats">
            ✓ {runEnd.total_frames} frames · {runEnd.duration_ms}ms
          </div>
        )}

        {exception && (
          <div className="exception-badge">
            💥 {exception.exc_type}: {String(exception.message).slice(0, 60)}
          </div>
        )}
      </aside>

      {/* ── A-Frame 3D Scene ────────────────────────────────────────── */}
      <main className="scene-container">
        <a-scene
          embedded
          vr-mode-ui="enabled:true"
          renderer="antialias:true; colorManagement:true"
          background="color:#050714"
        >
          {/* Ambient environment */}
          <a-sky color="#030303" />
          <a-light type="ambient" color="#111122" intensity="0.5" />
          <a-light type="directional" position="-1 2 1" intensity="0.3" color="#3355ff" />
          
          {/* Isometric Camera with WASD and Look controls */}
          <a-entity
            id="camera-rig"
            position={`8 6 ${camZ + 10}`}
            rotation="-25 45 0"
          >
            <a-camera look-controls="enabled: true" wasd-controls="enabled: true">
               <a-cursor color="#00ffcc" fuse="false" />
            </a-camera>
          </a-entity>

          {/* Black Fade-in Overlay */}
          <a-plane
            position="0 1.6 -1"
            rotation="0 0 0"
            width="10"
            height="10"
            color="#030303"
            material="transparent:true; opacity:1"
            animation="property: material.opacity; from: 1; to: 0; dur: 1500; easing: easeInOutQuad"
            render-order="999"
          />

          {/* Starfield */}
          <a-entity
            particle-system="preset:stars; particleCount:2500; size:0.12; color:#ffffff,#aaccff"
          />

          {/* Camera rig */}
          <a-entity id="camera-rig" position="0 1.6 6">
            <a-camera look-controls wasd-controls>
              <a-cursor color="#00ffcc" fuse="false" />
            </a-camera>
          </a-entity>

          {/* Grid floor */}
          <a-entity
            geometry="primitive:plane; width:60; height:40"
            material="color:#0a0a1a; opacity:0.55; transparent:true; wireframe:true"
            rotation="-90 0 0"
            position="0 -0.5 0"
          />

          <a-entity key={runId}>
            {/* ── Function Gateways ──────────────────────────────────── */}
          {fnNodes.map((node) => (
            <FunctionGateway
              key={node.id}
              fnName={node.label}
              isActive={activeFunction === node.label}
              localVars={activeFunction === node.label ? activeLocals : {}}
              showScope={grabbedFn === node.id}
              onGrab={() => setGrabbedFn(grabbedFn === node.id ? null : node.id)}
              position={node.position}
            />
          ))}

          {/* ── Centrifuge Loops ───────────────────────────────────── */}
          {loopNodes.map((node) => {
            const isExecuting = activeLineno >= node.lineno && activeLineno <= node.end_lineno;
            return (
              <CentrifugeLoop
                key={node.id}
                loopId={node.id}
                iterationCount={loopIterations[node.id] ?? 0}
                isActive={true}
                isExecuting={isExecuting}
                activeLocals={activeLocals}
                position={node.position}
              />
            );
          })}

          {/* ── Flow Pipes (Function Jumps) ────────────────────────── */}
          {arrowStart && arrowEnd && (
            <FlowPipe
              startPos={arrowStart}
              endPos={arrowEnd}
              isActive={true}
            />
          )}

          {/* ── Active locals as VariablePedestals ────────────────────── */}
          {Object.entries(activeLocals).slice(0, 8).map(([k, v], i) => {
            const isChanged = prevFrame && prevFrame.locals && v !== prevFrame.locals[k];
            return (
              <VariablePedestal
                key={k}
                varName={k}
                value={v}
                isActive={isChanged}
                position={`2 1.5 ${-5 - (i * 2)}`}
              />
            );
          })}

          {/* ── Fracture FX on exception ──────────────────────────── */}
          {exception && (
            <FractureFX
              triggered={true}
              excType={exception.exc_type}
              message={exception.message}
              position="0 1.2 -5"
            />
          )}
          </a-entity>
        </a-scene>
      </main>

      {/* ── HUD overlays ─────────────────────────────────────────────── */}
      <div className="camera-hud">
        <button onClick={() => setCamZ(z => z - 2)} title="Move Forward">+</button>
        <button onClick={() => setCamZ(z => z + 2)} title="Move Back">-</button>
      </div>
      <LineTracer onVarClick={handleVarClick} />
      <TimeScrubBar />
      <ExplainerPanel />
      <MetaphorLegend />
    </div>
  );
}
