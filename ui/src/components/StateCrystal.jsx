import { useEffect, useRef, useState } from "react";

export default function StateCrystal({ varName, value = "", memoryHint = 0, position = "0 0 0", colorHint = null }) {
  const el = useRef(null);
  const [prevVal, setPrevVal] = useState(value);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    if (value !== prevVal) {
      setIsChanging(true);
      setPrevVal(value);
      setTimeout(() => setIsChanging(false), 500); // Pulse duration
      
      if (el.current) {
        el.current.setAttribute("animation__pulse", {
          property: "scale",
          from: "1.3 1.3 1.3",
          to: "1 1 1",
          dur: 400,
          easing: "easeOutElastic"
        });
      }
    }
  }, [value]);

  const maxMem   = 5000;
  const ratio    = Math.min(memoryHint / maxMem, 1);
  const opacity  = +(0.25 + ratio * 0.75).toFixed(3);
  
  // Use colorHint if provided (from parent function), else default cyan
  const baseHue = colorHint ? colorHint : 195;
  const emissive = `hsl(${baseHue},100%,${Math.round(28 + ratio * 38)}%)`;
  const scale    = +(0.22 + ratio * 0.28).toFixed(3);
  const truncVal = String(value).slice(0, 14);

  return (
    <a-entity position={position} class="state-crystal">
      {/* Crystal body */}
      <a-dodecahedron
        ref={el}
        radius={scale}
        color={colorHint ? `hsl(${baseHue},100%,70%)` : "#a0e8ff"}
        material={`opacity:${opacity}; transparent:true; emissive:${emissive}; emissiveIntensity:${+(ratio * 0.9).toFixed(2)}; roughness:0.1; metalness:0.4`}
        animation="property:rotation; to:0 360 0; dur:7000; easing:linear; loop:true"
      />

      {/* Floating changing value effect */}
      {isChanging && (
        <a-text
          value={truncVal}
          color="#ffffff"
          align="center"
          position="0 0.8 0"
          animation="property:position; to:0 1.5 0; dur:600; easing:easeOutQuad"
          animation__fade="property:opacity; to:0; dur:600; easing:easeOutQuad"
        />
      )}

      {/* Point light from within */}
      <a-light type="point" color={emissive} intensity={isChanging ? 1.2 : +(ratio * 0.6).toFixed(2)} distance="2" />

      {/* Label */}
      <a-text
        value={`${varName}\n${truncVal}`}
        align="center"
        color="#ffffff"
        width="1.4"
        position="0 0.5 0"
        wrap-count="12"
      />
    </a-entity>
  );
}
