"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useImageSequence } from "@/hooks/useImageSequence";
import { CinematicViewport } from "@/components/ui/CinematicViewport";
import { interpolateShot, luxuryEase } from "@/lib/motion";

interface PlaneMorphProps {
    progress: number;
    sequence: ReturnType<typeof useImageSequence>;
}

export const PlaneMorph = ({ progress, sequence }: PlaneMorphProps) => {
    const { isLoaded, drawFrame } = sequence;

    const canvas1Ref = useRef<HTMLCanvasElement>(null);
    const canvas2Ref = useRef<HTMLCanvasElement>(null);
    const canvas3Ref = useRef<HTMLCanvasElement>(null);

    /**
     * STRICT MORPH EVOLUTION (0.30 - 1.00)
     */

    // Phase Calculations
    const tLanding = Math.max(0, Math.min(1, (progress - 0.30) / 0.10)); // Landing approach (0.3-0.4)
    const tLayer1 = Math.max(0, Math.min(1, (progress - 0.30) / 0.20));  // Colored: 0.30 - 0.50
    const tLayer2 = Math.max(0, Math.min(1, (progress - 0.60) / 0.15));  // Blueprint: 0.60 - 0.75
    const tLayer3 = Math.max(0, Math.min(1, (progress - 0.70) / 0.15));  // Labels: 0.70 - 0.85

    // Optical Landing logic (Approved)
    const landingScale = 1.02 - (tLanding * 0.06); // 1.02 -> 0.96 (Scaled down)
    const landingBlur = 2 - (tLanding * 2);        // 2px -> 0px

    // Transformation & Style Logic

    // Memoized Layer Styles (Prevents Effect triggers on every frame)
    const layer1 = useMemo(() => {
        const opacity = 1 - (tLayer1 * 0.3);
        const saturation = 1 - (tLayer1 * 0.6);
        const contrast = 1 - (tLayer1 * 0.15);

        const inExit = progress > 0.82;
        const exitProgress = inExit ? Math.min(1, (progress - 0.82) / 0.08) : 0;
        const sectionFade = 1 - exitProgress;
        const exitBlur = exitProgress * 6;
        const exitScale = 1 - (exitProgress * 0.04);

        return {
            opacity: opacity * sectionFade,
            scale: landingScale * exitScale,
            filter: `brightness(1.18) contrast(1.05) saturate(1.08) saturate(${saturation}) contrast(${contrast}) blur(${landingBlur + exitBlur}px)`
        };
    }, [progress, tLayer1, landingScale, landingBlur]);

    const layer2 = useMemo(() => {
        let opacity = tLayer2;
        const brightness = 0.9 + (tLayer2 * 0.2);
        const morphScaleBase = 1.04 - (tLayer2 * 0.04);

        if (progress >= 0.75 && progress <= 0.92) {
            opacity = 1;
        }

        const inExit = progress > 0.82;
        const exitProgress = inExit ? Math.min(1, (progress - 0.82) / 0.08) : 0;
        const sectionFade = 1 - exitProgress;
        const exitBlur = exitProgress * 6;
        const exitScale = 1 - (exitProgress * 0.04);

        const tHold = Math.max(0, Math.min(1, (progress - 0.75) / 0.17));
        const breathingScale = progress >= 0.75 && progress <= 0.92
            ? 1 + (Math.sin(tHold * Math.PI) * 0.01)
            : 1;

        return {
            opacity: opacity * sectionFade,
            scale: landingScale * morphScaleBase * breathingScale * exitScale,
            filter: `brightness(${brightness}) blur(${exitBlur}px)`
        };
    }, [progress, tLayer2, landingScale]);

    const layer3 = useMemo(() => {
        let opacity = tLayer3;
        const labelScaleBase = 1.02 - (tLayer3 * 0.02);

        if (progress >= 0.85 && progress <= 0.92) {
            opacity = 1;
        }

        const inExit = progress > 0.82;
        const exitProgress = inExit ? Math.min(1, (progress - 0.82) / 0.08) : 0;
        const sectionFade = 1 - exitProgress;
        const exitScale = 1 - (exitProgress * 0.04);

        return {
            opacity: opacity * sectionFade,
            scale: landingScale * labelScaleBase * exitScale
        };
    }, [progress, tLayer3, landingScale]);

    const [verticalOffset, setVerticalOffset] = useState("24px");

    // EFFECT A: Resize Logic Only (Low frequency)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setVerticalOffset("10px");
            } else {
                setVerticalOffset("24px");
            }

            [canvas1Ref, canvas2Ref, canvas3Ref].forEach(ref => {
                if (ref.current) {
                    ref.current.width = window.innerWidth;
                    ref.current.height = window.innerHeight;
                }
            });
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []); // Only on mount/unmount

    // EFFECT B: Animation Drawing Loop (High frequency)
    useEffect(() => {
        if (!isLoaded) return;

        const render = () => {
            const poseProgress = Math.min(1, Math.max(0, (progress - 0.3) / 0.65));
            const normalizedLocal = poseProgress * (39 / 119);

            if (canvas1Ref.current) {
                drawFrame(canvas1Ref.current, normalizedLocal, { scale: layer1.scale });
            }
            if (canvas2Ref.current) {
                drawFrame(canvas2Ref.current, normalizedLocal + (40 / 119), { scale: layer2.scale });
            }
            if (canvas3Ref.current) {
                drawFrame(canvas3Ref.current, normalizedLocal + (80 / 119), { scale: layer3.scale });
            }
        };

        render();
    }, [isLoaded, progress, drawFrame, layer1.scale, layer2.scale, layer3.scale]);

    return (
        <CinematicViewport zIndex={9}>
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">

                {/* STACKED MORPH SYSTEM (No unmounting) */}

                {/* Layer 1: Colored base (Persistent) */}
                <div
                    style={{
                        opacity: layer1.opacity,
                        filter: layer1.filter,
                        transform: `translate(-50%, calc(-50% + ${verticalOffset}))`,
                        top: '50%',
                        left: '50%',
                        zIndex: 1
                    }}
                    className="absolute w-full h-full flex items-center justify-center pointer-events-none"
                >
                    <canvas ref={canvas1Ref} className="w-full h-full object-contain" />
                </div>

                {/* Layer 2: Blueprint lines */}
                <div
                    style={{
                        opacity: layer2.opacity,
                        filter: layer2.filter,
                        transform: `translate(-50%, calc(-50% + ${verticalOffset}))`,
                        top: '50%',
                        left: '50%',
                        zIndex: 2
                    }}
                    className="absolute w-full h-full flex items-center justify-center pointer-events-none"
                >
                    <canvas ref={canvas2Ref} className="w-full h-full object-contain" />
                </div>

                {/* Layer 3: Engineering Labels */}
                <div
                    style={{
                        opacity: layer3.opacity,
                        transform: `translate(-50%, calc(-50% + ${verticalOffset}))`,
                        top: '50%',
                        left: '50%',
                        zIndex: 3
                    }}
                    className="absolute w-full h-full flex items-center justify-center pointer-events-none"
                >
                    <canvas ref={canvas3Ref} className="w-full h-full object-contain" />
                </div>
            </div>

            {/* Cinematic Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.35)_100%)] pointer-events-none z-20" />
        </CinematicViewport>
    );
};
