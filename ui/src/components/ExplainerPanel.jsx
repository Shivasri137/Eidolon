// ExplainerPanel.jsx — floating AI narration HUD
import { useEffect, useState } from "react";
import { useSpatialStore } from "../store/useSpatialStore";
import { generateNarration } from "../ai/explainerAgent";

export default function ExplainerPanel() {
  const { executionLog, currentFrameIdx, narration, setNarration } = useSpatialStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const frame = executionLog[currentFrameIdx];
    if (!frame) return;

    let cancelled = false;
    setLoading(true);
    generateNarration(frame).then((text) => {
      if (!cancelled) {
        setNarration(text);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [currentFrameIdx]);

  return (
    <div className="explainer-panel">
      <div className="explainer-header">
        <span className="explainer-dot" />
        EXPLAINER AGENT
      </div>
      <p className="explainer-text">
        {loading ? "🔭 Observing telemetry…" : narration || "Awaiting execution data…"}
      </p>
    </div>
  );
}
