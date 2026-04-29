import { useEffect, useRef } from "react";

export default function CentrifugeLoop({ loopId, iterationCount = 0, isExecuting = false, activeLocals = {}, position = "0 0 0" }) {
  const ringRef = useRef(null);

  // Speed multiplier based on active execution
  const baseSpeed = isExecuting ? 1200 : 8000;

  useEffect(() => {
    if (!ringRef.current) return;
    ringRef.current.setAttribute("animation__spin", {
      property: "rotation",
      to: "0 0 -360",
      dur: baseSpeed,
      loop: true,
      easing: "linear"
    });
  }, [baseSpeed]);

  const emissiveInt = isExecuting ? "2.5" : "1.2";

  // Format locals for tooltip
  const localsStr = Object.entries(activeLocals)
    .slice(0, 4)
    .map(([k, v]) => `${k}: ${String(v).slice(0, 8)}`)
    .join("\n");

  return (
    <a-entity id={`loop-${loopId}`} position={position} class="centrifuge-loop" proximity-tooltip="">
      {/* Outer Glow Base */}
      <a-cylinder radius="2.2" height="0.1" color={isExecuting ? "#ffffff" : "#ffbf00"} material={`emissive:${isExecuting ? "#ffffff" : "#ffbf00"}; emissiveIntensity:0.8; transparent:true; opacity:0.4`} position="0 0 0" />
      
      {/* The Vertical Orbit Ring */}
      <a-entity position="0 2.2 0" rotation="0 0 0">
        <a-torus
          ref={ringRef}
          radius="2"
          radius-tubular="0.08"
          color="#ffbf00"
          material={`emissive:#ffbf00; emissiveIntensity:${emissiveInt}; transparent:true; opacity:0.8; metalness:0.8`}
        >
           {/* Traveling Arc / Item on the orbit */}
           <a-sphere radius="0.15" position="0 2 0" color="#ffffff" material="emissive:#ffffff; emissiveIntensity:2">
             <a-light type="point" color="#ffbf00" intensity="2" distance="4" />
             <a-entity particle-system="preset:dust; color:#ffbf00; particleCount:30; maxAge:0.2; size:0.05" />
           </a-sphere>
        </a-torus>
      </a-entity>

      {/* Iteration Counter (Moved ABOVE the orbit) */}
      <a-entity position="0 4.6 0">
        <a-text
          value={`ITERATION\n${iterationCount}`}
          align="center"
          color="#ffbf00"
          scale="1.5 1.5 1.5"
          material="shader:flat"
        />
      </a-entity>

      {/* Proximity Tooltip showing live variables */}
      <a-text
        class="tooltip-text"
        value={`TREADMILL ORBIT\nExecutions: ${iterationCount}\n\nVARIABLES:\n${localsStr || "None"}`}
        align="center"
        color="#00ffff"
        width="2"
        position="0 2.2 2"
        opacity="0"
        material="shader:flat"
      />
    </a-entity>
  );
}
