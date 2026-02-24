"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface LoadingOverlayProps {
    isLoaded: boolean;
    onStart: () => void;
}

export const LoadingOverlay = ({ isLoaded, onStart }: LoadingOverlayProps) => {
    const [progress, setProgress] = useState(0);
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        if (isLoaded) {
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setShowButton(true);
                        return 100;
                    }
                    return prev + 2;
                });
            }, 30);
            return () => clearInterval(interval);
        } else {
            // Fake progress for visual feedback until actual load
            const interval = setInterval(() => {
                setProgress((prev) => (prev < 95 ? prev + 0.5 : prev));
            }, 100);
            return () => clearInterval(interval);
        }
    }, [isLoaded]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6 select-none"
            >
                {/* Cinematic Background Lines */}
                <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-neutral-500 to-transparent" />
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-neutral-500 to-transparent" />
                </div>

                <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-12 flex flex-col items-center"
                    >
                        <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic leading-none">
                            JESKO <span className="text-neutral-500">JETS</span>
                        </h1>
                        <div className="h-4 w-px bg-neutral-800 my-4" />
                        <h2 className="text-white text-[8px] tracking-[0.8em] uppercase font-light">
                            System Initialization
                        </h2>
                    </motion.div>

                    <div className="w-full h-px bg-neutral-900 relative overflow-hidden mb-4">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="absolute top-0 left-0 h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                        />
                    </div>

                    <div className="flex justify-between w-full text-[7px] tracking-[0.4em] text-neutral-500 uppercase font-mono">
                        <span>Core Sequence</span>
                        <span>{Math.round(progress)}%</span>
                    </div>

                    <div className="mt-20 h-16 flex items-center justify-center">
                        {showButton ? (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onStart}
                                className="group relative px-12 py-3 border border-neutral-800 text-white text-[10px] tracking-[0.6em] uppercase overflow-hidden"
                            >
                                <span className="relative z-10 group-hover:text-black transition-colors duration-500">
                                    Enter Experience
                                </span>
                                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                            </motion.button>
                        ) : (
                            <motion.div
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-neutral-600 text-[8px] tracking-[0.4em] uppercase font-light"
                            >
                                Syncing Aircraft Data...
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Technical Metadata Decoration */}
                <div className="absolute bottom-12 left-12 hidden md:block">
                    <div className="text-[6px] text-neutral-600 uppercase tracking-widest space-y-2 font-mono">
                        <p className="flex items-center gap-2"><span className="w-1 h-1 bg-green-500 rounded-full" /> Localization Active</p>
                        <p className="pl-3">Pos: 34.0522 N / 118.2437 W</p>
                        <p className="pl-3">Alt: FL350</p>
                    </div>
                </div>

                <div className="absolute bottom-12 right-12 hidden md:block">
                    <div className="text-[6px] text-neutral-600 uppercase tracking-widest space-y-2 font-mono text-right">
                        <p className="flex items-center justify-end gap-2">Network Layer Optimized <span className="w-1 h-1 bg-green-500 rounded-full" /></p>
                        <p className="pr-3">Jesko OS Interface v4.2.0</p>
                        <p className="pr-3">Status: Ready for Departure</p>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
