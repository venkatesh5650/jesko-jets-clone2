"use client";

import { useRef, useEffect } from "react";
import { CinematicViewport } from "@/components/ui/CinematicViewport";
import { interpolateShot } from "@/lib/motion";

export const Globe = ({ progress }: { progress: number }) => {
    const globeRef = useRef<HTMLDivElement>(null);
    const rotationRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(performance.now());
    const requestRef = useRef<number | undefined>(undefined);

    // V14 HARD RULE: High-Precision Perpetual Motion Engine
    useEffect(() => {
        const animate = (time: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = time;
            const deltaTime = time - lastTimeRef.current;
            lastTimeRef.current = time;

            // Luxury linear speed: 1 degree every 500ms (0.002 deg/ms)
            const speed = 0.002;
            rotationRef.current += deltaTime * speed;

            if (globeRef.current) {
                // Hard Rule 4: GPU Stabilization
                globeRef.current.style.transform = `translate3d(0,0,0) rotateY(${rotationRef.current}deg)`;
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    // V12 Cinematic Handoff Blend (7% window)
    const config = interpolateShot(progress, 0.78, 0.85, {
        opacity: [0, 1],
        scale: [1.2, 1],
        blur: [15, 0]
    });

    return (
        <CinematicViewport zIndex={10}>
            {/* Aerospace Ambient Depth Layers */}
            <div
                className="absolute inset-0 bg-black"
                style={{ opacity: config.opacity }}
            />

            <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0%,transparent_75%)] pointer-events-none"
                style={{
                    opacity: config.opacity,
                    transform: `scale(${1 + (1 - config.opacity) * 0.2})`
                }}
            />

            <style>{`
                @keyframes rhythmic-breathe {
                    0%, 100% { scale: 1; }
                    50% { scale: 1.02; }
                }
                .globe-breathe {
                    animation: rhythmic-breathe 8s ease-in-out infinite;
                }
            `}</style>

            <div
                style={{
                    opacity: config.opacity * 0.8,
                    transform: `scale(${config.scale})`,
                    filter: `brightness(1.2) contrast(1.1) blur(${config.blur}px)`,
                    willChange: 'transform, opacity'
                }}
                className="w-full h-full mix-blend-screen globe-breathe"
            >
                {/* Rule 2: Persistent Render Layer (Direct DOM Update) */}
                <div
                    ref={globeRef}
                    style={{
                        backfaceVisibility: 'hidden',
                        willChange: 'transform'
                    }}
                    className="w-full h-full transform-gpu"
                >
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        className="w-full h-full object-cover grayscale"
                        style={{ filter: "brightness(0.8) contrast(1.2)" }}
                        onLoadedMetadata={(e) => {
                            e.currentTarget.playbackRate = 0.85;
                        }}
                    >
                        <source src="/EarthRotationVideo.mp4" type="video/mp4" />
                    </video>
                </div>
            </div>

            {/* Floating UI Elements / Data Visualization */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ opacity: config.opacity }}
            >
                <div className="absolute top-1/4 left-1/4 w-32 h-px bg-white/10" />
                <div className="absolute bottom-1/3 right-1/4 w-24 h-px bg-white/10" />
            </div>

            <div
                style={{
                    opacity: config.opacity,
                    transform: `translateY(${(1 - config.opacity) * 40}px)`
                }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
            >
                <div className="mb-4 md:mb-6">
                    <span className="text-[10px] tracking-[0.8em] text-cyan-500/50 uppercase font-light">Global reach</span>
                </div>
                <h2 className="text-4xl md:text-8xl font-black text-white uppercase tracking-tighter italic leading-none mb-8 md:mb-12">
                    JESKO <span className="text-neutral-500 font-extralight">NETWORK</span>
                </h2>

                <button className="group relative px-10 md:px-16 py-4 md:py-5 border border-white/10 text-white text-[10px] md:text-[12px] tracking-[0.6em] uppercase overflow-hidden transition-all hover:border-white/30">
                    <span className="relative z-10 group-hover:text-black transition-colors duration-500 font-light">Initialize Contact</span>
                    <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]" />
                </button>
            </div>

            {/* Luxury Vignette and Grain */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.7)_100%)] pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </CinematicViewport>
    );
};
