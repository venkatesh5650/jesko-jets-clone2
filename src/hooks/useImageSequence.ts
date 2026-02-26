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
    let loadedCount = 0;

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const frameIndex = i.toString().padStart(3, "0");
      img.src = `/${folder}/${fileNamePrefix}${frameIndex}.${extension}`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          setIsLoaded(true);
        }
      };
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
    const targetWidth = img.naturalWidth;
    const targetHeight = img.naturalHeight;

    // Force backing store to match 8K source precision
    if (canvasRef.current.width !== targetWidth * dpr ||
      canvasRef.current.height !== targetHeight * dpr) {
      canvasRef.current.width = targetWidth * dpr;
      canvasRef.current.height = targetHeight * dpr;

      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset
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

    const img = images[frameIndex];
    if (!img || !img.complete) return;

    // Ensure canvas backing store matches this specific frame's 8K resolution
    const dpr = window.devicePixelRatio || 1;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    if (canvas.width !== naturalWidth * dpr || canvas.height !== naturalHeight * dpr) {
      canvas.width = naturalWidth * dpr;
      canvas.height = naturalHeight * dpr;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (ctx) ctx.scale(dpr, dpr);
    }

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Trigger aggressive prefetch
    prefetchBuffer(frameIndex);

    // V17 Rule: 1:1 Pixel Mapping
    // Since canvas = image resolution, we draw at total source size
    ctx.clearRect(0, 0, naturalWidth, naturalHeight);

    if (options.blur) {
      ctx.filter = `blur(${options.blur}px)`;
    } else {
      ctx.filter = "none";
    }

    // Centered 1:1 Draw
    ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);
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
