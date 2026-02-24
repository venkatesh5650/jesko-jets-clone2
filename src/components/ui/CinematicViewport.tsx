"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CinematicViewportProps {
    children: ReactNode;
    className?: string;
    zIndex?: number;
}

export const CinematicViewport = ({
    children,
    className,
    zIndex = 0
}: CinematicViewportProps) => {
    return (
        <div
            className={cn(
                "fixed inset-0 w-full h-full overflow-hidden pointer-events-none",
                className
            )}
            style={{ zIndex }}
        >
            <div className="relative w-full h-full flex items-center justify-center">
                {children}
            </div>
        </div>
    );
};
