import { useRef, useMemo } from "react";
import VariablePedestal from "./VariablePedestal";

// Hash string to hue (0-360)
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

export default function FunctionGateway({
  fnName,
  isActive = false,
  isReturning = false,
  localVars = {},
  showScope = false,
  position = "0 0 0",
  onGrab,
}) {
  const el = useRef(null);
  
  // Generate distinct base hue for this function
  const baseHue = useMemo(() => hashString(fnName), [fnName]);

  const state = isReturning ? "returning" : isActive ? "active" : "idle";
  
  // Generate colors based on state and baseHue
  const idleColor = `hsl(${baseHue}, 50%, 25%)`;
  const activeColor = `hsl(${baseHue}, 100%, 60%)`;
  const returningColor = `hsl(${(baseHue + 120) % 360}, 100%, 50%)`; // Complementary/Triadic

  const color = state === "returning" ? returningColor : state === "active" ? activeColor : idleColor;

  const localEntries = Object.entries(localVars).slice(0, 6);

  return (
    <a-entity position={position} class="function-gateway" ref={el}>
      {/* Gateway body */}
      <a-box
        width="1.4"
        height="0.8"
        depth="0.5"
        color={color}
        material={`opacity:0.85; transparent:true; roughness:0.2; metalness:0.6; emissive:${color}; emissiveIntensity:0.3`}
        animation={isActive
          ? `property:scale; to:1.05 1.05 1.05; dir:alternate; dur:600; loop:true; easing:easeInOutSine`
          : `property:scale; to:1 1 1; dur:300`}
        events__click={{ handler: onGrab }}
      />

      {/* Top edge glow bar */}
      <a-box
        width="1.4"
        height="0.04"
        depth="0.04"
        color={isActive ? "#ffffff" : color}
        material={`shader:flat; opacity:0.9`}
        position="0 0.42 0"
      />

      {/* Function name label */}
      <a-text
        value={`⬡ ${fnName}`}
        align="center"
        color="#ffffff"
        width="2"
        position="0 0.02 0.26"
        wrap-count="18"
      />

      {/* Status chip */}
      <a-text
        value={state.toUpperCase()}
        align="center"
        color={color}
        width="1.2"
        position="0 -0.32 0.26"
      />

      {/* Local scope variable pedestals (expanded on grab) */}
      {showScope && localEntries.map(([key, val], i) => (
        <VariablePedestal
          key={key}
          varName={key}
          value={val}
          position={`${-1.2 + i * 0.8} 1.1 0`}
        />
      ))}
    </a-entity>
  );
}
