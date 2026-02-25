"use client";

import { useCinematicScroll } from "@/hooks/useCinematicScroll";
import { useImageSequence } from "@/hooks/useImageSequence";
import { HeroScroll } from "@/components/sections/HeroScroll";
import { PlaneMorph } from "@/components/sections/PlaneMorph";
import { Globe } from "@/components/sections/Globe";

import { NavbarOverlay } from "@/components/ui/NavbarOverlay";
import { HeadingOverlay } from "@/components/ui/HeadingOverlay";
import { HudOverlay } from "@/components/ui/HudOverlay";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useState, useEffect } from "react";

export default function Home() {
  const { progress, isMission, startMission, scrollToSection } = useCinematicScroll();
  const [hasStarted, setHasStarted] = useState(false);

  const heroSequence = useImageSequence(
    "Sequence1",
    "ezgif-frame-",
    120
  );

  const morphSequence = useImageSequence(
    "sequence2updated",
    "ezgif-frame-",
    120
  );

  const isAllLoaded = heroSequence.isLoaded && morphSequence.isLoaded;

  // Prevent scroll when loading overlay is active
  useEffect(() => {
    if (!hasStarted) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [hasStarted]);

  return (
    <main className="relative bg-black w-full" style={{ height: "800vh" }}>
      {!hasStarted && (
        <LoadingOverlay
          isLoaded={isAllLoaded}
          onStart={() => {
            setHasStarted(true);
            startMission(); // Auto-start cinematic mission on enter
          }}
        />
      )}

      {/* 
        The sections are now absolutely stacked and controlled 
        by the central progress value.
      */}
      {/* Hidden Navigation Anchors */}
      <div id="experience" className="absolute top-0 h-px w-px pointer-events-none" />
      <div id="dynamics" className="absolute top-0 h-px w-px pointer-events-none" />
      <div id="interior" className="absolute top-[416vh] h-px w-px pointer-events-none" /> {/* 0.52 * 800 */}
      <div id="network" className="absolute top-[656vh] h-px w-px pointer-events-none" /> {/* 0.82 * 800 */}

      <div className="fixed inset-0 w-full h-full overflow-hidden">
        <HeroScroll progress={progress} sequence={heroSequence} />
        <PlaneMorph progress={progress} sequence={morphSequence} />
        <Globe progress={progress} />
      </div>

      {/* Cockpit HUD Layers */}
      <NavbarOverlay
        progress={progress}
        isMission={isMission}
        startMission={startMission}
        scrollToSection={scrollToSection}
      />
      <HeadingOverlay progress={progress} />
      <HudOverlay progress={progress} />

      {/* Global Cinematic Filter Overlay - Reduced for clarity */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-5 mix-blend-soft-light bg-neutral-900" />
    </main>
  );
}
