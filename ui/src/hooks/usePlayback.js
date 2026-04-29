// usePlayback.js — auto-advances currentFrameIdx one frame at a time
// Reads playbackSpeed from the store; pauses when isPlaying = false
import { useEffect, useRef } from "react";
import { useSpatialStore } from "../store/useSpatialStore";

export function usePlayback() {
  const timerRef = useRef(null);

  useEffect(() => {
    function tick() {
      const { isPlaying, playbackSpeed, currentFrameIdx, executionLog, setCurrentFrame } =
        useSpatialStore.getState();

      if (!isPlaying) return;
      if (currentFrameIdx >= executionLog.length - 1) {
        // Reached end — pause automatically
        useSpatialStore.setState({ isPlaying: false });
        return;
      }

      setCurrentFrame(currentFrameIdx + 1);
      timerRef.current = setTimeout(tick, playbackSpeed);
    }

    const { isPlaying, playbackSpeed } = useSpatialStore.getState();
    if (isPlaying) {
      timerRef.current = setTimeout(tick, playbackSpeed);
    }

    // Re-subscribe to isPlaying changes
    const unsub = useSpatialStore.subscribe(
      (state) => state.isPlaying,
      (playing) => {
        clearTimeout(timerRef.current);
        if (playing) timerRef.current = setTimeout(tick, useSpatialStore.getState().playbackSpeed);
      }
    );

    return () => {
      clearTimeout(timerRef.current);
      unsub();
    };
  }, []);
}
