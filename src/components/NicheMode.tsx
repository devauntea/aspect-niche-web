"use client";

import { useState } from "react";

interface Props {
  isNiche: boolean;
  onToggle: () => void;
  accentColor: string;
}

export default function NicheMode({ isNiche, onToggle, accentColor }: Props) {
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);

  function handleClick() {
    if (!isNiche) {
      // Burst particles on activate
      const newParticles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 60 - 30,
        y: Math.random() * 40 - 40,
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 700);
    }
    onToggle();
  }

  return (
    <div className="relative">
      {/* Particle burst */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-1 h-1 rounded-full pointer-events-none"
          style={{
            background: accentColor,
            top: "50%",
            left: "50%",
            animation: "none",
            transform: `translate(${p.x}px, ${p.y}px)`,
            opacity: 0,
            transition: "transform 0.6s ease-out, opacity 0.6s ease-out",
          }}
        />
      ))}

      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: isNiche
            ? `linear-gradient(135deg, ${accentColor}, color-mix(in srgb, ${accentColor} 80%, transparent))`
            : `color-mix(in srgb, ${accentColor} 7%, transparent)`,
          color: isNiche ? "white" : accentColor,
          border: `1.5px solid ${isNiche ? accentColor : accentColor + "30"}`,
          boxShadow: isNiche
            ? `0 2px 12px color-mix(in srgb, ${accentColor} 27%, transparent)`
            : "none",
        }}
        title={isNiche ? "Switch to standard view" : "Go deeper — niche mode"}
      >
        <span style={{ fontSize: 11 }}>{isNiche ? "◆" : "◇"}</span>
        {isNiche ? "Niche" : "Go niche"}
      </button>
    </div>
  );
}
