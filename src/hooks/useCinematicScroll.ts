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
            // Only update target if mission IS NOT running.
            // When mission is running, the update() loop drives the scroll.
            if (!isMissionRef.current) {
                const scrollY = window.scrollY;
                const height = document.documentElement.scrollHeight - window.innerHeight;
                scrollData.current.target = Math.max(0, Math.min(1, scrollY / height));
            }
        };

        const stopMission = () => {
            if (isMissionRef.current) {
                isMissionRef.current = false;
                setIsMission(false);
            }
        };

        const update = () => {
            const docHeight = document.documentElement.scrollHeight;
            const winHeight = window.innerHeight;
            const height = docHeight - winHeight;

            if (isMissionRef.current) {
                // Luxury speed: Slow, intentional crawl
                const nextTarget = Math.min(1, scrollData.current.target + 0.00085);
                scrollData.current.target = nextTarget;

                // V21: Programmatic scroll that bypasses simple event listener loops
                window.scrollTo(0, nextTarget * height);

                if (nextTarget >= 1) {
                    stopMission();
                }
            }

            const { current, target } = scrollData.current;
            // Damping adjusted for a "frictionless" floating feel
            const damping = 0.028;
            const next = current + (target - current) * damping;

            scrollData.current.current = next;
            setProgress(next);

            requestRef.current = requestAnimationFrame(update);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("wheel", stopMission, { passive: true });
        // V21: Mobile Stability - Don't kill mission on first touch/click
        // Only kill if user actively scrolls (wheel) or starts a gesture elsewhere.
        // We remove touchstart/mousedown to prevent immediate kill on mobile "Enter"

        requestRef.current = requestAnimationFrame(update);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("wheel", stopMission);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const startMission = () => {
        // Full Reset: Instant jump to top
        window.scrollTo(0, 0);
        scrollData.current.target = 0;
        scrollData.current.current = 0;
        setProgress(0);
        isMissionRef.current = true;
        setIsMission(true);
    };

    const scrollToSection = (p: number) => {
        const height = document.documentElement.scrollHeight - window.innerHeight;
        isMissionRef.current = false;
        setIsMission(false);
        // Instant scroll triggers handleScroll which sets target. 
        // LERP then smoothly interpolates. This unifies click and scroll.
        window.scrollTo({
            top: height * p,
            behavior: "auto"
        });
    };

    return { progress, isMission, startMission, scrollToSection };
};
