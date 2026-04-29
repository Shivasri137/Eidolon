// ExecutionArrow.jsx — A glowing laser that shoots between active nodes
import { useEffect, useRef } from "react";

export default function ExecutionArrow({ startPos, endPos, isActive }) {
  const el = useRef(null);

  useEffect(() => {
    if (!isActive || !el.current) return;
    el.current.setAttribute("animation__shoot", {
      property: "scale",
      from: "0 1 0",
      to: "1 1 1",
      dur: 200,
      easing: "easeOutQuad"
    });
    
    // Fade out
    setTimeout(() => {
      if (el.current) {
        el.current.setAttribute("animation__fade", {
          property: "material.opacity",
          from: 0.8,
          to: 0,
          dur: 200,
          easing: "easeInQuad"
        });
      }
    }, 200);

  }, [isActive, startPos, endPos]);

  if (!isActive) return null;

  // Calculate distance and rotation
  const s = startPos.split(" ").map(Number);
  const e = endPos.split(" ").map(Number);
  const dx = e[0] - s[0];
  const dy = e[1] - s[1];
  const dz = e[2] - s[2];
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  
  // Midpoint
  const mx = s[0] + dx / 2;
  const my = s[1] + dy / 2;
  const mz = s[2] + dz / 2;

  // Rotation angles (yaw and pitch)
  const yaw = Math.atan2(dx, dz) * (180 / Math.PI);
  const pitch = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz)) * (180 / Math.PI);

  return (
    <a-entity
      ref={el}
      position={`${mx} ${my} ${mz}`}
      rotation={`${pitch} ${yaw} 0`}
      scale="1 1 1"
    >
      <a-cylinder
        radius="0.02"
        height={distance}
        color="#00ffcc"
        material="shader:flat; opacity:0.8; transparent:true"
        rotation="90 0 0"
      />
      {/* Particle trail effect */}
      <a-entity
        particle-system={`preset:dust; color:#00ffcc; particleCount:50; maxAge:0.4; size:0.05`}
      />
    </a-entity>
  );
}
