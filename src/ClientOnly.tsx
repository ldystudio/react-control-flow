import { type ReactNode, useEffect, useState } from 'react';

export interface ClientOnlyProps {
    /** Content to render only on client side | 仅在客户端渲染的内容 */
    children: ReactNode | (() => ReactNode);
    /** Fallback content during SSR | SSR 期间渲染的备选内容 */
    fallback?: ReactNode;
}

/**
 * Component that renders children only on the client side (after hydration)
 *
 * 仅在客户端（hydration 之后）渲染子元素的组件
 *
 * Useful for components that rely on browser APIs, window object,
 * or need to avoid SSR hydration mismatches.
 *
 * 适用于依赖浏览器 API、window 对象的组件，
 * 或需要避免 SSR hydration 不匹配的场景。
 *
 * @example
 * // Basic usage | 基础用法
 * <ClientOnly>
 *   <BrowserOnlyComponent />
 * </ClientOnly>
 *
 * @example
 * // With fallback for SSR | 带 SSR 备选内容
 * <ClientOnly fallback={<Skeleton />}>
 *   <DynamicChart />
 * </ClientOnly>
 *
 * @example
 * // Using render function for lazy evaluation | 使用渲染函数延迟求值
 * <ClientOnly fallback={<Loading />}>
 *   {() => <ComponentUsingWindow width={window.innerWidth} />}
 * </ClientOnly>
 *
 * @example
 * // Avoid hydration mismatch | 避免 hydration 不匹配
 * <ClientOnly fallback={<span>--:--</span>}>
 *   <CurrentTime />
 * </ClientOnly>
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps): ReactNode {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return fallback;
    }

    if (typeof children === 'function') {
        return children();
    }

    return children;
}
