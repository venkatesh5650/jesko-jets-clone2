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

  const drawFrame = useCallback((
    canvas: HTMLCanvasElement,
    progress: number,
    options: { scale?: number, blur?: number } = {}
  ) => {
    if (images.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frameIndex = Math.min(
      frameCount - 1,
      Math.max(0, Math.floor(progress * (frameCount - 1)))
    );

    const img = images[frameIndex];
    if (!img || !img.complete) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = img.width;
    const imgHeight = img.height;

    // SMART SCALE LOGIC: Ensure top-to-bottom visibility
    const heightRatio = canvasHeight / imgHeight;
    let drawWidth = imgWidth * heightRatio;
    let drawHeight = canvasHeight;

    if (drawWidth < canvasWidth) {
      const widthRatio = canvasWidth / imgWidth;
      drawWidth = canvasWidth;
      drawHeight = imgHeight * widthRatio;
    }

    const finalScale = options.scale || 1;

    // Portrait Logic: If viewport is narrow, slightly counter the "cover" crop
    const isPortrait = canvasHeight > canvasWidth;
    const portraitAdjustment = isPortrait ? 0.85 : 1.0;

    drawWidth *= finalScale * portraitAdjustment;
    drawHeight *= finalScale * portraitAdjustment;

    const x = (canvasWidth - drawWidth) / 2;
    const y = (canvasHeight - drawHeight) / 2;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (options.blur) {
      ctx.filter = `blur(${options.blur}px)`;
    } else {
      ctx.filter = "none";
    }

    ctx.drawImage(img, x, y, drawWidth, drawHeight);
  }, [images, frameCount]);

  // Backward compatibility: renderFrame targets the internal ref
  const renderFrame = useCallback((progress: number, options: { scale?: number, blur?: number } = {}) => {
    if (canvasRef.current) {
      drawFrame(canvasRef.current, progress, options);
    }
  }, [drawFrame]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { canvasRef, isLoaded, renderFrame, drawFrame, images };
};
