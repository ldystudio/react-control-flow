import type { ReactNode } from "react";

export interface ShowProps<T> {
    /** Condition expression, renders children when truthy | 条件表达式，为真时渲染 children */
    when: T;
    /** Content to render when condition is truthy | 条件为真时渲染的内容 */
    children: ReactNode | ((value: NonNullable<T>) => ReactNode);
    /** Fallback content when condition is falsy | 条件为假时渲染的备选内容 */
    fallback?: ReactNode;
    /** Callback when condition is falsy (called before rendering fallback) | 条件为假时的回调（在渲染 fallback 之前调用） */
    onFallback?: () => void;
}

/**
 * Conditional rendering component, replaces ternary expressions in JSX
 *
 * 条件渲染组件，用于替代 JSX 中的三元表达式
 *
 * @example
 * // Basic usage | 基础用法
 * <Show when={isLoggedIn}>
 *   <UserProfile />
 * </Show>
 *
 * @example
 * // With fallback | 带 fallback
 * <Show when={isLoggedIn} fallback={<LoginButton />}>
 *   <UserProfile />
 * </Show>
 *
 * @example
 * // Using render props for type-safe value access | 使用 render props 获取类型安全的值
 * <Show when={user}>
 *   {(user) => <UserProfile name={user.name} />}
 * </Show>
 *
 * @example
 * // With onFallback callback for side effects | 带 onFallback 回调用于副作用
 * <Show when={isAuthenticated} fallback={<Loading />} onFallback={() => navigate('/login')}>
 *   <Dashboard />
 * </Show>
 */
export function Show<T>({ when, children, fallback = null, onFallback }: ShowProps<T>): ReactNode {
    if (!when || isEmpty(when)) {
        onFallback?.();
        return fallback;
    }

    if (typeof children === "function") {
        return children(when as NonNullable<T>);
    }

    return children;
}

function isEmpty(value: unknown): boolean {
    if (Array.isArray(value)) return value.length === 0;
    if (value instanceof Map || value instanceof Set) return value.size === 0;
    if (typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype) {
        return Object.keys(value).length === 0;
    }
    return false;
}
