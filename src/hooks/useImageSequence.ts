"use client";

import { useEffect, useState, useCallback, useRef } from "react";

export const useImageSequence = (
  folder: string,
  fileNamePrefix: string,
  frameCount: number,
  extension: string = "jpg"
) => {
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const preloadImages = useCallback(() => {
    const loadedImages: HTMLImageElement[] = [];
    let processedCount = 0;

    // V22 ADAPTIVE DENSITY: Load fewer frames on mobile to prevent memory crash
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const step = isMobile ? 3 : 1;

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const frameIndex = i.toString().padStart(3, "0");

      // Only set src for frames we want to load based on density step
      if ((i - 1) % step === 0) {
        img.src = `/${folder}/${fileNamePrefix}${frameIndex}.${extension}`;

        img.onload = () => {
          processedCount++;
          if (processedCount >= Math.ceil(frameCount / step)) {
            setIsLoaded(true);
          }
        };

        img.onerror = () => {
          console.warn(`Frame fail: ${frameIndex}`);
          processedCount++; // Still count as processed to allow app to start
          if (processedCount >= Math.ceil(frameCount / step)) {
            setIsLoaded(true);
          }
        };
      }
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, [folder, fileNamePrefix, frameCount, extension]);

  useEffect(() => {
    preloadImages();
  }, [preloadImages]);

  // Rule 2 & Performance: Frame Prefetch Buffer (±8 frames)
  // Ensures high-resolution frames are hot in GPU memory.
  const prefetchIndex = useRef(-1);
  const prefetchBuffer = (index: number) => {
    if (index === prefetchIndex.current) return;
    prefetchIndex.current = index;

    // Aggressive ±8 range for 8K stability
    const start = Math.max(0, index - 8);
    const end = Math.min(frameCount - 1, index + 8);

    for (let i = start; i <= end; i++) {
      const img = images[i];
      if (img && !img.complete) {
        // Priority load for upcoming frames
        const tempSrc = img.src;
        img.src = tempSrc;
      }
    }
  };

  // V17 HARD CLARITY LOCK: Native-Resolution Canvas Engine
  const resizeToImage = useCallback((img: HTMLImageElement) => {
    if (!canvasRef.current || !img.complete) return;

    const dpr = window.devicePixelRatio || 1;
    const isMobile = window.innerWidth <= 768;
    const maxDimension = isMobile ? 2048 : 7680;

    let naturalWidth = img.naturalWidth;
    let naturalHeight = img.naturalHeight;

    const scaleFactor = Math.min(1, maxDimension / Math.max(naturalWidth, naturalHeight));
    const targetWidth = Math.floor(naturalWidth * scaleFactor);
    const targetHeight = Math.floor(naturalHeight * scaleFactor);

    if (canvasRef.current.width !== targetWidth * dpr ||
      canvasRef.current.height !== targetHeight * dpr) {
      canvasRef.current.width = targetWidth * dpr;
      canvasRef.current.height = targetHeight * dpr;

      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }
    }
  }, []);

  const drawFrame = useCallback((
    canvas: HTMLCanvasElement,
    progress: number,
    options: { scale?: number, blur?: number } = {}
  ) => {
    if (images.length === 0) return;

    const frameIndex = Math.min(
      frameCount - 1,
      Math.max(0, Math.floor(progress * (frameCount - 1)))
    );

    // V22: Find nearest loaded frame if current was skipped
    let img = images[frameIndex];
    if (!img || !img.src) {
      // Find previous loaded frame as fallback
      for (let j = frameIndex; j >= 0; j--) {
        if (images[j] && images[j].src) {
          img = images[j];
          break;
        }
      }
    }

    if (!img || !img.complete || !img.src) return;

    // Ensure canvas backing store matches this specific frame's resolution
    // V20 MOBILE OPTIMIZATION: Cap resolution on small screens to prevent GPU crash
    const dpr = window.devicePixelRatio || 1;
    const isMobile = window.innerWidth <= 768;
    const maxDimension = isMobile ? 2048 : 7680; // Cap at 2K for mobile, 8K for desktop

    let naturalWidth = img.naturalWidth;
    let naturalHeight = img.naturalHeight;

    const scaleFactor = Math.min(1, maxDimension / Math.max(naturalWidth, naturalHeight));
    const targetWidth = Math.floor(naturalWidth * scaleFactor);
    const targetHeight = Math.floor(naturalHeight * scaleFactor);

    if (canvas.width !== targetWidth * dpr || canvas.height !== targetHeight * dpr) {
      canvas.width = targetWidth * dpr;
      canvas.height = targetHeight * dpr;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (ctx) ctx.scale(dpr, dpr);
    }

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Trigger aggressive prefetch
    prefetchBuffer(frameIndex);

    // Centered Draw with scaling
    ctx.clearRect(0, 0, targetWidth, targetHeight);

    if (options.blur) {
      ctx.filter = `blur(${options.blur}px)`;
    } else {
      ctx.filter = "none";
    }

    // Centered Scaled Draw
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  }, [images, frameCount]);

  // Backward compatibility: renderFrame targets the internal ref
  const renderFrame = useCallback((progress: number, options: { scale?: number, blur?: number } = {}) => {
    if (canvasRef.current) {
      drawFrame(canvasRef.current, progress, options);
    }
  }, [drawFrame]);

  // V17 Component-Level Resize (Stabilization)
  useEffect(() => {
    const handleResize = () => {
      // In V17, we resize based on image data in drawFrame, 
      // but we maintain the container's optical size here.
      if (canvasRef.current) {
        canvasRef.current.style.width = "100%";
        canvasRef.current.style.height = "100%";
        canvasRef.current.style.objectFit = "cover"; // V18: Smart Hybrid Framing
        canvasRef.current.style.objectPosition = "center";
        canvasRef.current.style.imageRendering = "crisp-edges"; // V19: Clarity Priority
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { canvasRef, isLoaded, renderFrame, drawFrame, images };
};
