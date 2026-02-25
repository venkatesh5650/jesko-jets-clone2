"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface NavbarOverlayProps {
    progress: number;
    isMission: boolean;
    startMission: () => void;
    scrollToSection: (progress: number) => void;
}

export const NavbarOverlay = ({ progress, isMission, startMission, scrollToSection }: NavbarOverlayProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { label: "Mission", action: startMission },
        { label: "DYNAMICS", progress: 0.00, id: "dynamics" },
        { label: "INTERIOR", progress: 0.52, id: "interior" },
        { label: "NETWORK", progress: 0.82, id: "network" },
    ];

    // activeSection strictly tracks progress categories (Flight, Engineering, etc.)
    const activeSection = navItems.reduce((acc, item, index) => {
        return (item.progress !== undefined && progress >= item.progress - 0.05) ? index : acc;
    }, 1);

    const handleMobileClick = (item: typeof navItems[0]) => {
        if (item.action) {
            item.action();
        } else {
            scrollToSection(item.progress!);
        }
        setIsMenuOpen(false);
    };

    return (
        <>
            <nav className="fixed top-0 left-0 w-full h-16 flex justify-between items-center px-6 md:px-12 z-[3000] pointer-events-auto">
                {/* Background with Blur */}
                <div className="absolute inset-0 bg-black/15 backdrop-blur-xl border-b border-white/5" />

                {/* Left: Logo */}
                <button
                    onClick={() => {
                        scrollToSection(0);
                        setIsMenuOpen(false);
                    }}
                    className="nav-button relative font-light tracking-[0.4em] text-white/90 text-sm md:text-base cursor-pointer group z-[3100]"
                >
                    AERODYN
                </button>

                {/* Right: Desktop Nav Items */}
                <div className="relative hidden md:flex gap-12 items-center h-full">
                    {navItems.map((item, index) => {
                        const isMissionButton = index === 0;
                        const isHighlight = isMissionButton ? isMission : activeSection === index;
                        const showUnderline = !isMissionButton && activeSection === index;

                        return (
                            <button
                                key={item.label}
                                onClick={() => item.action ? item.action() : scrollToSection(item.progress!)}
                                className={`nav-button relative text-[10px] tracking-[0.3em] uppercase transition-all duration-500 h-full flex items-center cursor-pointer ${isHighlight ? "text-white opacity-100" : "text-white/50 hover:text-white/80"
                                    }`}
                            >
                                <span className="relative z-10 transition-transform duration-500 flex items-center h-full">
                                    {item.label}
                                </span>

                                {/* Persistent Progress Underline */}
                                <div
                                    className={`absolute bottom-0 left-0 w-full h-[1px] bg-white transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${showUnderline ? "scale-x-100" : "scale-x-0"
                                        }`}
                                />
                            </button>
                        )
                    })}
                </div>

                {/* Mobile Menu Icon */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="relative md:hidden flex flex-col gap-1.5 pointer-events-auto cursor-pointer z-[3100] group w-8 h-8 items-end justify-center"
                >
                    <div className={cn(
                        "h-[1px] bg-white/80 transition-all duration-500 ease-out",
                        isMenuOpen ? "w-6 -rotate-45 translate-y-[3.5px]" : "w-6"
                    )} />
                    <div className={cn(
                        "h-[1px] bg-white/80 transition-all duration-500 ease-out",
                        isMenuOpen ? "w-6 rotate-45 -translate-y-[3.5px]" : "w-4"
                    )} />
                </button>
            </nav>

            {/* Full Screen Mobile Overlay */}
            <div className={cn(
                "fixed inset-0 z-[2900] bg-black/95 backdrop-blur-2xl md:hidden transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]",
                isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
            )}>
                <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
                    {navItems.map((item, index) => {
                        const isMissionButton = index === 0;
                        const isHighlight = isMissionButton ? isMission : activeSection === index;

                        return (
                            <button
                                key={item.label}
                                onClick={() => handleMobileClick(item)}
                                className={cn(
                                    "relative text-2xl tracking-[0.4em] uppercase font-extralight transition-all duration-700",
                                    isHighlight ? "text-white scale-110" : "text-white/40 grayscale",
                                    isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                                )}
                                style={{ transitionDelay: `${index * 50}ms` }}
                            >
                                {item.label}
                                {isHighlight && (
                                    <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)] animate-pulse" />
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Footer Info in Menu */}
                <div className={cn(
                    "absolute bottom-12 left-0 w-full text-center transition-all duration-700 delay-300",
                    isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}>
                    <p className="text-[10px] tracking-[0.5em] text-white/20 uppercase font-light">
                        Aerodynamic Excellence // 2026
                    </p>
                </div>
            </div>

            <style jsx>{`
                .nav-button {
                    transition: all 0.35s cubic-bezier(0.65, 0, 0.35, 1);
                }
                .nav-button:hover {
                    transform: translateY(-2px);
                    letter-spacing: 0.35em;
                }
                .nav-button::after {
                    content: "";
                    position: absolute;
                    left: 0;
                    bottom: 12px;
                    width: 100%;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.9);
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.35s cubic-bezier(0.65, 0, 0.35, 1);
                    pointer-events: none;
                }
                .nav-button:hover::after {
                    transform: scaleX(1);
                }
            `}</style>
        </>
    );
};
