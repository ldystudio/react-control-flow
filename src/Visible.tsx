import { type ReactNode, useEffect, useRef, useState } from "react";

export interface VisibleProps {
    /** Content to render when visible | 可见时渲染的内容 */
    children: ReactNode;
    /** Fallback content before entering viewport | 进入视口前渲染的备选内容 */
    fallback?: ReactNode;
    /** Root margin for intersection observer (e.g., "100px") | 交叉观察器的根边距 */
    rootMargin?: string;
    /** Visibility threshold (0-1) | 可见性阈值 */
    threshold?: number | number[];
    /** Keep rendered after first visible (default: true) | 首次可见后保持渲染 */
    once?: boolean;
    /** Callback when visibility changes | 可见性变化时的回调 */
    onVisibilityChange?: (isVisible: boolean) => void;
}

/**
 * Visibility-based rendering component using IntersectionObserver (Web only)
 *
 * 基于可见性的渲染组件，使用 IntersectionObserver（仅 Web）
 *
 * In React Native or environments without IntersectionObserver,
 * children will be rendered directly (graceful degradation).
 *
 * 在 React Native 或不支持 IntersectionObserver 的环境中，
 * 会直接渲染 children（优雅降级）。
 *
 * @example
 * // Basic usage - render when entering viewport | 基础用法 - 进入视口时渲染
 * <Visible>
 *   <HeavyComponent />
 * </Visible>
 *
 * @example
 * // With fallback placeholder | 带占位符
 * <Visible fallback={<Skeleton />}>
 *   <Image src={url} />
 * </Visible>
 *
 * @example
 * // Preload before entering viewport | 提前预加载
 * <Visible rootMargin="200px" fallback={<Placeholder />}>
 *   <LazyImage />
 * </Visible>
 *
 * @example
 * // Toggle visibility (once=false) | 切换可见性
 * <Visible once={false} onVisibilityChange={(v) => console.log(v)}>
 *   <VideoPlayer />
 * </Visible>
 */
export function Visible({
    children,
    fallback = null,
    rootMargin = "0px",
    threshold = 0,
    once = true,
    onVisibilityChange,
}: VisibleProps): ReactNode {
    const [isVisible, setIsVisible] = useState(false);
    const [hasBeenVisible, setHasBeenVisible] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Check if IntersectionObserver is available
    const isSupported = typeof window !== "undefined" && typeof IntersectionObserver !== "undefined";

    useEffect(() => {
        // Mark as client-side rendered
        setIsClient(true);
    }, []);

    useEffect(() => {
        // Only run on client side
        if (!isClient) return;

        // If not supported, render children directly
        if (!isSupported) {
            setIsVisible(true);
            setHasBeenVisible(true);
            return;
        }

        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry) {
                    const visible = entry.isIntersecting;
                    setIsVisible(visible);
                    onVisibilityChange?.(visible);

                    if (visible) {
                        setHasBeenVisible(true);
                        if (once) {
                            observer.disconnect();
                        }
                    }
                }
            },
            { rootMargin, threshold }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [isClient, isSupported, rootMargin, threshold, once, onVisibilityChange]);

    // SSR or non-supported environment: render children directly (SEO friendly)
    if (!isClient) {
        return children;
    }

    // Non-supported environment after hydration: render children directly
    if (!isSupported) {
        return children;
    }

    const shouldRender = once ? hasBeenVisible : isVisible;

    return <div ref={ref}>{shouldRender ? children : fallback}</div>;
}
