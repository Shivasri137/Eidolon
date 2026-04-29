import { useEffect, useRef, useState } from "react";

// Helper to calculate distance
const dist = (a, b) => Math.sqrt((b[0]-a[0])**2 + (b[1]-a[1])**2 + (b[2]-a[2])**2);

export default function FlowPipe({ startPos, endPos, isActive }) {
  const itemRef = useRef(null);
  const [phase, setPhase] = useState(0); // 0: start->elbow, 1: elbow->end

  const s = startPos.split(" ").map(Number);
  const e = endPos.split(" ").map(Number);
  
  // Create an elbow at (endX, startY, endZ)
  const elbow = [e[0], s[1], e[2]];

  const d1 = dist(s, elbow);
  const d2 = dist(elbow, e);
  const totalD = d1 + d2;
  
  // Durations based on distance to maintain constant speed (e.g., 2 units per sec)
  const speed = 3;
  const dur1 = (d1 / speed) * 1000 || 10; // avoid 0
  const dur2 = (d2 / speed) * 1000 || 10;

  useEffect(() => {
    if (!isActive || !itemRef.current) return;
    
    setPhase(0);
    // Animate Phase 1 (Start -> Elbow)
    itemRef.current.setAttribute("animation__move1", {
      property: "position",
      from: startPos,
      to: elbow.join(" "),
      dur: dur1,
      easing: "linear"
    });

    // Animate Phase 2 (Elbow -> End)
    const t = setTimeout(() => {
      setPhase(1);
      if (itemRef.current) {
        itemRef.current.setAttribute("animation__move2", {
          property: "position",
          from: elbow.join(" "),
          to: endPos,
          dur: dur2,
          easing: "linear"
        });
        
        // Fade out at the end
        setTimeout(() => {
           if (itemRef.current) {
               itemRef.current.setAttribute("animation__fade", {
                   property: "material.opacity",
                   to: "0",
                   dur: 200
               });
           }
        }, dur2 - 200);
      }
    }, dur1);

    return () => clearTimeout(t);
  }, [isActive, startPos, endPos]);

  if (!isActive) return null;

  // Render Cylinders for Pipe 1 (Horizontal) and Pipe 2 (Vertical)
  // Pipe 1: Start to Elbow
  const p1Mid = [s[0] + (elbow[0]-s[0])/2, s[1], s[2] + (elbow[2]-s[2])/2];
  const yaw1 = Math.atan2(elbow[0]-s[0], elbow[2]-s[2]) * (180/Math.PI);
  
  // Pipe 2: Elbow to End
  const p2Mid = [elbow[0], elbow[1] + (e[1]-elbow[1])/2, elbow[2]];

  return (
    <a-entity class="flow-pipe">
      {/* Pipe 1 (Start to Elbow) */}
      {d1 > 0.1 && (
        <a-cylinder
          position={p1Mid.join(" ")}
          rotation={`90 ${yaw1} 0`}
          radius="0.08"
          height={d1}
          color="#00ffff"
          material="opacity:0.2; transparent:true; depthWrite:false"
        />
      )}

      {/* Pipe 2 (Elbow to End) */}
      {d2 > 0.1 && (
        <a-cylinder
          position={p2Mid.join(" ")}
          rotation="0 0 0"
          radius="0.08"
          height={d2}
          color="#00ffff"
          material="opacity:0.2; transparent:true; depthWrite:false"
        />
      )}

      {/* Elbow Joint (Sphere) */}
      {d1 > 0.1 && d2 > 0.1 && (
        <a-sphere position={elbow.join(" ")} radius="0.09" color="#00ffff" material="opacity:0.3; transparent:true" />
      )}

      {/* Traveling Item (The Journey) */}
      <a-sphere ref={itemRef} position={startPos} radius="0.06" color="#ffffff" material="emissive:#ffffff; emissiveIntensity:1; opacity:1">
         <a-light type="point" color="#00ffff" intensity="1.5" distance="4" />
      </a-sphere>
    </a-entity>
  );
}
