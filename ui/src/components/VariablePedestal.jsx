import { useEffect, useRef, useState } from "react";

export default function VariablePedestal({ varName, value = "", isActive = false, position = "0 0 0" }) {
  const oldValRef = useRef(null);
  const newValRef = useRef(null);
  const [prevVal, setPrevVal] = useState(value);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    if (value !== prevVal) {
      setIsChanging(true);
      setPrevVal(value);
      
      // Trigger shatter on old value
      if (oldValRef.current) {
        oldValRef.current.setAttribute("animation__shatter", {
          property: "scale",
          to: "0 0 0",
          dur: 200,
          easing: "easeInQuad"
        });
      }
      
      // Trigger drop-in on new value
      if (newValRef.current) {
        newValRef.current.setAttribute("animation__drop", {
          property: "position",
          from: "0 2 0",
          to: "0 0.8 0",
          dur: 400,
          easing: "easeOutElastic"
        });
      }

      setTimeout(() => setIsChanging(false), 250);
    }
  }, [value]);

  const truncVal = String(value).slice(0, 14);

  return (
    <a-entity position={position} class="variable-pedestal" proximity-tooltip="">
      {/* Active Glow Outline */}
      {isActive && (
        <a-cylinder
          radius="0.45"
          height="0.02"
          position="0 0.05 0"
          color="#ffffff"
          material="emissive:#ffffff; emissiveIntensity:1.5"
          animation="property:scale; to:1.2 1 1.2; dir:alternate; dur:500; loop:true"
        />
      )}

      {/* The Anchor Pedestal */}
      <a-cylinder
        radius="0.4"
        height="0.2"
        position="0 0.1 0"
        color="#ff00ff"
        material="opacity:0.8; transparent:true; emissive:#ff00ff; emissiveIntensity:1.2; metalness:0.8; roughness:0.2"
      />
      <a-cylinder
        radius="0.3"
        height="0.05"
        position="0 0.22 0"
        color="#ffffff"
        material="emissive:#ffffff; emissiveIntensity:2"
      />

      {/* Label on Pedestal */}
      <a-text
        value={varName}
        align="center"
        color="#ffffff"
        width="2"
        position="0 0.1 0.42"
      />

      {/* Proximity Tooltip (Fades in when near) */}
      <a-text
        class="tooltip-text"
        value={`CONTAINER: ${varName}\nITEM: ${truncVal}`}
        align="center"
        color="#00ffff"
        width="1.5"
        position="0 1.5 0"
        opacity="0"
        material="shader:flat"
      />

      {/* Volumetric Digits (Layered Text for 3D Neon Glass effect) */}
      <a-entity ref={newValRef} position="0 0.8 0">
        <a-text value={truncVal} align="center" color="#ffffff" scale="1.5 1.5 1.5" position="0 0 0" />
        <a-text value={truncVal} align="center" color="#ff00ff" scale="1.5 1.5 1.5" position="0.01 -0.01 -0.05" opacity="0.6" />
        <a-text value={truncVal} align="center" color="#ff00ff" scale="1.5 1.5 1.5" position="-0.01 0.01 -0.1" opacity="0.3" />
        
        {/* Neon Glow Light */}
        <a-light type="point" color={isActive ? "#ffffff" : "#ff00ff"} intensity={isActive ? "2" : "1"} distance="2.5" position="0 0 0" />
      </a-entity>

      {/* Old Value Shattering */}
      {isChanging && (
        <a-entity ref={oldValRef} position="0 0.8 0">
           <a-text value={String(prevVal).slice(0,14)} align="center" color="#ff00ff" scale="1.5 1.5 1.5" opacity="0.5"/>
        </a-entity>
      )}
    </a-entity>
  );
}
