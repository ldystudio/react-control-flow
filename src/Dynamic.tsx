import { type ComponentProps, type ComponentType, createElement, type ElementType, type ReactNode } from "react";

/** Get component props type | 获取组件的 props 类型 */
type PropsOf<T extends ElementType> = ComponentProps<T>;

export type DynamicProps<T extends ElementType> = {
    /** Component or element type to render | 要渲染的组件或元素类型 */
    component: T | null | undefined | false;
    /** Fallback content when component is falsy | 当 component 为 falsy 时渲染的备选内容 */
    fallback?: ReactNode;
} & PropsOf<T>;

/**
 * Dynamic component rendering, selects component type based on conditions
 *
 * 动态组件渲染，根据条件选择要渲染的组件类型
 *
 * @example
 * // Basic usage - select component based on condition | 基础用法 - 根据条件选择组件
 * <Dynamic component={isExternal ? 'a' : Link} href={url}>
 *   Click me
 * </Dynamic>
 *
 * @example
 * // Dynamic button or link | 动态选择按钮或链接
 * <Dynamic
 *   component={href ? 'a' : 'button'}
 *   href={href}
 *   onClick={onClick}
 * >
 *   {label}
 * </Dynamic>
 *
 * @example
 * // With custom components | 配合自定义组件
 * <Dynamic
 *   component={isAdmin ? AdminPanel : UserPanel}
 *   user={currentUser}
 * />
 *
 * @example
 * // Using fallback | 使用 fallback
 * <Dynamic component={customComponent} fallback={<DefaultComponent />}>
 *   Content
 * </Dynamic>
 *
 * @example
 * // React Native usage | React Native 中使用
 * <Dynamic
 *   component={isPressable ? Pressable : View}
 *   onPress={handlePress}
 *   style={styles.container}
 * >
 *   <Text>Content</Text>
 * </Dynamic>
 */
export function Dynamic<T extends ElementType>({ component, fallback = null, ...props }: DynamicProps<T>): ReactNode {
    if (!component) {
        return fallback;
    }

    return createElement(component as ComponentType, props);
}
