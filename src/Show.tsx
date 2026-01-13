import type { ReactNode } from "react";

export interface ShowProps<T> {
    /** Condition expression, renders children when truthy | 条件表达式，为真时渲染 children */
    when: T;
    /** Content to render when condition is truthy | 条件为真时渲染的内容 */
    children: ReactNode | ((value: NonNullable<T>) => ReactNode);
    /** Fallback content when condition is falsy | 条件为假时渲染的备选内容 */
    fallback?: ReactNode;
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
 */
export function Show<T>({ when, children, fallback = null }: ShowProps<T>): ReactNode {
    if (!when) {
        return fallback;
    }

    if (typeof children === "function") {
        return children(when as NonNullable<T>);
    }

    return children;
}
