"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AntigravityButtonProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: "primary" | "secondary" | "outline";
}

export const AntigravityButton = ({
    children,
    onClick,
    className,
    variant = "outline"
}: AntigravityButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "group relative overflow-hidden transition-all duration-700 delay-[80ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                "cursor-pointer active:scale-[0.98]",
                "perspective-[1000px] transform-gpu",
                variant === "outline" && "px-8 py-3 bg-white/[0.04] backdrop-blur-md border border-white/[0.08] text-white/90 hover:border-white/20",
                "hover:-translate-y-1 hover:translate-z-2 hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.05)]",
                className
            )}
            style={{
                willChange: "transform, box-shadow, border-color"
            }}
        >
            {/* Subtle Metallic Glow Overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none" />

            <span className="relative z-10 text-[10px] tracking-[0.8em] uppercase font-extralight group-hover:text-white transition-colors duration-500">
                {children}
            </span>

            {/* Expansive Under-Glow (Very Subtle) */}
            <div className="absolute -inset-4 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.015)_0%,transparent_70%)] blur-3xl pointer-events-none" />
        </button>
    );
};
