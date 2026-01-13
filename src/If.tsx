import type { ReactNode } from "react";

export interface IfProps<T> {
    /** 条件表达式，为真时渲染 children */
    condition: T;
    /** 条件为真时渲染的内容 */
    children: ReactNode | ((value: NonNullable<T>) => ReactNode);
    /** 条件为假时渲染的备选内容 */
    fallback?: ReactNode;
}

/**
 * 条件渲染组件，用于替代 JSX 中的三元表达式
 *
 * @example
 * // 基础用法
 * <If condition={isLoggedIn}>
 *   <UserProfile />
 * </If>
 *
 * @example
 * // 带 fallback
 * <If condition={isLoggedIn} fallback={<LoginButton />}>
 *   <UserProfile />
 * </If>
 *
 * @example
 * // 使用 render props 获取类型安全的值
 * <If condition={user}>
 *   {(user) => <UserProfile name={user.name} />}
 * </If>
 */
export function If<T>({ condition, children, fallback = null }: IfProps<T>): ReactNode {
    if (!condition) {
        return fallback;
    }

    if (typeof children === "function") {
        return children(condition as NonNullable<T>);
    }

    return children;
}
