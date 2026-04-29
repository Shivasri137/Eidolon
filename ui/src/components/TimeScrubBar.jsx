// TimeScrubBar.jsx — playback controls + speed + live event badge
import { useSpatialStore } from "../store/useSpatialStore";

const EVENT_COLORS = {
  call:      "#7b5cff",
  line:      "#00dcff",
  return:    "#00ffb2",
  exception: "#ff2255",
};

const SPEEDS = [
  { label: "0.25×", ms: 1200 },
  { label: "0.5×",  ms: 600  },
  { label: "1×",    ms: 300  },
  { label: "2×",    ms: 150  },
  { label: "4×",    ms: 60   },
];

export default function TimeScrubBar() {
  const {
    executionLog, currentFrameIdx, isPlaying, playbackSpeed,
    scrubTo, play, pause, setCurrentFrame, setPlaybackSpeed,
  } = useSpatialStore();

  const total = executionLog.length;
  const frame = executionLog[currentFrameIdx] ?? {};
  const event = frame.event ?? "";
  const eventColor = EVENT_COLORS[event] ?? "#7a8cbb";

  const currentSpeed = SPEEDS.find((s) => s.ms === playbackSpeed) ?? SPEEDS[2];

  const stepBack    = () => { pause(); setCurrentFrame(Math.max(currentFrameIdx - 1, 0)); };
  const stepForward = () => { pause(); setCurrentFrame(Math.min(currentFrameIdx + 1, total - 1)); };
  const restart     = () => { scrubTo(0); };

  return (
    <div className="scrub-bar">
      {/* ── Meta row ──────────────────────────────────────── */}
      <div className="scrub-meta">
        {/* Event badge */}
        <span
          className="scrub-event-badge"
          style={{ color: eventColor, borderColor: eventColor, background: `${eventColor}18` }}
        >
          {event ? `● ${event.toUpperCase()}` : "● IDLE"}
        </span>

        {/* Function name */}
        <span className="scrub-fn">⬡ {frame.function ?? "—"}</span>

        {/* Line number */}
        <span className="scrub-line" style={{ color: eventColor }}>
          L{frame.lineno ?? "—"}
        </span>

        {/* Frame counter */}
        <span className="scrub-count">
          {total === 0 ? "No frames" : `${currentFrameIdx + 1} / ${total}`}
        </span>
      </div>

      {/* ── Slider ────────────────────────────────────────── */}
      <input
        type="range"
        className="scrub-slider"
        min={0}
        max={Math.max(total - 1, 0)}
        value={currentFrameIdx}
        onChange={(e) => scrubTo(Number(e.target.value))}
        style={{
          background: total === 0
            ? "#1a2040"
            : `linear-gradient(90deg, ${eventColor} 0%, #7b5cff ${
                (currentFrameIdx / Math.max(total - 1, 1)) * 100
              }%, #1a2040 ${(currentFrameIdx / Math.max(total - 1, 1)) * 100}%)`,
        }}
      />

      {/* ── Controls row ──────────────────────────────────── */}
      <div className="scrub-controls">
        {/* Restart */}
        <button className="scrub-btn" onClick={restart} title="Restart">⏮</button>

        {/* Step back */}
        <button className="scrub-btn" onClick={stepBack} title="Step back">◀</button>

        {/* Play / Pause */}
        <button
          className={`scrub-btn play-btn ${isPlaying ? "playing" : ""}`}
          onClick={() => (isPlaying ? pause() : play())}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        {/* Step forward */}
        <button className="scrub-btn" onClick={stepForward} title="Step forward">▶</button>

        {/* Speed presets */}
        <div className="speed-group">
          {SPEEDS.map((s) => (
            <button
              key={s.ms}
              className={`speed-btn ${playbackSpeed === s.ms ? "active" : ""}`}
              onClick={() => setPlaybackSpeed(s.ms)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
