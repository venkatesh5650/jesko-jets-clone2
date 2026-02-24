"use client";

import React from "react";

interface HeadingOverlayProps {
    progress: number;
}

export const HeadingOverlay = ({ progress }: HeadingOverlayProps) => {
    const getActiveTitle = () => {
        if (progress < 0.3) return "ADVANCED AERIAL DYNAMICS";
        if (progress < 0.55) return "FROM MATERIAL TO ENGINEERING";
        if (progress < 0.75) return "PRECISION IN EVERY COMPONENT";
        return "GLOBAL FLIGHT INTELLIGENCE";
    };

    const title = getActiveTitle();

    // Simple transition logic for opacity/transform
    // In a more complex setup, we'd use Framer Motion, but for raw performance:
    return (
        <div className="fixed left-6 md:left-12 bottom-24 md:bottom-20 z-[900] pointer-events-none pr-6">
            <div
                key={title}
                className="animate-title-in"
            >
                <span className="block text-[8px] md:text-[10px] tracking-[0.5em] text-neutral-500 uppercase mb-2 md:mb-4 opacity-50">
          // CURRENT_SECTOR
                </span>
                <h1 className="text-lg md:text-3xl font-extralight tracking-[0.2em] text-white/90 uppercase leading-tight max-w-[280px] md:max-w-none">
                    {title.split(" ").map((word, i) => (
                        <span key={i} className="inline-block mr-4">{word}</span>
                    ))}
                </h1>
            </div>

            <style jsx>{`
        .animate-title-in {
          animation: titleFadeIn 0.8s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
        @keyframes titleFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};
