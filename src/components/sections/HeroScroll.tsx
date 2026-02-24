"use client";

import { useRef, useEffect } from "react";
import { useImageSequence } from "@/hooks/useImageSequence";
import { CinematicViewport } from "@/components/ui/CinematicViewport";
import { smoothstep, interpolateShot } from "@/lib/motion";

export const HeroScroll = ({ progress }: { progress: number }) => {
    const { canvasRef, isLoaded, renderFrame } = useImageSequence(
        "Sequence1",
        "ezgif-frame-",
        120
    );

    // Range Mapping: 0.0 -> 0.5 is the Hero focus
    // Transition out between 0.4 and 0.5
    const config = interpolateShot(progress, 0.4, 0.5, {
        opacity: [1, 0],
        scale: [1, 1.02],
        blur: [0, 4]
    });

    useEffect(() => {
        if (isLoaded) {
            // Normalize progress 0.0-0.4 for the 120 frames
            const localProgress = Math.max(0, Math.min(1, progress / 0.4));
            renderFrame(localProgress, {
                scale: config.scale,
                blur: config.blur
            });
        }
    }, [isLoaded, renderFrame, progress, config.scale, config.blur]);

    return (
        <CinematicViewport zIndex={10}>
            <canvas
                ref={canvasRef}
                style={{
                    opacity: config.opacity,
                    display: isLoaded ? "block" : "none"
                }}
                className="w-full h-full"
            />

            <div
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                style={{ opacity: config.opacity }}
            >
                <div className="text-center px-6">
                    <h1 className="text-4xl md:text-9xl font-black tracking-tighter text-white uppercase italic leading-none">
                        JESKO <span className="text-neutral-500">JETS</span>
                    </h1>
                    <p className="mt-4 md:mt-6 text-[10px] md:text-sm tracking-[0.5em] text-neutral-400 uppercase font-light">
                        Superiority Above the Clouds
                    </p>
                </div>
            </div>
            {/* Cinematic Vignette - Reduced for clarity */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.25)_100%)] pointer-events-none" />
        </CinematicViewport>
    );
};
