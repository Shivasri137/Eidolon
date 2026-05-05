import { HeroGeometric } from "@/components/ui/shape-landing-hero"
import { Monitor, View } from 'lucide-react';
import { GlowCard } from './components/ui/GlowCard';

function App() {
    const handleHybridAccess = () => {
        window.location.href = "http://localhost:5173/?view=2d";
    };

    const handleVRAccess = () => {
        window.location.href = "http://localhost:5173/?mode=vr";
    };

    return (
        <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30">
            <HeroGeometric 
                badge="Eidolon"
                title1="Step Inside"
                title2="the Machine." 
            />

            <section className="max-w-5xl mx-auto px-6 py-12 -mt-24 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <GlowCard 
                        title="2D/3D Hybrid"
                        description="Enter the responsive browser IDE. Walk through the logic factory with desktop WASD controls."
                        icon={<Monitor size={32} />}
                        glowColor="blue"
                        onClick={handleHybridAccess}
                    />
                    <GlowCard 
                        title="Immersive Eidolon"
                        description="Trigger full WebXR session for headsets. Physically stand next to data structures."
                        icon={<View size={32} />}
                        glowColor="purple"
                        onClick={handleVRAccess}
                    />
                </div>
            </section>

            <footer className="text-center text-gray-600 text-sm py-12 pb-24">
                <p>SYSTEM // KINETIC LOGIC FACTORY</p>
                <p className="mt-2 text-xs opacity-50 text-indigo-400/50">Designed by shiva sri</p>
            </footer>
        </main>
    );
}

export default App;
