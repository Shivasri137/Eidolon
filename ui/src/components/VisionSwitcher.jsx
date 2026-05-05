import React from "react";
import { useSpatialStore } from "../store/useSpatialStore";
import { LayoutGrid, Box } from "lucide-react";

export default function VisionSwitcher() {
  const { viewMode, setViewMode } = useSpatialStore();

  return (
    <div className="vision-switcher animate-in slide-in-from-top duration-700">
      <button 
        className={`vision-btn ${viewMode === "2D" ? "active" : ""}`}
        onClick={() => setViewMode("2D")}
      >
        <LayoutGrid size={18} />
        <span>2D DASHBOARD</span>
      </button>
      <button 
        className={`vision-btn ${viewMode === "3D" ? "active" : ""}`}
        onClick={() => setViewMode("3D")}
      >
        <Box size={18} />
        <span>3D FACTORY</span>
      </button>
    </div>
  );
}
