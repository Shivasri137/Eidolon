import React from 'react';
import { motion } from 'framer-motion';

interface GlowCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  glowColor: 'blue' | 'purple';
  onClick: () => void;
}

export function GlowCard({ title, description, icon, glowColor, onClick }: GlowCardProps) {
  const glowClass = glowColor === 'blue' 
    ? 'group-hover:shadow-[0_0_40px_rgba(0,255,255,0.3)] border-cyan-500/30 group-hover:border-cyan-400'
    : 'group-hover:shadow-[0_0_40px_rgba(255,0,255,0.3)] border-purple-500/30 group-hover:border-purple-400';

  const iconGlow = glowColor === 'blue' ? 'text-cyan-400' : 'text-purple-400';

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative group cursor-pointer"
      onClick={onClick}
    >
      {/* Background Glow */}
      <div className={`absolute -inset-0.5 rounded-xl blur opacity-0 group-hover:opacity-50 transition duration-500 ${glowColor === 'blue' ? 'bg-cyan-500' : 'bg-purple-500'}`}></div>
      
      {/* Card Content */}
      <div className={`relative flex flex-col items-center justify-center p-8 bg-[#0a0a0a] rounded-xl border transition-all duration-300 ${glowClass} min-h-[200px] text-center space-y-4`}>
        <div className={`p-4 rounded-full bg-black/50 ${iconGlow} shadow-inner`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white tracking-wide">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </motion.div>
  );
}
