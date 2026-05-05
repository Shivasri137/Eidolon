import React from "react";
import { useSpatialStore } from "../store/useSpatialStore";
import { Terminal, Box, Repeat, Activity } from "lucide-react";

export default function TelemetryDashboard() {
  const { executionLog, currentFrameIdx, sceneGraph } = useSpatialStore();
  const currentFrame = executionLog[currentFrameIdx] || {};
  const locals = currentFrame.locals || {};
  const lastSteps = executionLog.slice(Math.max(0, currentFrameIdx - 9), currentFrameIdx + 1).reverse();

  // Find active loops in the current frame or from scene graph
  const loopNodes = sceneGraph.nodes.filter(n => n.type === "loop");

  return (
    <div className="telemetry-dashboard animate-in fade-in duration-500">
      {/* ── Dashboard Grid ────────────────────────────────────────────── */}
      <div className="dashboard-grid">
        
        {/* 1. Variables Grid (Magenta) */}
        <div className="dashboard-card var-card">
          <div className="card-header">
            <Box size={18} className="text-magenta" />
            <span>LOCAL SCOPE</span>
          </div>
          <div className="card-content scrollbar-custom">
            <table className="telemetry-table">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>VALUE</th>
                  <th>TYPE</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(locals).map(([name, val]) => (
                  <tr key={name} className="animate-in slide-in-from-left duration-300">
                    <td className="font-mono text-magenta">{name}</td>
                    <td className="font-mono text-white">{String(val)}</td>
                    <td className="text-xs text-gray-500">{typeof val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Loops Grid (Amber) */}
        <div className="dashboard-card loop-card">
          <div className="card-header">
            <Repeat size={18} className="text-amber" />
            <span>CENTRIFUGE LOOPS</span>
          </div>
          <div className="card-content scrollbar-custom">
            <div className="loop-stats-list">
              {loopNodes.map((node) => (
                <div key={node.id} className="loop-stat-item border-l-2 border-amber pl-3 mb-4">
                  <div className="text-xs text-gray-400">LOOP @ LINE {node.lineno}</div>
                  <div className="text-xl font-bold text-amber">
                    ITERATION: {node.label === currentFrame.function ? "ACTIVE" : "IDLE"}
                  </div>
                  <div className="w-full bg-amber/10 h-1 mt-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber h-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (currentFrameIdx / executionLog.length) * 100)}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Execution Trace (Cyan) - Spans Full Width at bottom */}
        <div className="dashboard-card trace-card">
          <div className="card-header">
            <Activity size={18} className="text-cyan" />
            <span>EXECUTION TRACE HISTORY</span>
          </div>
          <div className="card-content scrollbar-custom">
            <div className="trace-list">
              {lastSteps.map((step, i) => (
                <div 
                  key={i} 
                  className={`trace-item ${i === 0 ? "active-trace" : "opacity-50"} flex items-center gap-4 py-2 border-b border-white/5`}
                >
                  <div className="text-xs font-mono text-cyan">FRAME {currentFrameIdx - i}</div>
                  <div className="text-sm">
                    <span className="text-gray-400">Line {step.line}: </span>
                    <span className="font-mono">{step.code_snippet?.trim()}</span>
                  </div>
                  {i === 0 && <div className="ml-auto text-xs px-2 py-0.5 bg-cyan/20 text-cyan rounded">CURRENT</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
