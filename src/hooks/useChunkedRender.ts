import { useState, useEffect } from 'react';

/**
 * A hook that progressively reveals items in an array to avoid blocking the main thread
 * when rendering large lists of complex components.
 * 
 * @param items The full array of items to render
 * @param chunkSize How many items to add per frame/tick
 * @param delayMs Optional delay between chunks (0 uses requestAnimationFrame for fastest non-blocking render)
 * @returns Array of currently visible items
 */
export function useChunkedRender<T>(items: T[], chunkSize: number = 5, delayMs: number = 0): T[] {
    const [renderCount, setRenderCount] = useState(chunkSize);

    // Reset when items array changes
    useEffect(() => {
        setRenderCount(chunkSize);
    }, [items, chunkSize]);

    useEffect(() => {
        if (renderCount >= items.length) return;

        let timerId: ReturnType<typeof setTimeout> | number;

        if (delayMs > 0) {
            timerId = setTimeout(() => {
                setRenderCount(prev => Math.min(prev + chunkSize, items.length));
            }, delayMs);
            return () => clearTimeout(timerId as ReturnType<typeof setTimeout>);
        } else {
            // Use requestAnimationFrame for smoother rendering across frames
            timerId = requestAnimationFrame(() => {
                // Nested requestAnimationFrame to let the browser paint first
                const innerTimer = requestAnimationFrame(() => {
                    setRenderCount(prev => Math.min(prev + chunkSize, items.length));
                });
                // In cleanup we can't easily cancel the inner timer if it has already fired,
                // but React's cleanup handles the outer one.
            });
            return () => cancelAnimationFrame(timerId as number);
        }
    }, [renderCount, items.length, chunkSize, delayMs]);

    return items.slice(0, renderCount);
}

export default useChunkedRender;
