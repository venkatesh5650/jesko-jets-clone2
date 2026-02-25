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
    const canvasSplitRightRef = useRef<HTMLCanvasElement>(null);
    const canvas2Ref = useRef<HTMLCanvasElement>(null);

    const [verticalOffset, setVerticalOffset] = useState("24px");
    const [motionMultiplier, setMotionMultiplier] = useState(1);

    // V11 ZERO-BLACK & SLOW SPLIT NARRATIVE (0.00 - 0.82)
    const totalFrames = 120;
    const timelineLimit = 0.82;

    const masterFrameIndex = Math.min(
        totalFrames - 1,
        Math.max(0, Math.floor((progress / timelineLimit) * (totalFrames - 1)))
    );

    // Hard Rule: Cinematic Handoff -> Landed Stability -> Slow Mechanical Split
    const scene1 = useMemo(() => {
        // V15 Handoff Entry [0.15 - 0.28]
        // PlaneMorph materializes as Hero fades out.
        const entryWindow = [0.15, 0.28];
        const entryShot = interpolateShot(progress, entryWindow[0], entryWindow[1], {
            opacity: [0, 1],
            scale: [1 + (0.05 * motionMultiplier), 1], // Responsive camera pull-in
            blur: [15, 0]
        });

        // Phase 1: Landed Presence [0.28 - 0.45]
        const isFrozen = progress < 0.45;
        const splitStartProgress = 0.45;
        const isParting = progress > splitStartProgress;

        // Phase 2: Slow, deliberate mechanical separation
        const splitProgress = isParting
            ? Math.max(0, Math.min(1, (progress - splitStartProgress) / 0.25))
            : 0;

        // Zero-Black Safety Buffer: Scene 1 exit delayed until Scene 2 is solid
        const exit = Math.max(0, Math.min(1, (progress - 0.68) / 0.10));

        return {
            active: progress < 0.78 && progress >= entryWindow[0],
            frozen: isFrozen,
            opacity: entryShot.opacity * (1 - exit),
            scale: entryShot.scale,
            blur: entryShot.blur,
            splitProgress: luxuryEase(splitProgress) * motionMultiplier,
            frame: masterFrameIndex
        };
    }, [progress, masterFrameIndex, motionMultiplier]);

    const scene2 = useMemo(() => {
        // Phase 3: High-Luxury Interior Reveal
        // Entry reaches 1.0 at 0.62 to create the Safety Buffer [0.62 - 0.68]
        const entry = Math.max(0, Math.min(1, (progress - 0.55) / 0.07));

        // V12 Cinematic Handoff [0.78 - 0.85]
        const fadeOut = Math.max(0, Math.min(1, (progress - 0.78) / 0.07));

        // Rule: Camera Pull-Out Effect (Scale 1.0 -> 1.15)
        const pullOutScale = 1.0 + (fadeOut * 0.15);

        return {
            active: progress >= 0.55 && progress <= 0.90,
            opacity: entry * (1 - fadeOut),
            scale: pullOutScale,
            frame: masterFrameIndex
        };
    }, [progress, masterFrameIndex]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setVerticalOffset("10px");
                setMotionMultiplier(0.5);
            } else {
                setVerticalOffset("24px");
                setMotionMultiplier(1);
            }

            // V17: We no longer set fixed canvas dimensions in handleResize.
            // Dimensions are now locked to image.naturalWidth/Height in the render loop.
            [canvas1Ref, canvasSplitRightRef, canvas2Ref].forEach(ref => {
                if (ref.current) {
                    ref.current.style.width = "100%";
                    ref.current.style.height = "100%";
                    ref.current.style.objectFit = "cover"; // V18: Smart Hybrid Framing
                }
            });
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // V6 PRINCIPAL CINEMATIC RENDER
    useEffect(() => {
        if (!isLoaded) return;

        // Layer 1 Handling (Split Aircraft - Phase 1 & 2)
        if (scene1.active && canvas1Ref.current && canvasSplitRightRef.current) {
            const img = sequence.images[scene1.frame];
            if (img && img.complete) {
                const drawToCanvas = (canvas: HTMLCanvasElement) => {
                    const dpr = window.devicePixelRatio || 1;
                    const { naturalWidth, naturalHeight } = img;

                    // V17 HARD CLARITY LOCK: Matching canvas dimensions to raw 8K source
                    if (canvas.width !== naturalWidth * dpr || canvas.height !== naturalHeight * dpr) {
                        canvas.width = naturalWidth * dpr;
                        canvas.height = naturalHeight * dpr;
                        const ctx = canvas.getContext('2d');
                        if (ctx) ctx.scale(dpr, dpr);
                    }

                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, naturalWidth, naturalHeight);
                        // Rule 3: 1:1 Drawing at native resolution
                        ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);
                    }
                };

                drawToCanvas(canvas1Ref.current);

                // Mirror to right half with identical precision
                const ctxR = canvasSplitRightRef.current.getContext('2d');
                if (ctxR) {
                    const { naturalWidth, naturalHeight } = img;
                    const dpr = window.devicePixelRatio || 1;
                    if (canvasSplitRightRef.current.width !== naturalWidth * dpr) {
                        canvasSplitRightRef.current.width = naturalWidth * dpr;
                        canvasSplitRightRef.current.height = naturalHeight * dpr;
                        ctxR.scale(dpr, dpr);
                    }
                    ctxR.clearRect(0, 0, naturalWidth, naturalHeight);
                    ctxR.drawImage(canvas1Ref.current, 0, 0, naturalWidth * dpr, naturalHeight * dpr, 0, 0, naturalWidth, naturalHeight);
                }
            }
        }

        // Layer 2 Handling (High-Clarity Interior - Phase 3)
        // Rule 4: Split Lock Condition ensured by scene2.active starting at progress 0.52
        if (scene2.active && canvas2Ref.current && sequence.images.length > 0) {
            const img = sequence.images[scene2.frame];

            if (img && img.complete) {
                const ctx = canvas2Ref.current.getContext('2d');
                const dpr = window.devicePixelRatio || 1;
                const { naturalWidth, naturalHeight } = img;

                // V17: Interior Clarity Lock
                if (canvas2Ref.current.width !== naturalWidth * dpr || canvas2Ref.current.height !== naturalHeight * dpr) {
                    canvas2Ref.current.width = naturalWidth * dpr;
                    canvas2Ref.current.height = naturalHeight * dpr;
                    if (ctx) ctx.scale(dpr, dpr);
                }

                if (ctx) {
                    ctx.clearRect(0, 0, naturalWidth, naturalHeight);
                    ctx.globalAlpha = scene2.opacity;
                    ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);
                }
            }
        }
    }, [isLoaded, progress, scene1, scene2, sequence.images]);

    return (
        <CinematicViewport zIndex={9}>
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">

                {/* Scene 1: Main Split Sequence (V15 Handoff Entry) */}
                {scene1.active && (
                    <div
                        style={{
                            opacity: scene1.opacity,
                            // V18: Over-scan scale (1.05) + Camera depth stabilization
                            transform: `translate3d(0, 0, ${(scene1.scale - 1) * 200}px) scale(1.05)`,
                            filter: `blur(${scene1.blur}px)`,
                            willChange: 'transform, opacity'
                        }}
                        className="absolute inset-0 flex items-center justify-center transform-gpu [perspective:1000px]"
                    >
                        <div
                            className="relative w-full h-full flex items-center justify-center"
                            style={{ transform: `translateY(${verticalOffset})` }}
                        >
                            {/* Split Logic Rendering */}
                            <div
                                style={{
                                    transform: `translate3d(-${scene1.splitProgress * 25}%, 0, 0)`,
                                    opacity: 1,
                                    width: '50%',
                                    height: '100%',
                                    position: 'absolute',
                                    left: 0,
                                    overflow: 'hidden'
                                }}
                            >
                                <canvas ref={canvas1Ref} className="absolute left-0 w-[200%] h-full object-cover" />
                            </div>

                            <div
                                style={{
                                    transform: `translate3d(${scene1.splitProgress * 25}%, 0, 0)`,
                                    opacity: 1,
                                    width: '50%',
                                    height: '100%',
                                    position: 'absolute',
                                    right: 0,
                                    overflow: 'hidden'
                                }}
                            >
                                <canvas ref={canvasSplitRightRef} className="absolute right-0 w-[200%] h-full object-cover" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Layer 2: Interior Reveal (Zero-Stacking Handoff) */}
                {scene2.active && (
                    <div
                        style={{
                            opacity: scene2.opacity,
                            // V18: Over-scan scale (1.05) + Pull-out stabilization
                            transform: `translate3d(-50%, calc(-50% + ${verticalOffset}), ${(scene2.scale - 1) * 200}px) scale(1.05)`,
                            willChange: 'transform, opacity',
                            top: '50%',
                            left: '50%',
                            zIndex: 5,
                        }}
                        className="absolute w-full h-full pointer-events-none transform-gpu [perspective:1000px]"
                    >
                        <canvas ref={canvas2Ref} className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Cinematic Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.35)_100%)] pointer-events-none z-20" />
            </div>
        </CinematicViewport>
    );
};
