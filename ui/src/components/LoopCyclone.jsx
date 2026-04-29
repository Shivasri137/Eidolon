// LoopCyclone.jsx — visualizes For/While loop iterations as a particle cyclone
import { useEffect, useRef, useState } from "react";

const PARTICLE_COUNT = 48;

function polarToXZ(angleDeg, r) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: +(r * Math.cos(rad)).toFixed(3), z: +(r * Math.sin(rad)).toFixed(3) };
}

function initParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    angle: (360 / PARTICLE_COUNT) * i,
    y: +(Math.random() * 0.6 - 0.3).toFixed(3),
    speed: 0.7 + Math.random() * 0.6,
    size: +(0.025 + Math.random() * 0.02).toFixed(4),
    radius: 1.2,
  }));
}

export default function LoopCyclone({ loopId, iterationCount = 0, isActive = false, isExecuting = false, position = "0 0 0" }) {
  const [particles, setParticles] = useState(initParticles);
  const rafRef = useRef(null);
  const lastRef = useRef(performance.now());

  // Hue: cyan (low) → magenta (high iterations)
  const density = Math.min(iterationCount / 500, 1);
  const hue     = Math.round(180 - density * 150);
  const color   = `hsl(${hue},100%,62%)`;
  const targetR = +(1.2 - density * 0.55).toFixed(3);
  
  // Surge multiplier if loop is currently executing
  const speedMult = isExecuting ? 3.0 : 1.0;

  useEffect(() => {
    if (!isActive) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    const tick = (now) => {
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;
      setParticles((ps) =>
        ps.map((p) => ({
          ...p,
          angle:  (p.angle + p.speed * 55 * speedMult * dt) % 360,
          radius: p.radius + (targetR - p.radius) * 0.04,  // smooth lerp
        }))
      );
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isActive, targetR, speedMult]);

  return (
    <a-entity id={`loop-${loopId}`} position={position} class="loop-cyclone">

      {/* Force-field torus ring */}
      <a-torus
        radius="1.2"
        radius-tubular="0.018"
        segments-tubular="80"
        color={color}
        material={`shader:flat; opacity:0.3; transparent:true`}
        animation={isActive
          ? `property:rotation; to:0 360 0; dur:3800; easing:linear; loop:true`
          : ``}
      />

      {/* Inner glow ring */}
      <a-torus
        radius="0.75"
        radius-tubular="0.008"
        segments-tubular="60"
        color={color}
        material={`shader:flat; opacity:0.18; transparent:true`}
        animation={isActive
          ? `property:rotation; to:0 -360 0; dur:5200; easing:linear; loop:true`
          : ``}
      />

      {/* Central axis pillar */}
      <a-cylinder
        radius="0.01"
        height="1.0"
        color={color}
        material={`shader:flat; opacity:0.45; transparent:true`}
      />

      {/* Iteration counter label */}
      <a-text
        value={`LOOP-${loopId}\niter: ${iterationCount}`}
        align="center"
        color="#c8f8ff"
        width="1.8"
        position="0 0.85 0"
        wrap-count="14"
      />

      {/* Particle swarm */}
      {particles.map((p) => {
        const pos = polarToXZ(p.angle, p.radius);
        return (
          <a-sphere
            key={p.id}
            position={`${pos.x} ${p.y} ${pos.z}`}
            radius={p.size}
            color={color}
            material={`shader:flat; opacity:0.9`}
          />
        );
      })}
    </a-entity>
  );
}
