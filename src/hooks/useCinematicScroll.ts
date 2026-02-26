"use client";

import { useEffect, useRef, useState } from "react";
import { easeInOutExpo } from "@/lib/motion";

export const useCinematicScroll = () => {
    const [progress, setProgress] = useState(0);
    const [isMission, setIsMission] = useState(false);
    const requestRef = useRef<number>(null);
    const isMissionRef = useRef(false);

    const scrollData = useRef({
        current: 0, // Lerped value
        target: 0,  // Real scroll value
    });

    useEffect(() => {
        const handleScroll = () => {
            if (!isMissionRef.current) {
                const scrollY = window.scrollY;
                const docHeight = Math.max(
                    document.documentElement.scrollHeight,
                    document.body.scrollHeight,
                    1
                );
                const winHeight = window.innerHeight;
                const height = docHeight - winHeight;
                scrollData.current.target = height > 0 ? Math.max(0, Math.min(1, scrollY / height)) : 0;
            }
        };

        const stopMission = () => {
            if (isMissionRef.current) {
                isMissionRef.current = false;
                setIsMission(false);
            }
        };

        const update = () => {
            const isMobile = window.innerWidth <= 768;

            // V23: LUXURY MOTION ENGINE
            if (isMissionRef.current) {
                const step = 0.00085;
                const nextTarget = Math.min(1, scrollData.current.target + step);
                scrollData.current.target = nextTarget;

                // Drive native scroll to keep listeners and overlays in sync
                const docHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, 1);
                const winHeight = window.innerHeight;
                const height = docHeight - winHeight;

                if (height > 0) {
                    window.scrollTo(0, nextTarget * height);
                }

                if (nextTarget >= 1) {
                    stopMission();
                }
            }

            const { current, target } = scrollData.current;

            // PHYSICS: inertialite (0.045) for mobile, frictionless (0.028) for desktop
            const damping = isMobile ? 0.045 : 0.028;
            const next = current + (target - current) * damping;

            scrollData.current.current = next;
            setProgress(next);

            requestRef.current = requestAnimationFrame(update);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("wheel", stopMission, { passive: true });
        // NOTE: touchstart listener removed to allow "autoMission" to start after first tap

        requestRef.current = requestAnimationFrame(update);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("wheel", stopMission);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const startMission = () => {
        // V23: Tap-Anywhere Start Delay (100ms)
        setTimeout(() => {
            window.scrollTo(0, 0);
            scrollData.current.target = 0;
            scrollData.current.current = 0;
            setProgress(0);
            isMissionRef.current = true;
            setIsMission(true);
        }, 100);
    };

    const scrollToSection = (p: number) => {
        const docHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, 1);
        const winHeight = window.innerHeight;
        const height = docHeight - winHeight;

        isMissionRef.current = false;
        setIsMission(false);

        window.scrollTo({
            top: height * p,
            behavior: "smooth" // V23: Ensure easeInOut travel
        });
    };

    return { progress, isMission, startMission, scrollToSection };
};
