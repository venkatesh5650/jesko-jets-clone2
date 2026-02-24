"use client";

import { CinematicViewport } from "@/components/ui/CinematicViewport";
import { interpolateShot } from "@/lib/motion";

export const Globe = ({ progress }: { progress: number }) => {
    // Entrance: 0.85 -> 0.98 (Transition from PlaneMorph)
    const config = interpolateShot(progress, 0.85, 0.98, {
        opacity: [0, 1],
        scale: [1.03, 1]
    });

    return (
        <CinematicViewport zIndex={10}>
            {/* Ambient Glow Background - Aerospace Grade */}
            <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(80,120,255,0.15)_0%,transparent_70%)] pointer-events-none"
                style={{ opacity: config.opacity }}
            />

            <div
                style={{
                    opacity: config.opacity,
                    transform: `scale(${config.scale})`,
                    filter: "brightness(1.15) contrast(1.1)" // Enhanced clarity
                }}
                className="w-full h-full"
            >
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover grayscale opacity-70"
                >
                    <source src="/EarthRotationVideo.mp4" type="video/mp4" />
                </video>
            </div>

            <div
                style={{ opacity: config.opacity }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
            >
                <h2 className="text-4xl md:text-8xl font-black text-white uppercase tracking-tighter italic leading-none mb-4 md:mb-8">
                    GLOBAL <span className="text-neutral-500 font-light">ECHO</span>
                </h2>

                <button className="mt-8 md:mt-16 group relative px-8 md:px-12 py-3 md:py-4 border border-neutral-800 text-white text-[10px] tracking-[0.5em] uppercase overflow-hidden">
                    <span className="relative z-10 group-hover:text-black transition-colors duration-500">Contact Fleet</span>
                    <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                </button>
            </div>

            {/* Cinematic Vignette - Reduced for luxury look */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />
        </CinematicViewport>
    );
};
