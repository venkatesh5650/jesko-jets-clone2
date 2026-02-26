/**
 * Smoothstep interpolation for high-end transitions
 */
export const smoothstep = (min: number, max: number, value: number) => {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
};

/**
 * Luxury cubic-bezier approximation: (0.65, 0, 0.35, 1)
 * This provides a heavy, slow-start, smooth-continuation feel.
 */
export const luxuryEase = (t: number) => {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2; // Refined for "premium" heavy feel
};

/**
 * Standard Ease In Out Cubic
 */
export const easeInOutCubic = (t: number) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

/**
 * High-End Ease In Out Expo (Apple/Tesla Style)
 */
export const easeInOutExpo = (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return t < 0.5
        ? Math.pow(2, 20 * t - 10) / 2
        : (2 - Math.pow(2, -20 * t + 10)) / 2;
};

/**
 * Interpolate scale and blur for shot continuity
 */
export const interpolateShot = (
    progress: number,
    start: number,
    end: number,
    options: {
        scale?: [number, number],
        opacity?: [number, number],
        blur?: [number, number]
    } = {}
) => {
    const t = Math.max(0, Math.min(1, (progress - start) / (end - start)));
    const eased = luxuryEase(t);

    const lerp = (a: number, b: number, factor: number) => a + (b - a) * factor;

    return {
        opacity: options.opacity ? lerp(options.opacity[0], options.opacity[1], eased) : 1,
        scale: options.scale ? lerp(options.scale[0], options.scale[1], eased) : 1,
        blur: options.blur ? lerp(options.blur[0], options.blur[1], eased) : 0,
    };
};
