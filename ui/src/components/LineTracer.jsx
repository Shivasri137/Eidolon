// LineTracer.jsx
// Shows the source code with the currently-executing line highlighted.
// Also displays the event type (call/line/return/exception) as a live badge.
import { useSpatialStore } from "../store/useSpatialStore";

const EVENT_CONFIG = {
  call:      { label: "CALL",      color: "#7b5cff", bg: "rgba(123,92,255,0.15)" },
  line:      { label: "LINE",      color: "#00dcff", bg: "rgba(0,220,255,0.12)"  },
  return:    { label: "RETURN",    color: "#00ffb2", bg: "rgba(0,255,178,0.12)"  },
  exception: { label: "EXCEPTION", color: "#ff2255", bg: "rgba(255,34,85,0.15)"  },
};

export default function LineTracer({ onVarClick }) {
  const { sourceCode, executionLog, currentFrameIdx } = useSpatialStore();
  const frame = executionLog[currentFrameIdx] ?? {};

  const activeLine = frame.lineno ?? 0;
  const event      = frame.event ?? "";
  const fn         = frame.function ?? "";
  const locals     = frame.locals ?? {};
  const cfg        = EVENT_CONFIG[event] ?? EVENT_CONFIG.line;

  const lines = (sourceCode ?? "").split("\n");

  return (
    <div className="line-tracer">
      {/* ── Header ──────────────────────────────── */}
      <div className="lt-header">
        <span className="lt-title">EXECUTION TRACE</span>
        {event && (
          <span
            className="lt-badge"
            style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.color }}
          >
            {cfg.label}
          </span>
        )}
        {fn && <span className="lt-fn">⬡ {fn}()</span>}
      </div>

      {/* ── Source lines ─────────────────────────── */}
      <div className="lt-code">
        {lines.map((lineText, idx) => {
          const lineNum = idx + 1;
          const isActive = lineNum === activeLine;
          return (
            <div
              key={idx}
              className={`lt-line ${isActive ? "active" : ""}`}
              style={isActive ? { background: cfg.bg, borderLeftColor: cfg.color } : {}}
            >
              {/* Line number */}
              <span
                className="lt-num"
                style={isActive ? { color: cfg.color } : {}}
              >
                {lineNum}
              </span>

              {/* Active line pulse marker */}
              {isActive && (
                <span className="lt-arrow" style={{ color: cfg.color }}>▶</span>
              )}

              {/* Source text */}
              <span className="lt-src">{lineText}</span>
            </div>
          );
        })}
      </div>

      {/* ── Live locals ──────────────────────────── */}
      {Object.keys(locals).length > 0 && (
        <div className="lt-locals">
          <div className="lt-locals-title">LOCAL SCOPE (Click to teleport)</div>
          <div className="lt-locals-grid">
            {Object.entries(locals).slice(0, 6).map(([k, v], i) => (
              <div 
                key={k} 
                className="lt-local-item clickable" 
                onClick={() => onVarClick && onVarClick(k, i)}
              >
                <span className="lt-local-key">{k}</span>
                <span className="lt-local-val">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
