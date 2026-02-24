"use client";

import React from "react";

interface HudOverlayProps {
    progress: number;
}

export const HudOverlay = ({ progress }: HudOverlayProps) => {
    // Simple data simulation based on progress
    const altitude = Math.floor(32000 - (progress * 5000)).toLocaleString();
    const morphPercent = Math.floor(Math.min(100, Math.max(0, (progress - 0.4) / 0.3 * 100)));

    const getMode = () => {
        if (progress < 0.4) return "CRUISE";
        if (progress < 0.7) return "BLUEPRINT_ANALYSIS";
        return "GLOBAL_SYNC";
    };

    return (
        <div className="fixed right-6 md:right-12 bottom-8 md:bottom-12 z-[950] pointer-events-none font-mono text-[8px] md:text-[10px] tracking-widest text-white/40 leading-relaxed uppercase">
            <div className="flex flex-col items-end gap-0.5 md:gap-1">
                <div className="flex gap-4">
                    <span className="text-white/20">ALTITUDE:</span>
                    <span className="text-white/80">{altitude} FT</span>
                </div>
                <div className="flex gap-4">
                    <span className="text-white/20">VECTOR:</span>
                    <span className="text-white/80">STABLE</span>
                </div>
                <div className="flex gap-4">
                    <span className="text-white/20">MORPH:</span>
                    <span className="text-white/80">{morphPercent}%</span>
                </div>
                <div className="flex gap-4">
                    <span className="text-white/20">MODE:</span>
                    <span className="text-cyan-400/60">{getMode()}</span>
                </div>
            </div>

            {/* Decorative HUD Corner */}
            <div className="mt-4 md:mt-6 w-16 md:w-24 h-[1px] bg-white/10 self-end relative">
                <div className="absolute right-0 top-0 w-1 h-1 bg-white/40" />
            </div>
        </div>
    );
};
