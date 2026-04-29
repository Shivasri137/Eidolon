import React from 'react';
import { Monitor, View } from 'lucide-react';
import { HeroGeometric } from './components/ui/HeroGeometric';
import { GlowCard } from './components/ui/GlowCard';

function App() {
  const handleHybridAccess = () => {
    // Navigate to the existing SpatialCodeTwin standard IDE
    window.location.href = "http://localhost:5173/";
  };

  const handleVRAccess = () => {
    // Navigate to SpatialCodeTwin and trigger WebXR mode
    window.location.href = "http://localhost:5173/?mode=vr";
  };

  return (
    <main className="min-h-screen bg-background text-white font-sans selection:bg-cyan-500/30">
      <HeroGeometric 
        badge="Eidolon Spatial Intelligence"
        title1="Behold the Ghost"
        title2="Inside the Machine"
      />

      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <GlowCard 
            title="2D/3D Hybrid"
            description="Enter the responsive browser IDE. Walk through the logic factory with desktop WASD controls or mobile swipe."
            icon={<Monitor size={32} />}
            glowColor="blue"
            onClick={handleHybridAccess}
          />
          <GlowCard 
            title="Immersive Eidolon"
            description="Trigger full WebXR session for headsets. Physically stand next to data structures in 1:1 scale."
            icon={<View size={32} />}
            glowColor="purple"
            onClick={handleVRAccess}
          />
        </div>
      </section>

      <footer className="text-center text-gray-600 text-sm py-12 pb-24">
        <p>SYSTEM // KINETIC LOGIC FACTORY</p>
        <p className="mt-2 text-xs opacity-50">Developed for SpatialCodeTwin Engine</p>
      </footer>
    </main>
  );
}

export default App;
