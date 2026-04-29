// FractureFX.jsx — structural fracture animation triggered on exception
import { useEffect, useRef } from "react";

export default function FractureFX({ triggered = false, excType = "", message = "", position = "0 0 0" }) {
  const el = useRef(null);

  useEffect(() => {
    if (!triggered || !el.current) return;

    // Shake animation
    el.current.setAttribute("animation__shake", {
      property: "position",
      from: position,
      to: `${parseFloat(position.split(" ")[0]) + 0.14} ${position.split(" ")[1]} ${position.split(" ")[2]}`,
      dir: "alternate",
      dur: 70,
      loop: 10,
      easing: "linear",
    });

    // Flash red
    el.current.setAttribute("animation__color", {
      property: "material.color",
      to: "#ff1133",
      dur: 350,
      easing: "easeInQuad",
    });

    // Fade back
    setTimeout(() => {
      if (!el.current) return;
      el.current.setAttribute("animation__recover", {
        property: "material.color",
        to: "#6600aa",
        dur: 1200,
        easing: "easeOutQuad",
      });
    }, 500);
  }, [triggered]);

  return (
    <a-entity ref={el} position={position} class="fracture-fx">
      {/* Base block */}
      <a-box
        width="1.2"
        height="1.2"
        depth="1.2"
        material={`color:#6600aa; opacity:0.78; transparent:true; roughness:0.3; metalness:0.5`}
      />

      {/* Crack overlay lines */}
      {triggered && (
        <>
          <a-box width="0.02" height="1.4" depth="0.02" color="#ff4444"
            material="shader:flat; opacity:0.8"
            position="0.2 0 0.61"
            rotation="0 0 15" />
          <a-box width="0.02" height="1.1" depth="0.02" color="#ff4444"
            material="shader:flat; opacity:0.6"
            position="-0.3 0.1 0.61"
            rotation="0 0 -22" />
        </>
      )}

      {/* Exception label */}
      {triggered && (
        <a-text
          value={`💥 ${excType}\n${message.slice(0, 32)}`}
          align="center"
          color="#ff6688"
          width="2.2"
          position="0 0.85 0"
          wrap-count="20"
        />
      )}

      {/* Particle burst on fracture */}
      {triggered && (
        <a-entity
          particle-system={`preset:dust; color:#ff2244,#ff8800; particleCount:180; maxAge:1.2; size:0.04; velocitySpread:1 1 1`}
        />
      )}
    </a-entity>
  );
}
